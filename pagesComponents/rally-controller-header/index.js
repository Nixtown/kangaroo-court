import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Switch from "@mui/material/Switch";
import Link from "next/link";
import { keyframes } from "@mui/material/styles";
import { toast } from "react-toastify";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import breakpoints from "/assets/theme/base/breakpoints";
import { supabase } from "/lib/supabaseClient";
import defaultLogo from "/assets/images/logos/elare-square.png";
import { Typography } from "@mui/material";

function RallyControllerHeader({ children, setMatchData, matchData}) {
  const [branding, setBranding] = useState(null);
  const router = useRouter();
  const { match_id } = router.query;
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Animation for active match
  const glow = (color) => keyframes`
    0% {
      box-shadow: 0 0 5px 0 ${color};
    }
    50% {
      box-shadow: 0 0 15px 5px ${color};
    }
    100% {
      box-shadow: 0 0 5px 0 ${color};
    }
  `;

  // Fetch match data from Supabase
  useEffect(() => {
    if (!match_id) return;
    const fetchMatchData = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", match_id)
        .single();
      if (error) {
        console.error("Error fetching match data:", error);
      } else {
        console.log("Match data:", data);
        setMatchData(data);
      }
    };
    fetchMatchData();
  }, [match_id]);

  // Fetch active branding (logo and primary color)
  useEffect(() => {
    const fetchBranding = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data, error } = await supabase
        .from("branding")
        .select("logo_url, primary_color")
        .eq("user_id", user.id)
        .eq("active_branding", true)
        .maybeSingle();
      if (error) {
        console.error("Error fetching branding:", error);
      } else {
        setBranding(data);
      }
    };
    fetchBranding();
  }, []);

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

  // Activate the current match overlay.
  const handleMakeActive = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      toast.error("User not authenticated.");
      return;
    }
    // Deactivate all matches for this user.
    const { error: updateAllError } = await supabase
      .from("matches")
      .update({ active_match: false })
      .eq("user_id", user.id);
    if (updateAllError) {
      console.error("Error deactivating matches:", updateAllError);
      toast.error("Error deactivating matches.");
      return;
    }
    // Activate the current match.
    const { error: updateActiveError } = await supabase
      .from("matches")
      .update({ active_match: true })
      .eq("id", match_id);
    if (updateActiveError) {
      console.error("Error activating match:", updateActiveError);
      toast.error("Error activating match.");
      return;
    }
    toast.success("Overlay is active for this match.");
    setMatchData(prev => prev ? { ...prev, active_match: true } : prev);
  };
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



  return (
    <MDBox position="relative" mb={3}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            {branding ? (
              <Avatar
                src={branding.logo_url}
                alt="Logo"
                sx={{
                  boxSizing: "border-box",
                  bgcolor: branding.primary_color,
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid",
                  borderColor: branding.primary_color,
                  animation:
                    matchData && matchData.active_match
                      ? `${glow(branding.primary_color)} 2s linear infinite`
                      : "none",
                  transition: "all 0.3s ease-in-out",
                }}
                imgProps={{
                  style: { objectFit: "contain", width: "100%", height: "100%", padding: "8px" },
                }}
              />
            ) : (
              <Avatar
                src={defaultLogo}
                alt="Logo"
                sx={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid black",
                }}
              />
            )}
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              {/* <MDTypography variant="h4" fontWeight="medium">
                {matchData ? matchData.tournament_name : "Tournament Name"}
              </MDTypography> */}
              <MDTypography variant="h4" color="dark" fontWeight="bold">
                {matchData
                  ? `${matchData.team_a_name} vs ${matchData.team_b_name}`
                  : "Team A vs Team B"}
              </MDTypography>
              <MDBox>
            <MDTypography variant="button">
              {matchData ? `Best of ${matchData.best_of} | Game: ${matchData.current_game}` : "Best of 3 : Game 1"}
            </MDTypography>
          </MDBox>
              <MDBox mt={1}>
                <Typography variant="button" sx={{ fontWeight: "bold" }}>
                  {formatTime(elapsedTime)}
                </Typography>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item sx={{ ml: "auto" }}>
            <MDButton
              variant="gradient"
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
                ? "Start Match"
                : matchData?.status === "In Progress"
                ? "Complete Match"
                : "Match Completed"}
            </MDButton>
            <Link href={`/app/view-games/${match_id}`} passHref>
              <MDButton variant="outlined" color="dark">
                View Match
              </MDButton>
            </Link>
            <MDTypography ml={2} variant="button">
              Overlay
            </MDTypography>
            <Switch
              checked={matchData?.active_match || false}
              onChange={(e) => {
                if (e.target.checked && !matchData?.active_match) {
                  handleMakeActive();
                }
              }}
              disabled={matchData?.active_match}
             
            />
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

RallyControllerHeader.defaultProps = {
  children: "",
};

RallyControllerHeader.propTypes = {
  children: PropTypes.node,
};

export default RallyControllerHeader;
