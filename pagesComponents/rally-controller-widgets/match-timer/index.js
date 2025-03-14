/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import { toast } from "react-toastify";
import { supabase } from "/lib/supabaseClient";
import { useState, useEffect } from "react";

// NextJS Material Dashboard 2 PRO context
import { useMaterialUIController } from "/context";

function MatchTimer({
  bgColor,
  title,
  percentage,
  icon,
  direction,
  matchData,
  setMatchData
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [startTime, setStartTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  
  // Resume timer if match is in progress.
  useEffect(() => {
    if (matchData?.status === "In Progress" && matchData.start_time) {
      // Only convert if needed: if there's a space, then it's not ISO
      let isoStartTime = matchData.start_time;
      if (isoStartTime.includes(" ")) {
        isoStartTime = isoStartTime.replace(" ", "T") + "Z";
      }
      const parsedStart = new Date(isoStartTime);
      if (isNaN(parsedStart.getTime())) {
        console.error("Invalid start_time:", matchData.start_time);
      } else {
        console.log("Resuming timer from:", parsedStart);
        setStartTime(parsedStart);
        setTimerActive(true);
      }
    } else if (matchData?.status === "Completed") {
      setTimerActive(false);
      if (matchData.duration) {
        setElapsedTime(matchData.duration);
      }
    }
  }, [matchData]);


// Change match status and persist timer data (start time and duration).
const handleMatchStatusChange = async () => {
  if (!matchData) return;
  let newStatus;
  if (matchData.status === "Not Started") {
    newStatus = "In Progress";
    const newStartTime = new Date().toISOString();

    // Get the authenticated user.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }

    // Turn off any other active matches for this user.
    const { error: deactiveError } = await supabase
      .from("matches")
      .update({ active_match: false })
      .neq("id", matchData.id)
      .eq("user_id", user.id);
    if (deactiveError) {
      console.error("Error deactivating other matches:", deactiveError);
      toast.error("Error deactivating other matches.");
      return;
    }

    // Update the current match to start and mark it as active.
    const { error } = await supabase
      .from("matches")
      .update({ status: newStatus, start_time: newStartTime, active_match: true })
      .eq("id", matchData.id);
    if (error) {
      console.error("Error updating match status:", error);
      toast.error("Error updating match status.");
      return;
    }
    setStartTime(new Date(newStartTime));
    setMatchData((prev) => ({
      ...prev,
      status: newStatus,
      start_time: newStartTime,
      active_match: true,
    }));
 
    toast.success(`Match started at ${newStartTime}`);
  } else if (matchData.status === "In Progress") {
    newStatus = "Completed";
    const elapsedDuration = Date.now() - new Date(matchData.start_time).getTime();
    const elapsedSeconds = Math.floor(elapsedDuration / 1000);
    const { error } = await supabase
      .from("matches")
      .update({ status: newStatus, duration: elapsedSeconds })
      .eq("id", matchData.id);
    if (error) {
      console.error("Error updating match status:", error);
      toast.error("Error updating match status.");
      return;
    }
    setMatchData((prev) => ({
      ...prev,
      status: newStatus,
      duration: elapsedSeconds,
    }));
    setTimerActive(false);
    toast.success(`Match completed with duration ${formatTime(elapsedSeconds)}`);
  }

};


  // Update the elapsed time every second when timer is active.
  useEffect(() => {
    let interval;
    if (timerActive && startTime) {
      interval = setInterval(() => {
        const secondsElapsed = Math.max(
          0,
          Math.floor((Date.now() - startTime.getTime()) / 1000)
        );
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
          
          {/* Button First */}
          <Grid item xs={4} display="flex" justifyContent="flex-start">
              <MDButton
              variant="outlined"
              color={
                matchData?.status === "Not Started"
                  ? "success"
                  : matchData?.status === "In Progress"
                  ? "error"
                  : "success"
              }
              sx={{ mr: 2 }}
              onClick={handleMatchStatusChange}
              disabled={matchData?.status === "Completed"}
            >
              {matchData?.status === "Not Started"
                ? "Start"
                : matchData?.status === "In Progress"
                ? "Complete"
                : "Completed"}
            </MDButton>
          </Grid>
  
          {/* Timer in the Middle */}
          <Grid item xs={4}display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <MDTypography
                  variant="button"
                  color={bgColor === "white" ? "text" : "white"}
                  opacity={bgColor === "white" ? 1 : 0.7}
                  textTransform="capitalize"
                  fontWeight={title.fontWeight}
                >
                  {title.text}
                </MDTypography>
            <MDTypography
              variant="h5"
              fontWeight="bold"
              color={bgColor === "white" ? "dark" : "white"}
            >
              {formatTime(elapsedTime)}{" "}
            </MDTypography>
          </Grid>
  
          {/* Icon Last */}
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

// Setting default values for the props of MatchTimer
MatchTimer.defaultProps = {
  bgColor: "white",
  title: {
    fontWeight: "light",
    text: "",
  },
  percentage: {
    color: "success",
    text: "",
  },
  direction: "right",
};



export default MatchTimer;
