import { useState, useEffect, useCallback } from "react";
import { supabase } from "/lib/supabaseClient";

const useMatchData = (matchId) => {
  const [branding, setBranding] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeGames, setActiveGames] = useState([]);

  // Fetch active match based on matchId
  const fetchActiveMatch = useCallback(async () => {
    if (!matchId) return null;

    const { data, error } = await supabase
      .from("matches")
      .select("*, user_id") // Include user_id to get the match creator
      .eq("id", matchId)
      .single();

    if (error) {
      console.error("Error fetching match:", error);
      return null;
    }

    return data;
  }, [matchId]);

  // Fetch branding based on the match creator's user_id
  const fetchBranding = useCallback(async (userId) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("branding")
      .select("*")
      .eq("user_id", userId)
      .eq("active_branding", true)
      .single();

    if (error) {
      console.error("Error fetching branding:", error);
      return null;
    }

    return data;
  }, []);

  // Fetch game stats for a given match
  const fetchGamesForMatch = useCallback(async (matchId) => {
    if (!matchId) return [];

    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("match_id", matchId)
      .order("game_number", { ascending: true });

    if (error) {
      console.error("Error fetching games:", error);
      return [];
    }

    return data;
  }, []);

  // Load active match, branding, and game data
  useEffect(() => {
    const loadMatchData = async () => {
      const match = await fetchActiveMatch();
      if (match) {
        setActiveMatch(match);

        // Fetch branding based on the match creator
        const brandingData = await fetchBranding(match.user_id);
        setBranding(brandingData);

        const games = await fetchGamesForMatch(match.id);
        setActiveGames(games);
      }
    };

    loadMatchData();
  }, [fetchActiveMatch, fetchBranding, fetchGamesForMatch]);

  // Real-time updates
  useEffect(() => {
    if (!activeMatch?.id) return;

    const matchChannel = supabase
      .channel("match_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches", filter: `id=eq.${activeMatch.id}` },
        (payload) => {
          console.log("Match updated:", payload);
          fetchActiveMatch().then(setActiveMatch);
        }
      )
      .subscribe();

    const gameChannel = supabase
      .channel("game_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_stats", filter: `match_id=eq.${activeMatch.id}` },
        (payload) => {
          console.log("Game updated:", payload);
          fetchGamesForMatch(activeMatch.id).then(setActiveGames);
        }
      )
      .subscribe();

    return () => {
      matchChannel.unsubscribe();
      gameChannel.unsubscribe();
    };
  }, [activeMatch?.id, fetchActiveMatch, fetchGamesForMatch]);

  return { branding, activeMatch, activeGames };
};

export default useMatchData;
