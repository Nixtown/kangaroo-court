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

import { useState, useEffect } from "react";
import { supabase } from '/lib/supabaseClient';

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";


// Layout components

import RallyController from "/pagesComponents/pages/score-logging/rally-controller";

const LogScore = () => {

 // State for the number of games to display (the gameCount)
 const [scoreData, setScoreData] = useState(null);

   // Create an array of game numbers based on gameCount.
  // If gameCount = 1 then [1]; if gameCount = 2 then [1,2], etc.
  const gameNumbers = Array.from({ length: scoreData?.current_game ?? 1 }, (_, i) => i + 1);

  useEffect(() => {
    async function fetchGame() {
      const { data, error } = await supabase
        .from("scoreboard") 
        .select("current_game")
        .eq("id", 1)
        .single(); // Assuming only one active scoreboard

      if (error) {
        console.error("Error fetching current game:", error);
      } else {
        setScoreData(data);
      }
    }
    fetchGame();

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
        console.log("Realtime update received on Log Score:", payload);
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
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Grid container spacing={1}>
          <Grid item xs={12} lg={12}>
            <RallyController />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}



export default LogScore;
