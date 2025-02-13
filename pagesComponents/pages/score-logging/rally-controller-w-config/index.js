


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
  const [matchData, setMatchData] = useState(null);
  const [gameData, setGameData] = useState([]);
  const isSmallScreen = useMediaQuery('(max-width:850px)');

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
  };
    
    
  function rallyController(gameData, matchData, rallyWinner, servingTeam) {
    // Step 1: Determine the current game index from matchData (assuming current_game is 1-indexed)
    const currentGameIndex = matchData.current_game - 1;
    
    // Step 2: Clone the current game from gameData so we don't mutate state directly
    let currentGame = { ...gameData[currentGameIndex] };


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
      }
    }

    // Step 5: Perform server rotation logic
    if (rallyWinner !== servingTeam) {
      currentGame = getNextServerInRotation(currentGame);
    }
    // Check if it's game point and update them.
    updateGamePoints(currentGame, getServingTeam(currentGame))

    // Step 6: Check overall win conditions (e.g., reaching target score with required win margin)
    currentGame = checkWinConditions(currentGame);

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
    // In rally scoring, a point is awarded to the winning team of the rally.
    if (rallyWinner === "TeamA") {
      game.team_a_score = (game.team_a_score || 0) + 1;
    } else if (rallyWinner === "TeamB") {
      game.team_b_score = (game.team_b_score || 0) + 1;
    }
    
    // Return the updated game state.
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
      game.is_game_point_updatable = true;
      game.side_out_count = (game.side_out_count || 0) + 1;
      console.log("Side Out Count: ", game.side_out_count)
    }
    
    // Update the game with the new server.
    game.server = newServer;
    
    // Return the updated game state.
    return game;
  }

  
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
    // console.log("Game Point Target: ", target)

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
      game.winner = "TeamA";
      console.log("Game Won By: TeamA")
    } 
    // Otherwise, check if Team B has reached or exceeded its target score.
    else if (game.team_b_score >= targetB) {
      game.game_completed = true;
      game.winner = "TeamB";
      console.log("Game Won By: TeamB")
    } 
    // Otherwise, the game continues.
    else {
      game.game_completed = false;
      game.winner = null;
    }
    
    return game;
  }

  function updateGamePoints(game, servingTeam) {
    if (game.scoring_type === 'Rally') {
      // For rally scoring, award a game point regardless of rally outcome.
      // Check if TeamA is at game point.
      if (game.is_game_point_updatable && isGamePoint(game, "TeamA")) {
        game.team_a_game_points = (game.team_a_game_points || 0) + 1;
        game.is_game_point_updatable = false;
        console.log("New Game Point Team A: ", game.team_a_game_points);
      }
      // Check if TeamB is at game point.
      else if (game.is_game_point_updatable && isGamePoint(game, "TeamB")) {
        game.team_b_game_points = (game.team_b_game_points || 0) + 1;
        game.is_game_point_updatable = false;
        console.log("New Game Point Team B: ", game.team_b_game_points);
      }
    } else {
      // For regular scoring, only award a game point if the serving team is at game point.
      if (game.is_game_point_updatable && isGamePoint(game, servingTeam)) {
        if (servingTeam === "TeamA") {
          game.team_a_game_points = (game.team_a_game_points || 0) + 1;
          console.log("New Game Point Team A: ", game.team_a_game_points);
        } else if (servingTeam === "TeamB") {
          game.team_b_game_points = (game.team_b_game_points || 0) + 1;
          console.log("New Game Point Team B: ", game.team_b_game_points);
        }
        game.is_game_point_updatable = false;
      }
    }
    
    return game;
  }
  


  // Render your component conditionally based on whether matchData or gameData is loaded
  if (!matchData || gameData.length === 0) {
    return <div></div>;
  }

  return  (
    <MDBox>
      <Card id="incriment-games"sx={{ width: "100%"  } }>
      <MDBox p={3} >
          <MDBox>
            <MDTypography variant="h5" textAlign="center" mb={1}>
              {`Rally Controller | Game: ${matchData.current_game}`}
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
                        '&:hover': {
                          backgroundColor: "#0040cb", // Replace with the desired color value, e.g., '#ff0000'
                        },
                      }}
                      color="elare"
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
                value=""
                // onChange={(e) => updateActiveGame("team_a_score", Number(e.target.value))}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label={`${matchData.team_b_name} | Game: ${matchData.current_game}`}
                value=""
                // onChange={(e) => updateActiveGame("team_b_score", Number(e.target.value))}
                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} lg={12}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  fullWidth
                  // onClick={() => nextServer()}
                  >
                  Next Server
                </MDButton>
              </Grid>
              <Grid item xs={6} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    // onClick={() =>changeGame(activeMatch.current_game - 1)}
                    >
                    Previous Game
                  </MDButton>
              </Grid>
              <Grid item xs={6} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    // onClick={() =>changeGame(activeMatch.current_game + 1)}
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