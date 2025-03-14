import { useEffect, useState, useMemo } from "react";
import { supabase } from "/lib/supabaseClient";
import { useRouter } from "next/router";
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Switch from "@mui/material/Switch";
import { toast } from "react-toastify";
import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import FormField from "/pagesComponents/pages/account/components/FormField";


const EditMatch = () => {
  const router = useRouter();
  const { match_id } = router.query; // Get match_id from the URL

  // Default game conditions
  const defaultGameConditions = useMemo(() => ({
    first_to_points: 11,
    win_by: 2,
    scoring_type: "Regular",
    win_on_serve: false,
    point_cap: 0,
    game_title: "Open Doubles",
  }), []);

  // State for match and game settings
  const [matchData, setMatchData] = useState({});
  const [gameData, setGameData] = useState([defaultGameConditions]);

  // Fetch current match and games on component mount
  useEffect(() => {
    if (!match_id) {
      console.log("match_id is not available yet");
      return; // Wait for match_id to be available
    }

    console.log("Fetching match data for match_id:", match_id);

    const fetchMatchData = async () => {
      console.log("Starting to fetch match data...");

      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", match_id)
        .single();
      
      if (error) {
        console.error("Error fetching match data:", error);
        return;
      }

      console.log("Match data fetched:", data);
      setMatchData(data);

      console.log("Fetching game data...");
      const { data: games, error: gamesError } = await supabase
        .from("game_stats")
        .select("*")
        .eq("match_id", match_id);

      if (gamesError) {
        console.error("Error fetching game data:", gamesError);
        return;
      }

      console.log("Game data fetched:", games);

      // Use fetched games data or default game data if no games exist
      const initialGameData = games.length > 0 ? games : Array.from({ length: data.best_of }, () => ({ ...defaultGameConditions }));
      console.log("Initial game data:", initialGameData);
      setGameData(initialGameData);
    };

    fetchMatchData();
  }, [match_id]); // Dependency on match_id

  // Update game field
  const updateGameField = (index, field, value) => {
    setGameData(prev => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  // Handle match data changes
  const handleMatchChange = (field, value) => {
    setMatchData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!matchData.best_of) return; // Prevent updates if matchData is not yet loaded
  
    setGameData(prev => {
      const currentLength = prev.length;
      const newBestOf = matchData.best_of;
      if (newBestOf === currentLength) {
        return prev;
      } else if (newBestOf < currentLength) {
        // Remove extra games without changing the ones that already exist
        return prev.slice(0, newBestOf);
      } else {
        // If newBestOf is greater than the current length, append new game objects.
        // (Only the new games are created with default conditions.)
        const additionalGames = Array.from(
          { length: newBestOf - currentLength },
          () => ({ ...defaultGameConditions })
        );
        return [...prev, ...additionalGames];
      }
    });
  }, [matchData.best_of]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }
  
    // Merge user_id into matchData
    const matchDataWithUser = { ...matchData, user_id: user.id };
  
    // Insert or update the match in 'matches'
    const { data, error } = await supabase
      .from("matches")
      .upsert([matchDataWithUser], { onConflict: ["id"] })
      .select();
    if (error) {
      console.error("Error inserting match:", error);
      return;
    }
    console.log("Inserted match:", data);
  
    if (data && data.length > 0) {
      const matchId = data[0].id;
      
          // Delete extra games if necessary
    const { data: existingGames, error: fetchGamesError } = await supabase
    .from("game_stats")
    .select("*")
    .eq("match_id", matchId);
    if (fetchGamesError) {
    console.error("Error fetching existing games:", fetchGamesError);
    return;
    }

    // Log the games before deletion
    console.log("Existing games before deletion:", existingGames);

    // If the number of games exceeds the new `best_of`, delete the extra games
    if (existingGames.length > matchData.best_of) {
    const extraGames = existingGames.slice(matchData.best_of); // Games to delete
    console.log("Games to delete:", extraGames); // Log the games being deleted

    const { error: deleteError } = await supabase
      .from("game_stats")
      .delete()
      .in("id", extraGames.map(game => game.id)); // Delete extra games

    if (deleteError) {
      console.error("Error deleting extra games:", deleteError);
      return;
    }

    // Log the successful deletion (no data, but we know it worked based on status: 204)
    console.log(`Successfully deleted ${extraGames.length} extra games.`);
    }

    // After deleting the extra games, proceed with inserting/updating the remaining games
    const gamesToInsert = gameData.map((game, index) => ({
    match_id: matchId,
    game_number: index + 1,
    first_to_points: game.first_to_points,
    win_by: game.win_by,
    scoring_type: game.scoring_type,
    win_on_serve: game.win_on_serve,
    point_cap: game.point_cap,
    server: 2, // default server
    game_title: game.game_title,
    }));

    // Insert or update the game data in 'game_stats'
    const { data: gameResponse, error: gameError } = await supabase
    .from("game_stats")
    .upsert(gamesToInsert, { onConflict: ["match_id", "game_number"] })
    .select();
    if (gameError) {
    console.error("Error inserting game data:", gameError);
    } else {
    console.log("Inserted game data:", gameResponse);
    }
  
      // Redirect to match controller
      router.push(`/app/rally-controller/${matchId}`);
    }
  };
  

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Card sx={{ width: "100%" }}>
          <MDBox component="form" pb={3} px={3} onSubmit={handleSubmit}>
            <Grid container spacing={3} pt={3}>
              <Grid item xs={12}>
                <MDTypography variant="h5">Edit Match Information</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Tournament Name"
                  value={matchData.tournament_name || ""}
                  onChange={(e) => handleMatchChange("tournament_name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Match Title"
                  value={matchData.match_title || ""}
                  onChange={(e) => handleMatchChange("match_title", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Team (A) Name"
                  value={matchData.team_a_name || ""}
                  onChange={(e) => handleMatchChange("team_a_name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Team (B) Name"
                  value={matchData.team_b_name || ""}
                  onChange={(e) => handleMatchChange("team_b_name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <MDInput
                  fullWidth
                  label="Best Of"
                  value={matchData.best_of || 3}
                  onChange={(e) => handleMatchChange("best_of", Math.min(7, Math.max(1, parseInt(e.target.value, 10))))}
                  required
                  inputProps={{ type: "number" }}
                />
              </Grid>
            </Grid>

            {/* Mapping section for game settings */}
            {gameData.map((game, index) => (
              <Grid container spacing={3} pt={3} pb={3} px={0} key={game.id || game.game_number || index}>
                <Grid item xs={12} sm={12}>
                  <Grid container sx={{ bgcolor: "#f1f5ff", padding: "6px", borderRadius: "0.4rem" }}>
                    <MDTypography variant="subtitle2">
                      Game: {index + 1}
                    </MDTypography>
                    
                    {/* Display Rally Settings */}
                    {game.scoring_type === "Rally" && (
                      <MDBox display="flex" justifyContent={{ md: "flex-start" }} alignItems="center" lineHeight={1}>
                        <MDBox ml={1}>
                          <Switch 
                            checked={game.win_on_serve}
                            onChange={(e) => updateGameField(index, "win_on_serve", e.target.checked)}
                          />
                        </MDBox>
                        <MDTypography variant="caption" fontWeight="regular">
                          {game.win_on_serve ? "Win Only On Serve" : "No Serve Condition"}
                        </MDTypography>
                      </MDBox>
                    )}
                  </Grid>
                </Grid>

                {/* Game Title */}
                <Grid item xs={12} sm={12}>
                  <MDInput
                    fullWidth
                    label="Game Title"
                    value={game.game_title || ""} // Add fallback value in case it's undefined
                    required
                    onChange={(e) => updateGameField(index, "game_title", e.target.value)}
                    inputProps={{ type: "text", autoComplete: "" }}
                  />
                </Grid>

                {/* Scoring Type */}
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    value={game.scoring_type || "Regular"} // Ensure default value
                    onChange={(event, newValue) => updateGameField(index, "scoring_type", newValue)}
                    options={["Regular", "Rally"]}
                    renderInput={(params) => (
                      <FormField {...params} label="Scoring Type" required InputLabelProps={{ shrink: true }} />
                    )}
                  />
                </Grid>

                {/* First to Points */}
                <Grid item xs={12} sm={3}>
                  <MDInput
                    fullWidth
                    label="First to Points"
                    value={game.first_to_points || ""} // Ensure it's not undefined
                    required
                    onChange={(e) => updateGameField(index, "first_to_points", parseInt(e.target.value, 10))}
                    inputProps={{ type: "number", autoComplete: "" }}
                  />
                </Grid>

                {/* Win By */}
                <Grid item xs={12} sm={3}>
                  <MDInput
                    fullWidth
                    label="Win By"
                    value={game.win_by || ""} // Ensure it's not undefined
                    required
                    onChange={(e) => updateGameField(index, "win_by", parseInt(e.target.value, 10))}
                    inputProps={{ type: "number", autoComplete: "" }}
                  />
                </Grid>

                {/* Point Cap */}
                <Grid item xs={12} sm={3}>
                  <MDInput
                    fullWidth
                    label="Point Cap"
                    value={game.point_cap === 0 ? "0" : game.point_cap}
                    required
                    onChange={(e) => updateGameField(index, "point_cap", parseInt(e.target.value, 10))}
                    inputProps={{ type: "number", autoComplete: "" }}
                  />
                </Grid>
              </Grid>
            ))}


            <Grid container spacing={3} pt={3}>
              <Grid item xs={12}>
                <MDButton variant="gradient" color="dark" fullWidth type="submit">
                  Save Changes
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};

export default EditMatch;
