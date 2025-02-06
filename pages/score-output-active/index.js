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
import { supabase } from '/lib/supabaseClient';

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

export default function ScoreOutputActive() {
  const [scoreData, setScoreData] = useState(null);

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

    // Create a channel and subscribe to realtime changes
    const subscription = supabase
    .channel('scoreboard-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'scoreboard',
        filter: 'id=eq.1',
      },
      (payload) => {
        console.log("Realtime update received on Output Page:", payload);
        setScoreData(payload.new);
      }
    )
    .subscribe();

    // Cleanup the subscription when the component unmounts
    return () => {
      supabase.removeChannel(subscription);
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
              {scoreData?.tournament_name ?? "Loading..."}
              </MDTypography>
            </Grid>
            {/* Match Title */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
                Match Title:
              </MDTypography>
              <MDTypography variant="body2">
              {scoreData?.match_title ?? "Loading..."}
              </MDTypography>
            </Grid>
            {/* (A) Team Name */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
                Team A:
              </MDTypography>
              <MDTypography variant="body2">
              {scoreData?.team_a ?? "Loading..."}
              </MDTypography>
            </Grid>
            {/* (B) Team Name */}
            <Grid item xs={6}>
              <MDTypography variant="h6" color="text">
              Team B:
              </MDTypography>
              <MDTypography variant="body2">
              {scoreData?.team_b ?? "Loading..."}
              </MDTypography>
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="h6" color="text">
                {scoreData?.current_game ? ` Current Game - ${scoreData.current_game}` : "...Loading"}
              </MDTypography>
              <MDTypography variant="body2">
              {scoreData &&
              scoreData[`team_a_score_game${scoreData.current_game}`] !== undefined &&
              scoreData[`team_b_score_game${scoreData.current_game}`] !== undefined
              ? `${scoreData[`team_a_score_game${scoreData.current_game}`]} - ${scoreData[`team_b_score_game${scoreData.current_game}`]}`
              : "Loading..."}

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