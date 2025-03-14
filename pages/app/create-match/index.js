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
import { toast } from "react-toastify";

const CreateMatch = () => {
  const router = useRouter();

  // Default match settings
  const defaultMatchData = {
    best_of: 3,
    tournament_name: "OPPL SEASON 2 | ELARE BROADCAST",
    match_title: "Center Court: Round of 8",
    team_a_name: "Tulsa Titans",
    team_b_name: "PB Tulsa",
    current_game: 1,
  };

  // State for match settings and preset name
  const [matchData, setMatchData] = useState(defaultMatchData);
  const [presetName, setPresetName] = useState("");
  const [presetId, setPresetId] = useState("");
  const [presetLoaded, setPresetLoaded] = useState(false); // Flag to prevent overwriting preset gameData

  // Default game conditions
  const defaultGameConditions = useMemo(() => ({
    first_to_points: 11,
    win_by: 2,
    scoring_type: "Regular",
    win_on_serve: false,
    point_cap: 0,
    game_title: "Open Doubles",
  }), []);

  // State for game settings; initialize based on defaultMatchData.best_of
  const [gameData, setGameData] = useState(
    Array.from({ length: defaultMatchData.best_of }, () => ({ ...defaultGameConditions }))
  );

  // State for match presets (loaded from DB)
  const [matchPresets, setMatchPresets] = useState([]);

    // Combined logic: update gameData when best_of changes only if a preset hasn't been loaded.

  useEffect(() => {
    if (!presetLoaded) {
      setGameData(prev => {
        const currentLength = prev.length;
        const newBestOf = matchData.best_of;
        if (newBestOf === currentLength) {
          return prev;
        } else if (newBestOf < currentLength) {
          // Remove extra games without overwriting the ones already present.
          return prev.slice(0, newBestOf);
        } else {
          // Append additional games using default conditions.
          const additionalGames = Array.from(
            { length: newBestOf - currentLength },
            () => ({ ...defaultGameConditions })
          );
          return [...prev, ...additionalGames];
        }
      });
    }
  }, [matchData.best_of, presetLoaded, defaultGameConditions]);

  // Helper: update a specific game field
  const updateGameField = (index, field, value) => {
    setGameData((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  // Handle form field changes for matchData
  const handleChange = (field, value) => {
    setMatchData((prev) => ({ ...prev, [field]: value }));
    // If the user manually changes best_of, reset presetLoaded to rebuild gameData from defaults.
    if (field === "best_of") {
      setPresetLoaded(false);
    }
  };

  // Fetch the latest preset for the current user and apply it to state
  useEffect(() => {
    const fetchActivePreset = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data, error } = await supabase
        .from("match_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Error fetching latest preset:", error);
        return;
      }
      if (data && data.preset_data) {
        console.log("Preset data (raw):", data.preset_data);
        let preset;
        if (typeof data.preset_data === "string") {
          try {
            preset = JSON.parse(data.preset_data);
          } catch (e) {
            console.error("Error parsing preset_data:", e);
            return;
          }
        } else {
          preset = data.preset_data;
        }
        console.log("Parsed preset:", preset);
        setMatchData(preset.matchData || preset);
        if (preset.gameData) {
          setGameData(preset.gameData);
          setPresetName(data.preset_name);
          setPresetId(data.id);
          setPresetLoaded(true);
        }
      }
    };

    fetchActivePreset();
  }, []);

  // Fetch all match presets for the current user to populate the dropdown
  useEffect(() => {
    const fetchMatchPresets = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data, error } = await supabase
        .from("match_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching match presets:", error);
      } else {
        setMatchPresets(data || []);
      }
    };

    fetchMatchPresets();
  }, []);

  // When a preset is selected from the dropdown, update state with its data.
  const handlePresetChange = (event, newValue) => {
    if (newValue && newValue.preset_data) {
      let preset;
      if (typeof newValue.preset_data === "string") {
        try {
          preset = JSON.parse(newValue.preset_data);
        } catch (e) {
          console.error("Error parsing preset_data:", e);
          return;
        }
      } else {
        preset = newValue.preset_data;
      }
  
      setMatchData(preset.matchData || preset);
      if (preset.gameData) {
        setGameData(preset.gameData);
        setPresetName(newValue.preset_name);
        setPresetId(newValue.id);
        setPresetLoaded(true);
      }
    }
  };

  /// Create Match in Supabase ///
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

    // Insert new match into 'matches'
    const { data, error } = await supabase
      .from("matches")
      .insert(matchDataWithUser)
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
        server: 2, // default server
        game_title: game.game_title,
      }));
      // Insert gameData
      const { data: gameResponse, error: gameError } = await supabase
        .from("game_stats")
        .insert(gamesToInsert)
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

  // Function to save current match settings as a new preset
  const saveAsPreset = async () => {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }
    // Build preset payload using presetName and current matchData/gameData
    const presetPayload = {
      preset_name: presetName,
      user_id: user.id,
      is_active: true,
      preset_data: {
        matchData,
        gameData,
      },
    };

    await supabase
      .from("match_presets")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Insert new preset
    const { data, error } = await supabase
      .from("match_presets")
      .insert(presetPayload)
      .select();
    if (error) {
      console.error("Error creating preset:", error);
      if (error.code === "23505") {
        toast.error("Preset name already taken.");
      } else {
        toast.error("Error creating preset");
      }
    } else {
      console.log("Preset created:", data);
      toast.success("Preset created successfully");
      // Optionally, refresh the presets list:
      setMatchPresets((prev) => [data[0], ...prev]);
    }
  };

  const savePreset = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }

    const NewPreset = {
      preset_name: presetName,
      user_id: user.id,
      id: presetId,
      is_active: true,
      preset_data: {
        matchData,
        gameData,
      },
    };

    await supabase
      .from("match_presets")
      .update({ is_active: false })
      .eq("user_id", user.id);

    const { data: updatedPreset, error: updateError } = await supabase
      .from("match_presets")
      .update(NewPreset)
      .eq("id", NewPreset.id)
      .select();
    if (updateError) {
      console.error("Error updating preset:", updateError);
    } else {
      console.log("Preset updated:", updatedPreset);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Card sx={{ width: "100%" }}>
          <MDBox component="form" pb={3} px={3}>
            <Grid container spacing={3} pt={3}>
              <Grid item xs={12}>
                <MDTypography variant="h5">Match Information</MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={matchPresets}
                  getOptionLabel={(option) =>
                    option.preset_name || new Date(option.updated_at).toLocaleString()
                  }
                  onChange={handlePresetChange}
                  renderInput={(params) => (
                    <MDInput {...params} label="Load Match Preset" InputLabelProps={{ shrink: true }} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  fullWidth
                  label="Preset Name"
                  value={presetName}
                  required
                  onChange={(e) => setPresetName(e.target.value)}
                  inputProps={{ type: "text", autoComplete: "" }}
                />
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
              <Grid item xs={12} sm={2}>
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
              <Grid container spacing={3} pt={3} pb={3} px={0} key={game.id || game.game_number || index}>
                <Grid item xs={12} sm={12}>
                  <Grid container sx={{ bgcolor: "#f1f5ff", padding: "6px", borderRadius: "0.4rem" }}>
                    <MDTypography variant="subtitle2">
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
                <MDButton onClick={handleSubmit} variant="gradient" color="dark" fullWidth>
                  Create Match
                </MDButton>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDButton onClick={savePreset} variant="gradient" color="dark" fullWidth>
                  Save Preset
                </MDButton>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDButton onClick={saveAsPreset} variant="gradient" color="dark" fullWidth>
                  Save as New Preset
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
