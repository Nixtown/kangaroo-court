import { useEffect, useState, useMemo } from "react";
import { supabase } from "/lib/supabaseClient";
import { useRouter } from "next/router";
import Autocomplete from "@mui/material/Autocomplete";
import FormField from "/pagesComponents/pages/account/components/FormField";

import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Switch from "@mui/material/Switch";
import React from "react";

const CreateMatch = () => {
  const router = useRouter();

  // Default match settings if no preset exists yet.
  const defaultMatchData = {
    best_of: 3,
    tournament_name: "OPPL SEASON 2 | ELARE BROADCAST",
    match_title: "Center Court: Round of 8",
    team_a_name: "Tulsa Titans",
    team_b_name: "PB Tulsa",
    created_by: "11111111-1111-1111-1111-111111111111",
    active_match: true,
    current_game: 1,
  };

  // State for match settings and game settings
  const [matchData, setMatchData] = useState(defaultMatchData);

  // Default game conditions (same for every game by default)
  const defaultGameConditions = useMemo(() => ({
    first_to_points: 11,
    win_by: 2,
    scoring_type: "Regular",
    win_on_serve: false,
    point_cap: 0,
    game_title: "Open Doubles",
  }), []);

  // State for game settings; initialize an array with length equal to best_of
  const [gameData, setGameData] = useState(
    Array.from({ length: defaultMatchData.best_of }, () => ({ ...defaultGameConditions }))
  );

  // Update gameData when best_of changes
  useEffect(() => {
    setGameData(Array.from({ length: matchData.best_of }, () => ({ ...defaultGameConditions })));
  }, [matchData.best_of, defaultGameConditions]);

  // Helper function to update a specific game field
  const updateGameField = (index, field, value) => {
    setGameData(prev =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  // Fetch the latest match preset (if any) and use it as default settings
  const fetchLatestPreset = async () => {
    const { data, error } = await supabase
      .from("match_presets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching latest preset:", error);
      return;
    }
    if (data && data.preset_data) {
      // Preset data should contain both match settings and game settings.
      const preset = data.preset_data;
      setMatchData(preset.matchData || preset); // If preset has nested structure
      if (preset.gameData) {
        setGameData(preset.gameData);
      }
    }
  };

  // Load latest preset when component mounts.
  useEffect(() => {
    fetchLatestPreset();
  }, []);

  // Handle form field changes for matchData.
  const handleChange = (field, value) => {
    setMatchData(prev => ({ ...prev, [field]: value }));
  };

  /// Create Match in Supabase ///
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Set all matches to inactive
    await supabase
      .from("matches")
      .update({ active_match: false })
      .neq("active_match", false);

    // Step 2: Insert matchData into the 'matches' table.
    const { data, error } = await supabase
      .from("matches")
      .insert(matchData)
      .select();

    if (error) {
      console.error("Error inserting match:", error);
      return;
    }
    console.log("Inserted match:", data);

    if (data && data.length > 0) {
      const matchId = data[0].id;

      // Prepare gameData for insertion into 'game_stats'
      const gamesToInsert = gameData.map((game, index) => ({
        match_id: matchId,
        game_number: index + 1,
        first_to_points: game.first_to_points,
        win_by: game.win_by,
        scoring_type: game.scoring_type,
        win_on_serve: game.win_on_serve,
        point_cap: game.point_cap,
        server: 2,  // default server
        game_title: game.game_title,
      }));

      // Insert gameData into 'game_stats' table
      const { data: gameResponse, error: gameError } = await supabase
        .from("game_stats")
        .insert(gamesToInsert)
        .select();

      if (gameError) {
        console.error("Error inserting game data:", gameError);
      } else {
        console.log("Inserted game data:", gameResponse);
      }

    // Save the current match settings (including game settings) as a preset.
    const presetPayload = {
        preset_data: {
        matchData,
        gameData,
        },
    };
    
    // First, check if a preset exists.
    const { data: existingPreset, error: presetQueryError } = await supabase
        .from("match_presets")
        .select("*")
        .limit(1)
        .maybeSingle();
    
    if (presetQueryError) {
        console.error("Error fetching preset:", presetQueryError);
    } else if (existingPreset) {
        // Update the existing preset (the first row)
        const { data: presetData, error: presetError } = await supabase
        .from("match_presets")
        .update(presetPayload)
        .eq("id", existingPreset.id)
        .select();
    
        if (presetError) {
        console.error("Error updating preset:", presetError);
        } else {
        console.log("Preset updated:", presetData);
        }
    } else {
        // No preset exists; insert a new one.
        const { data: presetData, error: presetError } = await supabase
        .from("match_presets")
        .insert(presetPayload)
        .select();
    
        if (presetError) {
        console.error("Error inserting preset:", presetError);
        } else {
        console.log("Preset inserted:", presetData);
        }
    }

      // Step 4: Redirect to match controller
      router.push("/app/rally-controller");
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
                <MDTypography variant="h5">Match Information</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Tournament Name"
                  value={matchData.tournament_name}
                  required
                  onChange={(e) => handleChange("tournament_name", e.target.value)}
                  inputProps={{ type: "text", autoComplete: "" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Match Title"
                  value={matchData.match_title}
                  required
                  onChange={(e) => handleChange("match_title", e.target.value)}
                  inputProps={{ type: "text", autoComplete: "" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Team (A) Name"
                  value={matchData.team_a_name}
                  required
                  onChange={(e) => handleChange("team_a_name", e.target.value)}
                  inputProps={{ type: "text", autoComplete: "" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Team (B) Name"
                  value={matchData.team_b_name}
                  required
                  onChange={(e) => handleChange("team_b_name", e.target.value)}
                  inputProps={{ type: "text", autoComplete: "" }}
                />
              </Grid>
              <Grid item xs={12} sm={2} md={2}>
                <MDInput
                  fullWidth
                  label="Best Of"
                  value={matchData.best_of}
                  required
                  onChange={(e) => {
                    const newValue = Math.min(7, Math.max(1, parseInt(e.target.value, 10) || 1));
                    handleChange("best_of", newValue);
                  }}
                  inputProps={{ type: "number", autoComplete: "" }}
                />
              </Grid>
            </Grid>

            {/* Mapping section for game settings */}
            {gameData.map((game, index) => (
              <Grid container spacing={3} pt={3} pb={3} px={3} key={game.id || game.game_number || index}>
                <Grid item xs={12} sm={12}>
                  <Grid container sx={{ bgcolor: "#f1f5ff", paddingLeft: "0px", borderRadius: "0.4rem" }}>
                    <MDTypography variant="body">
                      Game: {index + 1}
                    </MDTypography>
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
                <Grid item xs={12} sm={12}>
                  <MDInput
                    fullWidth
                    label="Game Title"
                    value={game.game_title}
                    required
                    onChange={(e) => updateGameField(index, "game_title", e.target.value)}
                    inputProps={{ type: "text", autoComplete: "" }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    value={game.scoring_type}
                    onChange={(event, newValue) => updateGameField(index, "scoring_type", newValue)}
                    options={["Regular", "Rally"]}
                    renderInput={(params) => (
                      <FormField {...params} label="Scoring Type" required InputLabelProps={{ shrink: true }} />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MDInput
                    fullWidth
                    label="First to Points"
                    value={game.first_to_points}
                    required
                    onChange={(e) => updateGameField(index, "first_to_points", parseInt(e.target.value, 10))}
                    inputProps={{ type: "number", autoComplete: "" }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MDInput
                    fullWidth
                    label="Win By"
                    value={game.win_by}
                    required
                    onChange={(e) => updateGameField(index, "win_by", parseInt(e.target.value, 10))}
                    inputProps={{ type: "number", autoComplete: "" }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MDInput
                    fullWidth
                    label="Point Cap"
                    value={game.point_cap}
                    required
                    onChange={(e) => updateGameField(index, "point_cap", parseInt(e.target.value, 10))}
                    inputProps={{ type: "number", autoComplete: "" }}
                  />
                </Grid>
              </Grid>
            ))}

            <Grid container spacing={3} pt={3} pl={3}>
              <Grid item xs={12} sm={12}>
                <MDButton variant="gradient" color="dark" fullWidth type="submit">
                  Create Match
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};

export default CreateMatch;