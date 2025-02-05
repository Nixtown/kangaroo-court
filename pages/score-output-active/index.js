/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================
* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
Coded by www.creative-tim.com
==========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { supabase } from '/lib/supabaseClient';

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

export default function ScoreOutputActive() {
  const [payload, setPayload] = useState(null);
  const [tournamentName, setTournamentName] = useState("");
  const [matchTitle, setMatchTitle] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [teamAScoreGame1, setTeamAScoreGame1] = useState("");
  const [teamBScoreGame1, setTeamBScoreGame1] = useState("");

  
  useEffect(() => {
      // Fetch Data from SupaBase
      async function fetchData() {

        const { data, error } = await supabase
          .from("scoreboard")
          .select("*")
          .eq("id", 1)
          .single(); // Assumes there is only one row with id=2

        if (error) {
          console.error("Error fetching log score:", error);
        } else if (data) {
          setTournamentName(data.tournament_name || "");
          setMatchTitle(data.match_title || "");
          setTeamA(data.team_a || "");
          setTeamB(data.team_b || "");
          setTeamAScoreGame1(data.team_a_score_game1 || "");
          setTeamBScoreGame1(data.team_b_score_game1 || "");      
        }
        
      }
      fetchData();

    // Enable logging for debugging (optional)
    Pusher.logToConsole = true;

    // Initialize Pusher with public environment variables
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
      authEndpoint: "/api/pusher/auth", // Tell Pusher to use your API route for authentication
    });

    // Subscribe to the "private-log-score" channel
    const channel = pusher.subscribe("private-log-score");

    // Listen for the "client-log-score-update" event
    channel.bind("client-log-score-update", (data) => {
      console.log("Received Pusher event:", data);
      setPayload(data);
    });

    // Cleanup on component unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return (
    <MDBox mt={{ xs: 4, md: 10 }} mb={{ xs: 4, md: 8 }}>
  <Grid container justifyContent="center">
    <Grid item xs={12} sm={10} md={8}>
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h4" textAlign="center" mb={3}>
            Elare Pickleball Broadcast
          </MDTypography>
          <Grid container spacing={2}>
            {/* Tournament Name */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
                Tournament Name:
              </MDTypography>
              <MDTypography variant="body2">
                {payload?.tournamentName ? payload.tournamentName : tournamentName}
              </MDTypography>
            </Grid>
            {/* Match Title */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
                Match Title:
              </MDTypography>
              <MDTypography variant="body2">
                {payload?.matchTitle
                  ? payload.matchTitle
                  : matchTitle}
              </MDTypography>
            </Grid>
            {/* (A) Team Name */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
                Team A:
              </MDTypography>
              <MDTypography variant="body2">
                {payload?.teamA
                  ? payload.teamA
                  : teamA}
              </MDTypography>
            </Grid>
            {/* (B) Team Name */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
                Team B:
              </MDTypography>
              <MDTypography variant="body2">
                {payload?.teamB
                  ? payload.teamB
                  : teamB}
              </MDTypography>
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="h6" color="text">
                Current Score
              </MDTypography>
              <MDTypography variant="body2">
              {payload?.teamAScoreGame1 && payload?.teamBScoreGame1
              ? `${payload.teamAScoreGame1} - ${payload.teamBScoreGame1}`
              : `${teamAScoreGame1} - ${teamBScoreGame1}`}

              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
      </Card>
    </Grid>
  </Grid>
</MDBox>

  );
}

// Flag to indicate that this page should be rendered without the default sidenav and configurator.
ScoreOutputActive.noSidenav = true;