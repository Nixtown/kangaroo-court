import BasicScoreBoard from "/pagesComponents/scoreboard/basic-scoreboard";
import IntermissionScoreboard from "/pagesComponents/scoreboard/intermission-scoreboard";
import MDBox from "/components/MDBox";
import useMatchData from "/hooks/useMatchData";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "/lib/supabaseClient";

export default function ScoreboardOutput() {
  const router = useRouter();
  const { scoreboardType, token_id } = router.query; // Extract type and token from URL
  const [matchId, setMatchId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndActiveMatch = async () => {
      if (!token_id) return;

      // Step 1: Get user_id from overlay_token
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("overlay_token", token_id)
        .single();

      if (userError || !userData) {
        console.error("Error fetching user by overlay_token:", userError);
        return;
      }

      setUserId(userData.id); // Store userId for real-time updates

      // Step 2: Get active match for that user
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("id")
        .eq("user_id", userData.id)
        .eq("active_match", true)
        .single();

      if (matchError || !matchData) {
        console.error("Error fetching active match:", matchError);
        return;
      }

      setMatchId(matchData.id);
    };

    fetchUserAndActiveMatch();
  }, [token_id]);

  useEffect(() => {
    if (!userId) return;

    console.log("Listening for all matches from user:", userId);

    const matchChannel = supabase
      .channel(`match_channel_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("Match update detected:", payload);

          const { data: activeMatch, error: activeMatchError } = await supabase
            .from("matches")
            .select("id")
            .eq("user_id", userId)
            .eq("active_match", true)
            .single();

          if (activeMatchError || !activeMatch) {
            console.log("No active match found.");
            setMatchId(null);
          } else {
            console.log("New active match found:", activeMatch.id);
            setMatchId(activeMatch.id);
          }
        }
      )
      .subscribe();

    return () => {
      matchChannel.unsubscribe();
    };
  }, [userId]);

  // Fetch match data for the active match
  const { branding, activeMatch, activeGames } = useMatchData(matchId);

  // **Conditionally render the correct scoreboard**
  const renderScoreboard = () => {
    switch (scoreboardType) {
      case "basic":
        return <MDBox sx={{
          filter: "drop-shadow(0 0 5px rgba(0,0,0,0.3))",
          margin: "70px 0 0 120px"
        }}>
          <BasicScoreBoard branding={branding} activeMatch={activeMatch} activeGames={activeGames} />
        </MDBox>
      case "intermission":
        return <IntermissionScoreboard branding={branding} activeMatch={activeMatch} activeGames={activeGames} />;
      default:
        return <BasicScoreBoard branding={branding} activeMatch={activeMatch} activeGames={activeGames} />;
    }
  };

  return (
    <MDBox id="ScoreBody">
      {renderScoreboard()}
    </MDBox>
  );
}

ScoreboardOutput.noSidenav = true;
