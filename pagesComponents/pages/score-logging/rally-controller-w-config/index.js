


import { useState, useEffect, useRef } from "react";
import { supabase } from '/lib/supabaseClient';
import { useMediaQuery } from '@mui/material';
import { toast } from "react-toastify";



// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import ButtonGroup from '@mui/material/ButtonGroup';
import MDInput from "/components/MDInput";
import BasicScoreBoard from "/pagesComponents/scoreboard/basic-scoreboard";
import next from "next";

const RallyControllerWConfig = () => {
  const [branding, setBranding] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [gameData, setGameData] = useState([]);
  const isSmallScreen = useMediaQuery('(max-width:850px)');

  
  useEffect(() => {
    const fetchActiveBranding = async () => {
      const { data, error } = await supabase
        .from("branding")
        .select("*")
        .eq("active_branding", true)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Error fetching active branding:", error);
      } else {
        setBranding(data);
      }
    };

    fetchActiveBranding();
  }, []);

  useEffect(() => {

    /// Get the active match data
    const fetchActiveMatch = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('active_match', true)
        .single(); // Assuming there's only one active match

      if (error) {
        console.error("Error fetching active match:", error);
      } else {
        setMatchData(data);
      }
    };

    fetchActiveMatch();
  }, []);

  /// Get all the games using the active match id
  useEffect(() => {
    const fetchGameStats = async () => {
      if (matchData && matchData.id) {
        const { data, error } = await supabase
          .from('game_stats')
          .select('*')
          .eq('match_id', matchData.id);
          
        if (error) {
          console.error("Error fetching game stats:", error);
        } else {
          setGameData(data);
        }
      }
    };
  
    fetchGameStats();
  }, [matchData]);

  // Update the Games In SupaBase
  const updateGameDataInSupabase = async (updatedGameData) => {
    const { data, error } = await supabase
      .from('game_stats')
      .upsert(updatedGameData); // requires each object to include its unique id
  
    if (error) {
      console.error("Error updating game stats:", error);
    } else {
      // console.log("Game stats updated successfully:", data);
    }
  };

  const handleScoreChange = (teamKey, newValue) => {
    // Ensure the value is a valid number
    const score = Math.max(0, parseInt(newValue, 10) || 0);
  
    // Determine the current game index
    const currentGameIndex = matchData.current_game - 1;
  
    // Clone the current game so we don’t mutate state directly
    let updatedGame = { ...gameData[currentGameIndex], [teamKey]: score, game_completed: false };
  
    // Update local state
    const newGameData = [...gameData];
    newGameData[currentGameIndex] = updatedGame;
    setGameData(newGameData);
  
    // Update the database
    updateGameDataInSupabase(updatedGame);
  };
  




  const handleChangeGame = async (delta) => {
    // Calculate the new game number
    const newGameNumber = matchData.current_game + delta;
  
    // Check boundaries: ensure it doesn't go below 1 or above best_of
    if (newGameNumber < 1 || newGameNumber > matchData.best_of) {
      console.log("Game number out of bounds.");
      return;
    }
  
    // Only update if there's an actual change
    if (newGameNumber !== matchData.current_game) {
      const { data, error } = await supabase
        .from('matches')
        .update({ current_game: newGameNumber })
        .eq('id', matchData.id);
  
      if (error) {
        console.error("Error updating match current_game:", error);
      } else {
        setMatchData(prev => ({ ...prev, current_game: newGameNumber }));
      }
    }
  };
  




  const handleRally = (rallyWon) => {
    // Determine the current game index from matchData (assuming current_game is 1-indexed)
    const currentGameIndex = matchData.current_game - 1;
    
    // Get the current game object
    const currentGame = gameData[currentGameIndex];
    
    // Determine the serving team using your helper function
    const servingTeam = getServingTeam(currentGame);
    // Determine the rally winner based on whether the rally was won
    const rallyWinner = rallyWon 
      ? servingTeam 
      : (servingTeam === "TeamA" ? "TeamB" : "TeamA");
    
    // Call the rallyController with the determined rally winner
    const updatedGameData = rallyController(gameData, matchData, rallyWinner, servingTeam);
    
    // Update the gameData state with the new data.
    setGameData(updatedGameData);

    // Update Supabase with the new game data
    updateGameDataInSupabase(updatedGameData);
  };
    
    
  function rallyController(gameData, matchData, rallyWinner, servingTeam) {
    // Step 1: Determine the current game index from matchData (assuming current_game is 1-indexed)
    const currentGameIndex = matchData.current_game - 1;
    
    // Step 2: Clone the current game from gameData so we don't mutate state directly
    let currentGame = { ...gameData[currentGameIndex] };


    // Step 5: Perform server rotation logic
    if (rallyWinner !== servingTeam) {
      currentGame = getNextServerInRotation(currentGame);
    }


    // Step 3: Check win_on_serve rule before awarding a point.
    // If win_on_serve is true, and the rally winner is not the serving team,
    // and if the rally winner is at game point, then no point is awarded.
    if (currentGame.win_on_serve && rallyWinner !== servingTeam && isGamePoint(currentGame, rallyWinner)) {
      // Do not award a point—simply proceed to server rotation.
      // (Optionally, you might log or update a stat indicating that a rally point was lost due to the rule.)


    } else {
      // Step 4: Process the rally based on the scoring type
      if (currentGame.scoring_type === 'Rally') {
        currentGame = handleRallyScoring(currentGame, rallyWinner, servingTeam);
   
      } else if (currentGame.scoring_type === 'Regular') {
        currentGame = handleRegularScoring(currentGame, rallyWinner, servingTeam);
           // Check if it's game point and update them.
      
     
      }
    }

      // Step 6: Check overall win conditions (e.g., reaching target score with required win margin)
      currentGame = checkWinConditions(currentGame);


    // If the score is now tied it can never be game point.
    if(currentGame.team_a_score === currentGame.team_b_score || currentGame.game_completed)
    {
      currentGame.is_game_point = false
    }
    else
    {
        // Capture whether it is game point before it's changed 
    const prevIsGamePoint = currentGame.is_game_point;

    // We set game point toggle which controls the UI on the score board but doesn't issue points
     if (currentGame.scoring_type === "Rally" && !currentGame.win_on_serve) {
       // In rally scoring with win_on_serve false, game point is true if either team is 1 point away.
       currentGame.is_game_point =
         isGamePoint(currentGame, "TeamA") || isGamePoint(currentGame, "TeamB");
     } else {
       // Otherwise, check if the serving team is at game point.
       currentGame.is_game_point = isGamePoint(currentGame, getServingTeam(currentGame));
     }
 
     // If is_game_point changed from false to true, run the updateGamePoints function
     if (!prevIsGamePoint && currentGame.is_game_point) {
       // Optionally, you can pass in the serving team as well
       
       currentGame = updateGamePoints(currentGame);
     }
     
    }
      

  

    if(currentGame.is_game_point)
    {
      toast.info(
        "Game point!",
        {
          position: "top-center", // Positions the toast at the top center
          autoClose: 3000,        // Auto-closes after 3 seconds
          hideProgressBar: false, // Displays the progress bar
          closeOnClick: true,     // Allows dismissal on click
          pauseOnHover: true,     // Pauses autoClose timer when hovered
          draggable: true,        // Enables dragging to dismiss
          theme: "dark",       // Uses the "colored" theme for a vibrant look
          style: { width: "100%", maxWidth: "500px" },
        }
      );
    }

    // Step 7: Update the current game in the gameData array with the new state
    const updatedGameData = [...gameData];
    updatedGameData[currentGameIndex] = currentGame;

    // Step 8: Return the updated gameData array
    return updatedGameData;
  }

  function handleRegularScoring(game, rallyWinner, servingTeam) {
  
    // Award a point only if the rally winner is the serving team.
    if (rallyWinner === servingTeam) {
      if (rallyWinner === "TeamA") {
        game.team_a_score = (game.team_a_score || 0) + 1;
      } else if (rallyWinner === "TeamB") {
        game.team_b_score = (game.team_b_score || 0) + 1;
      }
    }

    
    // Return the updated game state.
    return game;
  }

 

  function handleRallyScoring(game, rallyWinner) {
    // Calculate the lead before awarding the point.
    // Using Math.sign returns -1 if TeamB is leading, 1 if TeamA is leading, and 0 if tied.
    const prevLead = Math.sign((game.team_a_score || 0) - (game.team_b_score || 0));
    
    // Award the point to the winning team.
    if (rallyWinner === "TeamA") {
      game.team_a_score = (game.team_a_score || 0) + 1;
    } else if (rallyWinner === "TeamB") {
      game.team_b_score = (game.team_b_score || 0) + 1;
    }
    
    // Calculate the new lead after the point.
    const newLead = Math.sign(game.team_a_score - game.team_b_score);
    
   
    
    return game;
  }
  

  function getNextServerInRotation(game) {
    // Capture the previous server from the game object.
    const previousServer = game.server;
    
    let newServer;
    if (game.scoring_type === 'Rally') {
      // For rally scoring, cycle between 1 and 2.
      newServer = (previousServer % 2) + 1;
    } else {
      // For regular scoring, cycle through 1 to 4.
      newServer = (previousServer % 4) + 1;
    }

    // Determine the teams corresponding to the previous and new server values.
    const previousTeam = getServingTeam({ ...game, server: previousServer });
    const newTeam = getServingTeam({ ...game, server: newServer });

    // If the serving team changed, it's a side-out.
    if (previousTeam !== newTeam) {
   
      game.side_out_count = (game.side_out_count || 0) + 1;
      console.log("Side Out Count: ", game.side_out_count)
    }
    
    // Update the game with the new server.
    game.server = newServer;
    
    // Return the updated game state.
    return game;
  }

  const handleCycleServer = async () => {
    // Validate that matchData and gameData exist and the index is valid.
    if (!matchData || !gameData || gameData.length < matchData.current_game) {
      console.error("Data not loaded or invalid");
      return;
    }
    
    // Determine the current game index (matchData.current_game is assumed to be 1-indexed)
    const currentGameIndex = matchData.current_game - 1;
    
    // Clone the current game so we don't mutate state directly.
    let updatedGame = { ...gameData[currentGameIndex] };
    
    // Cycle the server inline:
    const previousServer = updatedGame.server;
    let newServer;
    if (updatedGame.scoring_type === "Rally") {
      // For rally scoring, cycle between 1 and 2.
      newServer = (previousServer % 2) + 1;
    } else {
      // For regular scoring, cycle through 1 to 4.
      newServer = (previousServer % 4) + 1;
    }
    updatedGame.server = newServer;
    
    // Update the local gameData state.
    const newGameData = [...gameData];
    newGameData[currentGameIndex] = updatedGame;
    setGameData(newGameData);
    
    // Update the game record in Supabase.
    const { data, error } = await supabase
      .from('game_stats')
      .update(updatedGame)
      .eq('id', updatedGame.id);
      
    if (error) {
      console.error("Error updating game server:", error);
    } else {
      console.log("Game server updated successfully:", data);
    }
  };
  
  
  
  function getServingTeam(game) {
    // For rally scoring, we assume only two valid server numbers: 1 and 2.
    if (game.scoring_type === 'Rally') {
      if (game.server === 1) {
        return "TeamA";
      } else if (game.server === 2) {
        return "TeamB";
      }
    } else {
      // For regular scoring, we assume valid server numbers are 1, 2, 3, or 4.
      // Servers 1 and 2 belong to TeamA, while 3 and 4 belong to TeamB.
      if (game.server === 1 || game.server === 2) {
        return "TeamA";
      } else if (game.server === 3 || game.server === 4) {
        return "TeamB";
      }
    }
    return null;
  }

  // Helper: Calculate the target score a team needs to win.
  function getTargetScoreForTeam(game, team) {
    const winBy = game.win_by;
    const firstTo = game.first_to_points;
    
    let teamScore, opponentScore;
    if (team === "TeamA") {
      teamScore = game.team_a_score;
      opponentScore = game.team_b_score;
    } else if (team === "TeamB") {
      teamScore = game.team_b_score;
      opponentScore = game.team_a_score;
    } else {
      return firstTo; // Default fallback.
    }
    
    // The target is the maximum between the base score and the opponent's score plus the win-by margin.
    let target = Math.max(firstTo, opponentScore + winBy);
    
    // Use the point cap if it's set (greater than 0) and the calculated target exceeds it.
    if (game.point_cap > 0 && target > game.point_cap) {
      target = game.point_cap;
    }
    
    return target;
  }


  // isGamePoint: Returns true if the specified team is one point away from the target score.
  function isGamePoint(game, team) {
    const target = getTargetScoreForTeam(game, team);
    
    let teamScore;
    if (team === "TeamA") {
      teamScore = game.team_a_score;
    } else if (team === "TeamB") {
      teamScore = game.team_b_score;
    } else {
      return false;
    }

    // The team is at game point if its score is exactly one less than the target.
    return teamScore === target - 1;
  }

  function checkWinConditions(game) {
    // Get the dynamic target score for each team.
    const targetA = getTargetScoreForTeam(game, "TeamA");
    const targetB = getTargetScoreForTeam(game, "TeamB");

    // Check if Team A has reached or exceeded its target score.
    if (game.team_a_score >= targetA) {
      game.game_completed = true;
      game.winner = 1;
      console.log("Game Won By: TeamA")
    } 
    // Otherwise, check if Team B has reached or exceeded its target score.
    else if (game.team_b_score >= targetB) {
      game.game_completed = true;
      game.is_game_point = false;
      game.winner = 2;
      console.log("Game Won By: TeamB")
    } 
    // Otherwise, the game continues.
    else {
      game.game_completed = false;
      game.winner = null;
    }

    // If the game is completed, display the toast notification.
    if (game.game_completed) {
      toast.success("Game complete. Final score recorded.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: { width: "100%", maxWidth: "500px" },
      });
    }
    
    return game;
  }

  // function updateGamePoints(game, servingTeam) {
  //   if (game.scoring_type === 'Rally') {
  //     // For rally scoring, award a game point regardless of rally outcome.
  //     // Check if TeamA is at game point.

  //     console.log("Is game point updatable?", game.is_game_point_updatable)
  //     if (game.is_game_point_updatable && isGamePoint(game, "TeamA")) {
  //       game.team_a_game_points = (game.team_a_game_points || 0) + 1;
  //       game.is_game_point_updatable = false;
  //       console.log("New Game Point Team A: ", game.team_a_game_points);
  //     }
  //     // Check if TeamB is at game point.
  //     else if (game.is_game_point_updatable && isGamePoint(game, "TeamB")) {
  //       game.team_b_game_points = (game.team_b_game_points || 0) + 1;
  //       game.is_game_point_updatable = false;
  //       console.log("New Game Point Team B: ", game.team_b_game_points);
  //     }
  //   } else {
  //     // For regular scoring, only award a game point if the serving team is at game point.
  //     if (game.is_game_point_updatable && isGamePoint(game, servingTeam)) {
  //       if (servingTeam === "TeamA") {
  //         game.team_a_game_points = (game.team_a_game_points || 0) + 1;
  //         console.log("New Game Point Team A: ", game.team_a_game_points);
  //       } else if (servingTeam === "TeamB") {
  //         game.team_b_game_points = (game.team_b_game_points || 0) + 1;
  //         console.log("New Game Point Team B: ", game.team_b_game_points);
  //       }
  //       game.is_game_point_updatable = false;
  //     }
  //   }
    
  //   return game;
  // }

  function updateGamePoints(game) {
 
    if (game.team_a_score > game.team_b_score) {
      game.team_a_game_points = (game.team_a_game_points || 0) + 1;
      console.log("Awarded game point to Team A");
    } else if (game.team_b_score > game.team_a_score) {
      game.team_b_game_points = (game.team_b_game_points || 0) + 1;
      console.log("Awarded game point to Team B");
    }
  
    return game;
  }
  
  
 

  // Render your component conditionally based on whether matchData or gameData is loaded
  if (!matchData || gameData.length === 0 || !branding) {
    return <div></div>;
  }

  return  (
    <MDBox>
      <Card id="incriment-games"sx={{ width: "100%"  } }>
      <MDBox p={3} >
          <MDBox>
            <MDTypography variant="h5" textAlign="center" mb={1}>
              {`Best of ${matchData.best_of} | Game: ${matchData.current_game}`}
            </MDTypography>
          </MDBox>
          <Grid container spacing={0} pb={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Grid item >
              {!isSmallScreen &&<BasicScoreBoard/>}
              {isSmallScreen &&
              <MDBox>
              <MDTypography textAlign="center" variant="subtitle2">
                {`${matchData.team_a_name} vs ${matchData.team_b_name}`}
              </MDTypography>
              <MDTypography textAlign="center" variant="h1">
                {`${gameData[matchData.current_game - 1].team_a_score} - ${gameData[matchData.current_game - 1].team_b_score}`}
              </MDTypography>
              <MDTypography textAlign="center" variant="subtitle1">
                {`Server: ${gameData[matchData.current_game - 1].server}`} 
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
                        backgroundColor: branding.primary_color, // Primary color applied correctly
                        '&:hover': {
                          backgroundColor: branding.primary_color, // Ensures hover effect works
                        },
                      }}
                      color="dark"
                      fullWidth
                      size="large"
                      disabled={gameData[matchData.current_game - 1].game_completed === true}
                      onClick={() => handleRally(true)}
                      >
                        Won <br/>
                        Rally
              </MDButton>
              <MDButton
                      variant="gradient"
                      color="dark"
                      fullWidth
                      size="large"
                      disabled={gameData[matchData.current_game - 1].game_completed === true}
                      onClick={() => handleRally(false)}
                      >
                        Lost<br/>
                        Rally
              </MDButton>
            </ButtonGroup>
            <Grid container spacing={3} pt={3}>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label={`${matchData.team_a_name} | Game: ${matchData.current_game}`}
                value={gameData[matchData.current_game - 1]?.team_a_score || ""}
                onChange={(e) => handleScoreChange("team_a_score", e.target.value)}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label={`${matchData.team_b_name} | Game: ${matchData.current_game}`}
                value={gameData[matchData.current_game - 1]?.team_b_score || ""}
                onChange={(e) => handleScoreChange("team_b_score", e.target.value)}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} lg={12}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  fullWidth
                  onClick={handleCycleServer}
                  >
                  Next Server
                </MDButton>
              </Grid>
              <Grid item xs={6} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    disabled={matchData.current_game === 1}
                    onClick={() => handleChangeGame(-1)}
                    >
                    Previous Game
                  </MDButton>
              </Grid>
              <Grid item xs={6} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    disabled={matchData.current_game === matchData.best_of}
                    onClick={() => handleChangeGame(+1)}
                    >
                    Next Game
                  </MDButton>
              </Grid>
              </Grid>
          </MDBox>          
        </MDBox> 
      </Card>                                                          
    </MDBox>
);
};
export default RallyControllerWConfig;