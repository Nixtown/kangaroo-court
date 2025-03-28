


import { useState, useEffect } from "react";
import { supabase } from '/lib/supabaseClient';
import { useMediaQuery } from '@mui/material';



// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import ButtonGroup from '@mui/material/ButtonGroup';
import MDInput from "/components/MDInput";
import BasicScoreBoard from "/pagesComponents/scoreboard/basic-scoreboard";

const RallyControllerOld = () => {

const [scoreData, setScoreData] = useState(null);
const isSmallScreen = useMediaQuery('(max-width:850px)');
const currentTeamAScore = scoreData?.[`team_a_score_game${scoreData?.current_game}`] ?? "";
const currentTeamBScore = scoreData?.[`team_b_score_game${scoreData?.current_game}`] ?? "";
const firstToPoints = scoreData?.first_to_points ?? "11";
const winBy = scoreData?.win_by ?? "2";
const bestOf = scoreData?.best_of ?? "3";


useEffect(() => {
    // Fetch initial data
    async function fetchInitialData() {
        const { data, error } = await supabase
        .from("scoreboard")
        .select("*")
        .eq("id", 1)
        .single();
        if (error) {
        console.error("Error fetching initial data:", error);
        } else {
        setScoreData(data);
        }
    }
    fetchInitialData();
  }, []);

   // Function to update the current game in Supabase
   const updateCurrentGame = async (newGameNumber) => {

    setScoreData(prev => ({
        ...prev,
        current_game: newGameNumber,
      }));

    const { error } = await supabase
      .from('scoreboard')
      .update({ current_game: newGameNumber })
      .eq('id', 1);

    if (error) {
      console.error("Error updating current game:", error);
    } else {
      console.log("Current game updated from rally controller to:", newGameNumber);
    }
  };

  // Function to update the current game in Supabase
  const updateCurrentServer = async (newGameServer) => {

    setScoreData(prev => ({
        ...prev,
        server: newGameServer,
      }));

    const { error } = await supabase
      .from('scoreboard')
      .update({ server: newGameServer })
      .eq('id', 1);

    if (error) {
      console.error("Error updating current game:", error);
    } else {
      console.log("Current game updated to:", newGameServer);
    }
  };

  const handleRallyResult = async (rallyWon) => {
    if (!scoreData) return; // Ensure scoreData is available
  
    let newServer = scoreData.server; 
    let newTeamAScore = scoreData[`team_a_score_game${scoreData.current_game}`];
    let newTeamBScore = scoreData[`team_b_score_game${scoreData.current_game}`];

  
    switch (scoreData.server) {
      case 1:
        if (rallyWon) {
          newTeamAScore += 1;
          console.log("New Team A Score", newTeamAScore)
        } 
        newServer = rallyWon ? 1 : 2; // Stay on server 1 if won, else move to server 2
        break;
  
      case 2:
        if (rallyWon) {
          newTeamAScore += 1; // Team A scores
        } 
        newServer = rallyWon ? 2 : 3; // Stay on server 2 if won, else move to server 3
        break;
  
      case 3:
        if (rallyWon) {
          newTeamBScore += 1; // Team B scores
        } 
        newServer = rallyWon ? 3 : 4; // Stay on server 3 if won, else move to server 4
        break;
  
      case 4:
        if (rallyWon) {
            newTeamBScore += 1; // Team B scores
          } 
          newServer = rallyWon ? 4 : 1;
          break;
  
      default:
        newServer = 1;
    }
  
    // Update the local state with all new values
    setScoreData(prev => ({
      ...prev,
      [`team_a_score_game${prev.current_game}`]: newTeamAScore, // Dynamically update Team A score
      [`team_b_score_game${prev.current_game}`]: newTeamBScore, // Dynamically update Team B score
      server: newServer, // Update server state
    }));

    // Update the Supabase database
    const { error } = await supabase
      .from("scoreboard")
      .update({
        [`team_a_score_game${scoreData.current_game}`]: newTeamAScore, // Dynamically update Team A score
        [`team_b_score_game${scoreData.current_game}`]: newTeamBScore, // Dynamically update Team B score
        server: newServer, // Update server state
      })
      .eq("id", 1);

    if (error) {
      console.error("Error updating scoreboard:", error);
    } else {
      console.log("Scoreboard updated:", { newTeamAScore, newTeamBScore, newServer });
    }

  };

  const getServerLabel = (server) => {
    switch (server) {
      case 1:
        return "Team A Server: 1";
      case 2:
        return "Team A Server: 2";
      case 3:
        return "Team B Server: 1";
      case 4:
        return "Team B Server: 2";
      default:
        return "Unknown Server"; // Fallback for unexpected values
    }
  };

  const handleUpdateAndClear = async (e) => {
    e.preventDefault();
  
    // Ensure scoreData is available
    if (!scoreData) return;
  
    // Create new object with new score data cleared
    const updatedScoreData = {
      ...scoreData,
      ...Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [
          [`team_a_score_game${i + 1}`, 0],
          [`team_b_score_game${i + 1}`, 0],
        ]).flat()
      ),
      current_game: 1, // Reset current_game to 1
    };
    
    
    // Update the local state with the computed data.
    setScoreData(updatedScoreData);
  
    // Pass the updated object directly to the update function.
    await handleUpdateWithData(updatedScoreData);
  };
  
  const handleUpdateWithData = async (dataToUpdate) => {
    const { error } = await supabase
      .from("scoreboard")
      .update(dataToUpdate) // Use the locally computed data object
      .eq("id", 1);
  
    if (error) {
      console.error("Error saving to Supabase:", error);
    } else {
      console.log("Data saved successfully:", dataToUpdate);
    }
  };

  
  const handleUpdate = async (e) => {

    const { error } = await supabase
      .from("scoreboard")
      .update(scoreData) // Directly pass scoreData object
      .eq("id", 1);
  
    if (error) {
      console.error("Error saving to Supabase:", error);
    } else {
      console.log("Data saved successfully:", scoreData);
    }
  };
  const manualUpdateScore = (newScore, team) => {
    setScoreData((prev) => {
      const updatedScoreData = {
        ...prev,
        [`team_${team}_score_game${prev.current_game}`]: Number(newScore) || 0,
      };
       
      handleUpdateWithData(updatedScoreData);
  
      return updatedScoreData; // This ensures the state actually updates.
    });
  };
  

  return  (
    <MDBox>
      <Card id="incriment-games"sx={{ width: "100%"  } }>
      <MDBox p={3} >
          <MDBox>
            <MDTypography variant="h5" textAlign="center" mb={1}>
              {scoreData ? `Rally Controller | Game: ${scoreData.current_game}` : "...Loading"}
            </MDTypography>
          </MDBox>
          <Grid container spacing={0} pb={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Grid item >
              {!isSmallScreen &&<BasicScoreBoard    />}
              {isSmallScreen &&
              <MDBox>
              <MDTypography textAlign="center" variant="subtitle2">
              {scoreData?.server === 1 || scoreData?.server === 2 
              ? scoreData?.team_a ?? "Loading..." 
              : scoreData?.team_b ?? "Loading..."}
              </MDTypography>
              <MDTypography textAlign="center" variant="h1">
              {scoreData &&
              scoreData[`team_a_score_game${scoreData.current_game}`] !== undefined &&
              scoreData[`team_b_score_game${scoreData.current_game}`] !== undefined
              ? `(${scoreData[`team_a_score_game${scoreData.current_game}`]} - ${scoreData[`team_b_score_game${scoreData.current_game}`]})`
              : "Loading..."}
              </MDTypography>
              <MDTypography textAlign="center" variant="subtitle1">
              {getServerLabel(scoreData?.server)}
              </MDTypography>
              </MDBox>
              }

              </Grid>
            </Grid>
          </Grid>
          <MDBox>
            <ButtonGroup variant="outlined" sx={{ height: "300px", width: "100%" }} aria-label="Basic button group" >
              <MDButton
                      variant="contained"
                      sx={{
                        '&:hover': {
                          backgroundColor: "#0040cb", // Replace with the desired color value, e.g., '#ff0000'
                        },
                      }}
                      color="elare"
                      fullWidth
                      size="large"
                     
                      onClick={() => handleRallyResult(true)}
                      >
                      Won <br/>
                      Rally

          
              </MDButton>
              <MDButton
                      variant="gradient"
                      color="dark"
                      fullWidth
                      size="large"
               
                      onClick={() => handleRallyResult(false)}
                      >
                      Lost<br/>
                      Rally
              </MDButton>
            </ButtonGroup>
            <Grid container spacing={3} pt={3}>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label= {`Team A | Game: ${scoreData?.current_game}`}
                value={currentTeamAScore}
                onChange={(e) => manualUpdateScore(e.target.value, "a")}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label= {`Team B | Game: ${scoreData?.current_game}`}
                value={currentTeamBScore}
                onChange={(e) => manualUpdateScore(e.target.value, "b")}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} lg={6}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  fullWidth
                  onClick={() => updateCurrentServer(scoreData.server === 4 ? 1 : scoreData.server + 1)}

                  >
                  Next Server
                </MDButton>
              </Grid>
              <Grid item xs={12} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    onClick={() => updateCurrentGame(scoreData.current_game === 5 ? 1 : scoreData.current_game + 1)}
                    >
                    Next Game
                  </MDButton>
              </Grid>
              </Grid>
          </MDBox>          
        </MDBox> 
      </Card>
     
       {/* -----------------------------------------
       
       
       |||      MANUALLY UPDATE SCORE           |||
       
       
       ------------------------------------- */}
      <MDBox mt={3}>
      <Card id="incriment-games" sx={{ width: "100%" } }>
        <MDBox p={3} >
          <MDTypography variant="h5">
           Game Settings
          </MDTypography>
        </MDBox>
        <MDBox pb={3}
          px={3}>
        <MDTypography pb={2}variant="subtitle2">
          Win Conditions
          </MDTypography>

          <Grid container spacing={3}>

            <Grid item xs={4} sm={4}>
                <MDInput
                fullWidth
                label= "First to X"
                value= {firstToPoints}
                onChange={(e) => {
                  setScoreData((prev) => {
                    const updatedScoreData = { ...prev, first_to_points: Number(e.target.value) };
                    handleUpdate(updatedScoreData); // Call handleUpdate with new data
                    return updatedScoreData; // Ensure React updates state
                  });
                }}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={4} sm={4}>
                <MDInput
                fullWidth
                label= "Win by X"
                value={winBy}
                onChange={(e) => {
                  setScoreData((prev) => {
                    const updatedScoreData = { ...prev, win_by: Number(e.target.value) };
                    handleUpdate(updatedScoreData); // Call handleUpdate with new data
                    return updatedScoreData; // Ensure React updates state
                  });
                }}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={4} sm={4}>
                <MDInput
                fullWidth
                label= "Best of X"
                value={bestOf}
                onChange={(e) => {
                  setScoreData((prev) => {
                    const updatedScoreData = { ...prev, best_of: Number(e.target.value) };
                    handleUpdate(updatedScoreData); // Call handleUpdate with new data
                    return updatedScoreData; // Ensure React updates state
                  });
                }}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            
              <Grid item xs={12} lg={6}>
                <MDButton
                variant="gradient"
                color="dark"
                fullWidth
                onClick={handleUpdateAndClear}>
                Clear Match
                </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Card>   
      </MDBox>
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
          onSubmit={handleUpdate}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label="Tournament Name"
                value={scoreData?.tournament_name || ""}
                onChange={(e) => setScoreData((prev) => ({ ...prev, tournament_name: e.target.value }))}
                inputProps={{ type: "text", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label="Match Title"
                value={scoreData?.match_title || ""}
                onChange={(e) => setScoreData((prev) => ({ ...prev, match_title: e.target.value }))}
                inputProps={{ type: "text", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label="(A) Team Name"
                value={scoreData?.team_a || ""}
                onChange={(e) => setScoreData((prev) => ({ ...prev, team_a: e.target.value }))}
                inputProps={{ type: "text", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label="(B) Team Name"
                value={scoreData?.team_b || ""}
                onChange={(e) => setScoreData((prev) => ({ ...prev, team_b: e.target.value }))}
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
                Update
                </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Card>   
      </MDBox>                                                         
    </MDBox>
);
};
export default RallyControllerOld;