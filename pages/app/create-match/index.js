
import { useEffect, useState } from "react";
import { supabase } from '/lib/supabaseClient';
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
import React, { useMemo } from 'react';





const CreateMatch = () => {

    
    const [matchData, setMatchData] = useState({
        best_of: 3,
        tournament_name: "OPPL SEASON 2 | ELARE BROADCAST",
        match_title: "Center Court: Round of 8",
        team_a_name: "Tulsa Titans",
        team_b_name: "PB Tulsa",
        created_by: "11111111-1111-1111-1111-111111111111",
        active_match: true, 
        current_game: 1,
    });

    const defaultGameConditions = useMemo(() => ({
        first_to_points: 11,
        win_by: 2,
        scoring_type: "Regular",
        win_on_serve: false,
        point_cap: 0,
        game_title: "Open Doubles",
      }), []);
      

    const selectData = {
        scoreType: [
          "Regular",
          "Rally",
        ]
    };

    const router = useRouter();

 
    // Initialize gameData as an array of game objects.
    const [gameData, setGameData] = useState(
        Array.from({ length: matchData.best_of }, () => ({ ...defaultGameConditions }))
    );
    // Initialize gameData as an array of game objects.
    useEffect(() => {
        setGameData(Array.from({ length: matchData.best_of }, () => ({ ...defaultGameConditions })));
      }, [matchData.best_of, defaultGameConditions]);

    // A helper function to update a specific game field.
    // index is the game index, field is the key, and value is the new value.
    const updateGameField = (index, field, value) => {
        setGameData(prev =>
        prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
        );
    };
    
    /// Create Match in SupaBase ///
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Step 1: Set all matches to inactive
        await supabase.from("matches").update({ active_match: false }).neq("active_match", false);

        // Insert the matchData object into the 'matches' table.
        const { data, error } = await supabase
        .from('matches')
        .insert(matchData)
        .select(); // .select() returns the inserted rows so you can verify the insertion

        if (error) {
        console.error('Error inserting match:', error);
        } else {
        console.log('Inserted match:', data);

        // ----- NEW CODE ADDED BELOW -----
        // Ensure that we have an inserted match record
        if (data && data.length > 0) {
            // Extract the generated match ID
            const matchId = data[0].id;

            // Prepare the gameData with additional keys for the foreign key relationship
            const gamesToInsert = gameData.map((game, index) => ({
            match_id: matchId,          // Associate each game with the inserted match
            game_number: index + 1,       // Number each game (starting at 1)
            first_to_points: game.first_to_points,
            win_by: game.win_by,
            scoring_type: game.scoring_type,
            win_on_serve: game.win_on_serve,
            point_cap: game.point_cap,
            server: 2,
            game_title: game.game_title
            }));

            // Insert the gameData array into the 'game_stats' table
            const { data: gameResponse, error: gameError } = await supabase
            .from('game_stats')
            .insert(gamesToInsert)
            .select();

            if (gameError) {
            console.error('Error inserting game data:', gameError);
            } else {
            console.log('Inserted game data:', gameResponse);
            router.push('/app/rally-controller');
            }
        }
        // ----- END OF NEW CODE -----
        }
    };


    return (
        <DashboardLayout>
            <DashboardNavbar />
                <MDBox>
                    <Card id="incriment-games" sx={{ width: "100%" } }>
                        {/* -------------- ***************** -------------- */}
                        {/* -------------- ***************** -------------- */}

                        {/* -------------- Start of the Form -------------- */}

                        {/* -------------- ***************** -------------- */}
                        {/* -------------- ***************** -------------- */}
                        <MDBox
                            component="form"
                            pb={3}
                            px={3}
                            onSubmit={handleSubmit}
                        >
                            <Grid container spacing={3} pt={3}>
                                <Grid item xs={12} sm={12}>
                                    <MDTypography variant="h5">
                                        Match Information
                                    </MDTypography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDInput
                                    fullWidth
                                    label="Tournament Name"
                                    value={matchData.tournament_name}
                                    required
                                    onChange={e =>
                                        setMatchData({ ...matchData, tournament_name: e.target.value})
                                        }
                                    inputProps={{ type: "text", autoComplete: "" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDInput
                                    fullWidth
                                    label="Match Title"
                                    value={matchData.match_title}
                                    required
                                    onChange={e =>
                                        setMatchData({ ...matchData, match_title: e.target.value})
                                        }
                                    inputProps={{ type: "text", autoComplete: "" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDInput
                                    fullWidth
                                    label="Team (A) Name"
                                    value={matchData.team_a_name}
                                    required
                                    onChange={e =>
                                        setMatchData({ ...matchData, team_a_name: e.target.value})
                                        }
                                    inputProps={{ type: "text", autoComplete: "" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDInput
                                    fullWidth
                                    label="Team (B) Name"
                                    value={matchData.team_b_name}
                                    required
                                    onChange={e =>
                                        setMatchData({ ...matchData, team_b_name: e.target.value})
                                        }
                                    inputProps={{ type: "text", autoComplete: "" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2} md={2}>
                                    <MDInput
                                    fullWidth
                                    label="Best Of"
                                    value={matchData.best_of}
                                    required
                                    onChange={e => {
                                        const newValue = Math.min(7, Math.max(1, parseInt(e.target.value, 10) || 1));
                                        setMatchData({ ...matchData, best_of: newValue });
                                      }}
                                    inputProps={{ type: "number", autoComplete: "" }}
                                    />
                                </Grid>
                           
                            {/* ////// *************************** ///// */}

                            {/* ////// This is the mapping section ///// */}

                            {/* ////// *************************** ///// */}
                        {gameData.map((game, index) => (
                            <Grid container spacing={3} pt={3} pb={3} px={3} key={game.id || game.game_number || index}>
                                <Grid item xs={12} sm={12}>
                                <Grid container  sx={{bgcolor:"#f1f5ff", paddingLeft: "0px", borderRadius: "0.4rem"}}>
                                    <MDTypography variant="body" >
                                        Game: {index + 1}
                                    </MDTypography>
                                           {/* Only show the "Win On Serve" switch if scoring_type is NOT "Rally" */}

                                 {game.scoring_type === "Rally" && (
                            
                                    <MDBox
                                    display="flex"
                                    justifyContent={{ md: "flex-start" }}
                                    alignItems="center"
                                    lineHeight={1}
                                    >
                                    
                                    <MDBox ml={1}>
                                        <Switch 
                                            checked={game.win_on_serve}
                                            onChange={(e) =>
                                              updateGameField(index, 'win_on_serve', e.target.checked)
                                            }
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
                                        onChange={(e) =>
                                            updateGameField(index, 'game_title', e.target.value)
                                          }
                                        inputProps={{ type: "text", autoComplete: "" }}
                                    />
                                </Grid>
                         
                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        value={game.scoring_type} // controlled value
                                        onChange={(event, newValue) =>
                                            updateGameField(index, 'scoring_type', newValue)
                                        }
                                        options={selectData.scoreType}
                                        renderInput={(params) => (
                                            <FormField
                                            {...params}
                                            label="Scoring Type"
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <MDInput
                                        fullWidth
                                        label="First to Points"
                                        value={game.first_to_points}
                                        required
                                        onChange={(e) =>
                                            updateGameField(index, 'first_to_points', parseInt(e.target.value, 10))
                                          }
                                        inputProps={{ type: "number", autoComplete: "" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <MDInput
                                        fullWidth
                                        label="Win By"
                                        value={game.win_by}
                                        required
                                        onChange={(e) =>
                                            updateGameField(index, 'win_by', parseInt(e.target.value, 10))
                                          }
                                        inputProps={{ type: "number", autoComplete: "" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <MDInput
                                        fullWidth
                                        label="Point Cap"
                                        value={game.point_cap}
                                        required
                                        onChange={(e) =>
                                            updateGameField(index, 'point_cap', parseInt(e.target.value, 10))
                                          }
                                        inputProps={{ type: "number", autoComplete: "" }}
                                    />
                                </Grid>
                            </Grid>
                        ))}
                            {/* ////// *************************** ///// */}

                            {/* ////// End Mapping ///// */}

                            {/* ////// *************************** ///// */}

                            <Grid container spacing={3} pt={3} pl={3}>
                                <Grid item xs={12} sm={12}>
                                    <MDButton
                                        variant="gradient"
                                        color="dark"
                                        fullWidth
                                        type="submit"
                                    >
                                        Create Match
                                    </MDButton>
                                </Grid>
                            </Grid>
                            </Grid>
                        </MDBox>
                    </Card>
                </MDBox>
        </DashboardLayout>
    );
    }
    export default CreateMatch;