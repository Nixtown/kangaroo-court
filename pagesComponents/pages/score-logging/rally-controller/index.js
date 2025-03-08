


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

const RallyController = () => {
  const [activeMatch, setActiveMatch] = useState(null);
  const [branding, setBranding] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const gameData = activeGame ?? { team_a_score: 0, team_b_score: 0, game_number: 1 };
  const matchData = activeMatch ?? { current_game: 1, match_title: "Loading...", team_a_name: "Team A", team_b_name: "Team B" };
  const isGamePointUpdatableRef = useRef(true);
  const isSmallScreen = useMediaQuery('(max-width:850px)');

  useEffect(() => {
    const loadActiveMatchAndGame = async () => {
      const match = await fetchActiveMatch();
      if (match) {
        setActiveMatch(match);
        const game = await fetchActiveGame(match.id, match.current_game);
        setActiveGame(game);
  
        // ✅ Call checkGamePoint() after setting the game state
        checkGamePoint(game, match, true);
      }
    };
  
    loadActiveMatchAndGame(); // ✅ Calls the function when the component mounts
  }, []);

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
  

  const fetchActiveMatch = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .is("active_match", true)
      .single();
  
    if (error) {
      console.error("Error fetching active match:", error);
      return null;
    }
    return data;
  };
  
  const fetchActiveGame = async (matchId, gameNumber) => {
    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("match_id", matchId)
      .eq("game_number", gameNumber)
      .single();
  
    if (error) {
      console.error("Error fetching active game:", error);
      return null;
    }

    return data;
  };

  const updateActiveGame = async (keyOrUpdates, value) => {
    if (!activeGame || !activeMatch) return; // Ensure `activeGame` and `activeMatch` exist
  
    // Determine whether we're passed an object of updates or a key/value pair.
    const updates =
      typeof keyOrUpdates === "object" && keyOrUpdates !== null
        ? keyOrUpdates
        : { [keyOrUpdates]: value };
  
    // ✅ Update state immediately by merging the updates into the previous state.
    setActiveGame((prevGame) => ({
      ...prevGame,
      ...updates,
    }));
  
    // ✅ Save updates to Supabase.
    const { error } = await supabase
      .from("game_stats")
      .update(updates) // Update the specified fields
      .eq("match_id", activeMatch.id) // Ensure we update the correct match
      .eq("game_number", activeMatch.current_game); // Ensure we update the correct game
  
    if (error) {
      console.error("Error updating activeGame with:", updates, error);
    } else {
      console.log("Updated activeGame with:", updates);
    }
  };
  
  

  const updateActiveMatch = async (keyOrUpdates, value) => {
    if (!activeMatch) return; // Ensure `activeMatch` exists
  
    // Determine whether we're passed an object of updates or a key and a value.
    const updates =
      typeof keyOrUpdates === "object" && keyOrUpdates !== null
        ? keyOrUpdates
        : { [keyOrUpdates]: value };
  
    // ✅ Update state immediately by merging the updates with the previous state.
    setActiveMatch((prevMatch) => ({
      ...prevMatch,
      ...updates,
    }));
  
    // ✅ Save updates to Supabase.
    const { error } = await supabase
      .from("matches")
      .update(updates) // Pass the entire updates object
      .eq("id", activeMatch.id); // Update the correct match
  
    if (error) {
      console.error(`Error updating activeMatch with:`, updates, error);
    } else {
      console.log(`Updated activeMatch with:`, updates);
    }
  };
  
  
  
  const handleRally = async (rallyWon) => {
    if (!activeGame) return; // Ensure activeGame is available
    if (!activeMatch) return; // Ensure activeMatch is available

    let prevServer = activeMatch.server;
    let newServer = activeMatch.server;
    let newTeamAScore = activeGame.team_a_score;
    let newTeamBScore = activeGame.team_b_score;

    switch (activeMatch.server) {
      case 1:
        if (rallyWon) {
          newTeamAScore += 1;
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
    
    // ✅ Detect if a side-out occurred
    const sideOut = isSideOut(prevServer, newServer);

    // Update the local states with all new values
    updateActiveGame({
      team_a_score: newTeamAScore,
      team_b_score: newTeamBScore,
    });
    
    updateActiveMatch("server", newServer)

    // ✅ Pass the updated values directly to checkGamePoint()
    await checkGamePoint(
    { ...activeGame, team_a_score: newTeamAScore, team_b_score: newTeamBScore }, 
    { ...activeMatch, server: newServer },
    sideOut,
    rallyWon
    );
  }

  /// Dynamically Create Labels for Mobile
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

  /// Cycle to the next server of the 4 possible
  const nextServer = () => {
    if (!activeMatch) return;

    const newServer = (activeMatch.server % 4) + 1;
    updateActiveMatch("server", newServer);

  }

  const changeGame = async (gameNumber) => {
    if (!activeMatch)return; // Ensure `activeMatch` exists
    if (!gameData.game_completed && gameNumber > matchData.current_game)
    {
      toast.info("Please complete the current game first. 🙂 ", {
        position: "top-center", // Positions the toast at the top center
        autoClose: 3000,        // Auto-closes after 3 seconds
        hideProgressBar: false, // Displays the progress bar
        closeOnClick: true,     // Allows dismissal on click
        pauseOnHover: true,     // Pauses autoClose timer when hovered
        draggable: true,        // Enables dragging to dismiss
        theme: "dark",       // Uses the "colored" theme for a vibrant look
      });
      return;
    }
  
    console.log("GameData", gameData)


   

    // ✅ Prevent invalid game numbers
    if (gameNumber < 1 || gameNumber > activeMatch.best_of) {
      toast.warning(`Invalid game number: ${gameNumber}. Allowed range: 1 - ${activeMatch.best_of}`, {
        position: "top-center", // Positions the toast at the top center
        autoClose: 3000,        // Auto-closes after 3 seconds
        hideProgressBar: false, // Displays the progress bar
        closeOnClick: true,     // Allows dismissal on click
        pauseOnHover: true,     // Pauses autoClose timer when hovered
        draggable: true,        // Enables dragging to dismiss
        theme: "dark",       // Uses the "colored" theme for a vibrant look
      });
    return;
    }

     // Change to server 2 since it's most likely a new game
     updateActiveMatch("server", 2);
  
    console.log(`Switching to Game ${gameNumber}...`);
  
    // ✅ Step 1: Update `current_game` in `activeMatch`
    await updateActiveMatch("current_game", gameNumber);
  
    // ✅ Step 2: Check if the game exists in `game_stats`
    const { data: existingGame, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("match_id", activeMatch.id)
      .eq("game_number", gameNumber)
      .maybeSingle();
  
    if (error || !existingGame) {
      console.log(`Game ${gameNumber} does not exist. Creating it now...`);
  
      // ✅ Step 3: Create a new game if it doesn’t exist
      const { data: newGame, error: createError } = await supabase
        .from("game_stats")
        .insert([
          {
            match_id: activeMatch.id,
            game_number: gameNumber,
            team_a_score: 0,
            team_b_score: 0,
            team_a_game_points: 0,
            team_b_game_points: 0,
            team_a_match_points: 0,
            team_b_match_points: 0,
          },
        ])
        .select("*")
        .single();
  
      if (createError) {
        console.error("Error creating new game:", createError);
        return;
      }
  
      console.log(`Game ${gameNumber} created successfully.`);
      setActiveGame(newGame); // ✅ Set the newly created game as `activeGame`
      await updateActiveMatch("server", 2);

    } else {
      console.log(`Game ${gameNumber} already exists.`);
      setActiveGame(existingGame); // ✅ Load the existing game into `activeGame`
    }
  };

  const isSideOut = (prevServer, newServer) => {
    const teamAServers = [1, 2];
    const teamBServers = [3, 4];
  
    // Determine which team the previous server belongs to.
    const prevTeam = teamAServers.includes(prevServer)
      ? 'A'
      : teamBServers.includes(prevServer)
        ? 'B'
        : null;
  
    // Determine which team the new server belongs to.
    const newTeam = teamAServers.includes(newServer)
      ? 'A'
      : teamBServers.includes(newServer)
        ? 'B'
        : null;
  
    // If either server doesn't belong to a known team, log a warning.
    if (!prevTeam || !newTeam) {
      console.warn("Unexpected server values", { prevServer, newServer });
      return false;
    }
  
    // A side-out occurs if the new server belongs to a different team than the previous one.
    return prevTeam !== newTeam;
  };
  

  const checkGamePoint = async (gameData, matchData, sideOut) => {
    // Ensure necessary data is provided.
    if (!gameData || !matchData) {
      console.log("Missing gameData or matchData; exiting checkGamePoint.");
      return;
    }
    
  
    // Destructure game and match data.
    const {
      team_a_score,
      team_b_score,
      team_a_game_points = 0,
      team_b_game_points = 0
    } = gameData;
    const {
      first_to_points, // Points required to win a game.
      win_by,          // Minimum lead required to win a game.
      server,          // Current server indicator.
      match_first_to = 3 // Games required to win the match (default is 3).
    } = matchData;
    
    const requiredPoints = first_to_points;
    const mustWinBy = win_by;
    
    // 1. Determine if either team has already won the game.
    const teamAHasWon =
      team_a_score >= requiredPoints &&
      (team_a_score - team_b_score) >= mustWinBy;
    const teamBHasWon =
      team_b_score >= requiredPoints &&
      (team_b_score - team_a_score) >= mustWinBy;
    const isGameWon = teamAHasWon || teamBHasWon;
    
    if (isGameWon) {
      // Identify the winner using numeric identifiers.
      const winner = teamAHasWon ? 1 : 2;
      await updateActiveGame({winner: winner, game_completed: true});
      // Ensure the match record is updated to reflect that it is no longer game point.
      await updateActiveMatch("is_game_point", false);
      toast.success(
        "Game complete. Final score recorded.",
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
      return;
    }
    
    // 2. Determine if the current rally is game point.
    // A team is at game point if winning the next rally would win them the game
    // and that team is the one currently serving.
    const isTeamAGamePoint =
      (team_a_score + 1 >= requiredPoints) &&
      ((team_a_score + 1) - team_b_score >= mustWinBy) &&
      (server === 1 || server === 2);

    const isTeamBGamePoint =
      (team_b_score + 1 >= requiredPoints) &&
      ((team_b_score + 1) - team_a_score >= mustWinBy) &&
      (server === 3 || server === 4);

    const isGamePoint = isTeamAGamePoint || isTeamBGamePoint;

    if (isGamePoint) {
      // Example copy for the game point notification.
      toast.info(
        "Game Point! The serving team is just one rally away from clinching the game!",
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

    // 3. On side-out, reset the flag that controls whether game point stats can be updated.
    if (sideOut) {
      console.log("🔄 Side-Out Occurred! Resetting game point tracking.");
      isGamePointUpdatableRef.current = true;
    }
    
    // 4. If it's game point and updates are allowed, increment the respective team's game point count.
    if (isGamePoint && isGamePointUpdatableRef.current) {
      if (isTeamAGamePoint) {
        const newPoints = team_a_game_points + 1;
        await updateActiveGame("team_a_game_points", newPoints);
      } else if (isTeamBGamePoint) {
        const newPoints = team_b_game_points + 1;
        await updateActiveGame("team_b_game_points", newPoints);
      }
      // Prevent further increments until the next side-out.
      // Immediately update the ref.
      isGamePointUpdatableRef.current = false;
    } else {
      console.log("Game point stat update skipped.", { isGamePoint, isGamePointUpdatable: isGamePointUpdatableRef.current });
    }
    
    // 5. Update the match record with the current game point flag.
    await updateActiveMatch("is_game_point", isGamePoint);
  };
  
  
  return  (
    <MDBox>
      <Card id="incriment-games"sx={{ width: "100%"  } }>
      <MDBox p={3} >
          <MDBox>
            <MDTypography variant="h5" textAlign="center" mb={1}>
              {`Rally Controller (${matchData.id}) | Game: ${matchData.current_game}`}
            </MDTypography>
          </MDBox>
          <Grid container spacing={0} pb={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Grid item >
              {!isSmallScreen &&<BasicScoreBoard/>}
              {isSmallScreen &&
              <MDBox>
              <MDTypography textAlign="center" variant="subtitle2">
              {matchData?.server === 1 || matchData?.server === 2 
              ? matchData?.team_a_name ?? "Loading..." 
              : matchData?.team_b_name ?? "Loading..."}
              </MDTypography>
              <MDTypography textAlign="center" variant="h1">
              {`(${gameData.team_a_score} - ${gameData.team_b_score})`}
              </MDTypography>
              <MDTypography textAlign="center" variant="subtitle1">
              {getServerLabel(matchData?.server)}
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
                      fullWidth
                      size="large"
                      color="dark"
                      onClick={() => handleRally(true)}
                      >
                      Wons <br/>
                      Rally

          
              </MDButton>
              <MDButton
                      variant="gradient"
                      color="dark"
                      fullWidth
                      size="large"
               
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
                label={`Team A | Game: ${activeMatch?.current_game}`}
                value={gameData.team_a_score}
                onChange={(e) => updateActiveGame("team_a_score", Number(e.target.value))}                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <MDInput
                fullWidth
                label={`Team B | Game: ${activeMatch?.current_game}`}
                value={gameData.team_b_score}
                onChange={(e) => updateActiveGame("team_b_score", Number(e.target.value))}                inputProps={{ type: "number", autoComplete: "" }}
                />
            </Grid>
            <Grid item xs={12} lg={12}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  fullWidth
                  onClick={() => nextServer()}
                  >
                  Next Server
                </MDButton>
              </Grid>
              <Grid item xs={6} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    onClick={() =>changeGame(activeMatch.current_game - 1)}
                    >
                    Previous Game
                  </MDButton>
              </Grid>
              <Grid item xs={6} lg={6}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    fullWidth
                    onClick={() =>changeGame(activeMatch.current_game + 1)}
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
export default RallyController;