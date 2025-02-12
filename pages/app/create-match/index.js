
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import { supabase } from '/lib/supabaseClient';
import { useState } from "react";
import { useRouter } from "next/router";
import Autocomplete from "@mui/material/Autocomplete";
import FormField from "/pagesComponents/pages/account/components/FormField";




const CreateMatch = () => {

    const [tournamentName, setTournamentName] = useState("Elare Pickleball Broadcast");
    const [matchTitle, setMatchTitle] = useState("Championship Court");
    const [teamA, setTeamA] = useState("Team A");
    const [teamB, setTeamB] = useState("Team B");
    const [firstToPoints, setFirstToPoints] = useState("11");
    const [winBy, setWinBy] = useState("2");
    const [bestOf, setBestOf] = useState("5");
    const [scoringType, setScoringType] = useState("Regular");
    const [finalGameFirstTo, setFinalGameFirstTo] = useState("11");
    const [finaleGameWinBy, setFinaleGameWinBy] = useState("2");
    const [finalGameScoringType, setFinalGameScoringType] = useState("Regular");
    const [pointCap, setPointCap] = useState("0");
    const [finalGamePointCap, setFinalGamePointCap] = useState("0");
    const [winOnServe, setWinOnServe] = useState(false);
    const [finalGameWinOnServe, setFinalGameWinOnServe] = useState(false);

    const TEMP_USER_ID = "11111111-1111-1111-1111-111111111111"; // Temporary UUID
    const router = useRouter();

    const selectData = {
      scoreType: [
        "Regular",
        "Rally",
      ]
    };
 
    const createMatch = async () => {

         // Step 1: Set all matches to inactive
         await supabase.from("matches").update({ active_match: false }).neq("active_match", false);


        const { data, error } = await supabase
          .from("matches")
          .insert([
            {
              tournament_name: tournamentName,
              match_title: matchTitle,
              team_a_name: teamA,
              team_b_name: teamB,
              created_by: TEMP_USER_ID, // Use fixed user ID
              active_match: true, // ✅ This match becomes the active match
              current_game: 1, // ✅ Every match starts at Game 1
              server: 2,
              first_to_points: firstToPoints,
              win_by: winBy,
              best_of: bestOf,
              scoring_type: scoringType,
              win_on_serve: winOnServe,
              point_cap: pointCap,
              final_game_first_to: finalGameFirstTo,
              final_game_win_by: finaleGameWinBy,
              final_game_scoring_type: finalGameScoringType,
              final_game_point_cap: finalGamePointCap,
              final_game_win_on_serve: finalGameWinOnServe
            },
          ])
          .select("*"); // Ensures we return the inserted match
      
        if (error) {
          console.error("Error creating match:", error);
        } else {
          console.log("Match created successfully:", data);
        }

        const matchId = data[0].id; // Get the newly created match ID

        const { error: gameError } = await supabase.from("game_stats").insert([
            {
              match_id: matchId,
              game_number: 1, // First game
              team_a_score: 0,
              team_b_score: 0,
              team_a_game_points: 0,
              team_b_game_points: 0,
              team_a_match_points: 0,
              team_b_match_points: 0,
            },
        ]);

        if (gameError) {
            console.error("Error creating first game:", gameError);
          } else {
            console.log("First game created successfully for match ID:", matchId);
        }

        // ✅ Redirect to the new page
        router.push("/app/rally-controller");

      };
    
    return (
        <DashboardLayout>
          <DashboardNavbar />
            <MDBox>
              <MDBox mt={3}>
                <Card id="incriment-games" sx={{ width: "100%" } }>
                  <MDBox
                    component="form"
                    pb={3}
                    px={3}
                    onSubmit={(e) => {
                        e.preventDefault(); // Prevent page reload
                        createMatch();
                      }}
                  >
                    <MDBox pt={3} pb={3} >
                      <MDTypography variant="h5">
                          Basic Event Information
                      </MDTypography>
                    </MDBox>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <MDInput
                            fullWidth
                            label="Tournament Name"
                            value={tournamentName}
                            required
                            onChange={(e) => {
                                setTournamentName(e.target.value);
                              }}
                            inputProps={{ type: "text", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MDInput
                            fullWidth
                            label="Match Title"
                            value={matchTitle}
                            required
                            onChange={(e) => setMatchTitle(e.target.value)}
                            inputProps={{ type: "text", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MDInput
                            fullWidth
                            label="(A) Team Name"
                            value={teamA}
                            required
                            onChange={(e) => setTeamA(e.target.value)}
                            inputProps={{ type: "text", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MDInput
                            fullWidth
                            label="(B) Team Name"
                            value={teamB}
                            required
                            onChange={(e) => setTeamB(e.target.value)}
                            inputProps={{ type: "text", autoComplete: "" }}
                            /> 
                  </Grid>
                    <MDBox p={3} >
                      <MDTypography variant="h5">
                          Win Conditions
                      </MDTypography>
                    </MDBox>
                    <Grid container spacing={3} pl={3}>
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          value={scoringType} // controlled value
                          onChange={(event, newValue) => {
                            // newValue will be the selected option
                            setScoringType(newValue);
                          }}
                          defaultValue="Regular"
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
                      <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="Best Of"
                            value={bestOf}
                            required
                            onChange={(e) => setBestOf(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                          </Grid>
                        <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="First to Points"
                            value={firstToPoints}
                            required
                            onChange={(e) => setFirstToPoints(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="Win By"
                            value={winBy}
                            required
                            onChange={(e) => setWinBy(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="Point Cap"
                            value={pointCap}
                            required
                            onChange={(e) => setPointCap(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="Win On Serve"
                            value={winOnServe}
                            required
                            onChange={(e) => setWinOnServe(e.target.value)}
                            inputProps={{ type: "text", autoComplete: "" }}
                            />
                        </Grid>
                    </Grid>
                    <MDBox p={3} >
                      <MDTypography variant="h5">
                          Final Game Conditions
                      </MDTypography>
                    </MDBox>
                    <Grid container spacing={3} pl={3}>
                          <Grid item xs={12} sm={4}>
                            <Autocomplete
                              value={finalGameScoringType} // controlled value
                              onChange={(event, newValue) => {
                                // newValue will be the selected option
                                setFinalGameScoringType(newValue);
                              }}
                              defaultValue="Regular"
                              options={selectData.scoreType}
                              renderInput={(params) => (
                                <FormField
                                  {...params}
                                  label="Final Game Scoring Type"
                                  required
                                  InputLabelProps={{ shrink: true }}
                                />
                              )}
                            />
                          </Grid>
                        <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="Final Game First To"
                            value={finalGameFirstTo}
                            required
                            onChange={(e) => setFinalGameFirstTo(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MDInput
                            fullWidth
                            label="Final Game Win By"
                            value={finaleGameWinBy}
                            required
                            onChange={(e) => setFinaleGameWinBy(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MDInput
                            fullWidth
                            label="Final Game Point Cap"
                            value={finalGamePointCap}
                            required
                            onChange={(e) => setFinalGamePointCap(e.target.value)}
                            inputProps={{ type: "number", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MDInput
                            fullWidth
                            label="Final Game Win On Serve"
                            value={finalGameWinOnServe}
                            required
                            onChange={(e) => setFinalGameWinOnServe(e.target.value)}
                            inputProps={{ type: "text", autoComplete: "" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
          </MDBox>
        </DashboardLayout>
      );
    }

    export default CreateMatch;