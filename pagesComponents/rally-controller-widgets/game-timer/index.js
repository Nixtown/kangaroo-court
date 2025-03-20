import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import { toast } from "react-toastify";
import { supabase } from "/lib/supabaseClient";
import { useMaterialUIController } from "/context";

function GameTimer({
  bgColor,
  title,
  percentage,
  icon,
  direction,
  matchData,
  setMatchData,
  gameData,
  setGameData,
  handleGameStatusChange
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [startTime, setStartTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Helper: get the current game by matching game_number with matchData.current_game
  const getCurrentGame = (matchData, gameData) => {
    if (matchData && gameData) {
      return gameData.find((game) => game.game_number === matchData.current_game) || null;
    }
    return null;
  };



  // Compute currentGame and its index.
  const currentGame = getCurrentGame(matchData, gameData);


  // Debug logs.
  useEffect(() => {
    console.log("Match Data:", matchData);
    console.log("Game Data:", gameData);
    console.log("Current Game:", currentGame);
  }, [matchData, gameData, currentGame]);

  // Resume timer if the current game is "In Progress" and has a start_time.
useEffect(() => {
  if (currentGame) {
    if (currentGame.status === "In Progress" && currentGame.start_time) {
      let isoStartTime = currentGame.start_time;
      if (isoStartTime.includes(" ")) {
        isoStartTime = isoStartTime.replace(" ", "T") + "Z";
      }
      const parsedStart = new Date(isoStartTime);
      if (!isNaN(parsedStart.getTime())) {
        console.log("Resuming game timer from:", parsedStart);
        setStartTime(parsedStart);
        setTimerActive(true);
      } else {
        console.error("Invalid start_time:", currentGame.start_time);
      }
    } else if (currentGame.status === "Completed") {
      setTimerActive(false);
      // If duration exists, use it. Otherwise, reset elapsedTime.
      if (currentGame.duration) {
        setElapsedTime(currentGame.duration);
      } else {
        setElapsedTime(0);
      }
    } else {
      // If the game is neither In Progress nor Completed, reset timer.
      setTimerActive(false);
      setElapsedTime(0);
    }
  }
}, [currentGame, gameData, matchData]);


  // Update elapsed time every second when timer is active.
  useEffect(() => {
    let interval;
    if (timerActive && startTime) {
      interval = setInterval(() => {
        const secondsElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(secondsElapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, startTime]);

  
  // Convert seconds to HH:MM:SS format.
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };


  

  return (
    <Card sx={{ overflow: "hidden" }}>
      <MDBox
        bgColor={bgColor}
        variant="gradient"
        sx={({ palette: { background } }) => ({
          background: darkMode && background.card,
        })}
      >
        <MDBox p={2}>
          <Grid container alignItems="center" justifyContent="space-between">
            {/* Left: Button to change game status */}
            <Grid item xs={4} display="flex" justifyContent="flex-start">
            <MDButton
  variant="outlined"
  color={
    matchData?.status === "Not Started"
      ? "warning"
      : currentGame?.status === "Not Started"
      ? "success"
      : currentGame?.status === "In Progress"
      ? "error"
      : "success"
  }
  sx={{ mr: 2 }}
  onClick={handleGameStatusChange}
  disabled={
    matchData?.status !== "In Progress" || currentGame?.status === "Completed"
  }
>
  {matchData?.status === "Not Started"
    ? "Pending"
    : currentGame?.status === "Not Started"
    ? "Start"
    : currentGame?.status === "In Progress"
    ? "Complete"
    : "Completed"}
</MDButton>


            </Grid>

            {/* Middle: Timer display */}
            <Grid item xs={4} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <MDTypography
                variant="button"
                color={bgColor === "white" ? "text" : "white"}
                opacity={bgColor === "white" ? 1 : 0.7}
                textTransform="capitalize"
              >
                Game ({matchData.current_game}) Timer
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color={bgColor === "white" ? "dark" : "white"}>
                {formatTime(elapsedTime)}
              </MDTypography>
            </Grid>

            {/* Right: Icon display */}
            <Grid item xs={4} display="flex" justifyContent="flex-end">
              <MDBox
                variant="gradient"
                bgColor={bgColor === "white" ? icon.color : "white"}
                color={bgColor === "white" ? "white" : "dark"}
                width="4rem"
                height="4rem"
                borderRadius="md"
                display="flex"
                justifyContent="center"
                alignItems="center"
                shadow="md"
              >
                <Icon fontSize="medium" color="inherit">
                  {icon.component}
                </Icon>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

GameTimer.propTypes = {
  bgColor: PropTypes.string,
  title: PropTypes.shape({
    text: PropTypes.string,
  }),
  percentage: PropTypes.shape({
    color: PropTypes.string,
    text: PropTypes.string,
  }),
  icon: PropTypes.shape({
    component: PropTypes.node,
    color: PropTypes.string,
  }),
  direction: PropTypes.string,
  matchData: PropTypes.object,
  setMatchData: PropTypes.func,
  gameData: PropTypes.array.isRequired,
  setGameData: PropTypes.func.isRequired,
};

GameTimer.defaultProps = {
  bgColor: "white",
  title: {
    text: "",
  },
  percentage: {
    color: "success",
    text: "",
  },
  direction: "right",
  icon: {
    component: "timer",
    color: "info",
  },
};

export default GameTimer;
