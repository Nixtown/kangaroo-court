
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




const CreateMatch = () => {

    const [tournamentName, setTournamentName] = useState("");
    const [matchTitle, setMatchTitle] = useState("");
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const TEMP_USER_ID = "11111111-1111-1111-1111-111111111111"; // Temporary UUID
    const router = useRouter();
 
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
              server: 2
              
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
        router.push("/app/rally-controller-2");

      };
    
    return (
        <DashboardLayout>
          <DashboardNavbar />
          <MDBox>
            <Grid container spacing={1}>
              <Grid item xs={12} lg={12} >
                 {/* -----------------------------------------
                
                
                |||      BASIC INFORMATION SECTION           |||
                
                
                ------------------------------------- */}
                <MDBox mt={3}>
                <Card id="incriment-games" sx={{ width: "100%" } }>
                    <MDBox p={3} >
                    <MDTypography variant="h5">
                    Basic Event Information
                    </MDTypography>
                    </MDBox>
                    <MDBox
                    component="form"
                    pb={3}
                    px={3}
                    onSubmit={(e) => {
                        e.preventDefault(); // Prevent page reload
                        createMatch();
                      }}
                    >
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
                        <Grid item xs={3}>
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
                    </MDBox>
                </Card>   
                </MDBox>       
              </Grid>
            </Grid>
          </MDBox>
        </DashboardLayout>
      );
    }

    export default CreateMatch;