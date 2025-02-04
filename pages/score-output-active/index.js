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

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

export default function ScoreOutputActive() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
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
          <MDTypography variant="h5" textAlign="center" mb={3}>
            Elare Pickleball Broadcast
          </MDTypography>
          <Grid container spacing={2}>
            {/* Tournament Name */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" color="text">
                Tournament Name:
              </MDTypography>
              <MDTypography variant="body1">
                {payload && payload.tournamentName
                  ? payload.tournamentName
                  : "No tournament name provided"}
              </MDTypography>
            </Grid>
            {/* Match Title */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" color="text">
                Match Title:
              </MDTypography>
              <MDTypography variant="body1">
                {payload && payload.matchTitle
                  ? payload.matchTitle
                  : "No match title provided"}
              </MDTypography>
            </Grid>
            {/* (A) Team Name */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" color="text">
                (A) Team Name:
              </MDTypography>
              <MDTypography variant="body1">
                {payload && payload.teamA
                  ? payload.teamA
                  : "No team A provided"}
              </MDTypography>
            </Grid>
            {/* (B) Team Name */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" color="text">
                (B) Team Name:
              </MDTypography>
              <MDTypography variant="body1">
                {payload && payload.teamB
                  ? payload.teamB
                  : "No team B provided"}
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