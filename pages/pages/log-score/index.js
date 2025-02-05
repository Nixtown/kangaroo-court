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
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import MDButton from "/components/MDButton";

// Layout components
import BasicEventInformation from "/pagesComponents/pages/score-logging/basic-event-information";
import TeamScore from "/pagesComponents/pages/score-logging/team-score";

const LogScore = () => {

 // State for the number of games to display (the gameCount)
 const [currentGame, setCurrentGame] = useState(1);

   // Create an array of game numbers based on gameCount.
  // If gameCount = 1 then [1]; if gameCount = 2 then [1,2], etc.
  const gameNumbers = Array.from({ length: currentGame }, (_, i) => i + 1);

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
        setCurrentGame(data.current_game || 1);
      }
    }
    fetchGame();
  }, []);

   // Function to update the current game in Supabase
   const updateCurrentGame = async (newGameNumber) => {

    setCurrentGame(newGameNumber); // Update state immediately for UI responsiveness

    const { error } = await supabase
      .from('scoreboard')
      .update({ current_game: newGameNumber })
      .eq('id', 1);

    if (error) {
      console.error("Error updating current game:", error);
    } else {
      console.log("Current game updated to:", newGameNumber);
    }
  };




  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <BasicEventInformation />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Card id="incriment-games" sx={{ overflow: "visible" }}>
              <MDBox p={3}>
                  <MDTypography variant="h5">
                    {"Current Game: " + currentGame}
                  </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <MDButton
                              variant="gradient"
                              color="dark"
                              fullWidth
                              onClick={() => updateCurrentGame(currentGame > 1 ? currentGame - 1 : currentGame)}
                              >
                              Previous
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <MDButton
                              variant="gradient"
                              color="dark"
                              fullWidth
                              onClick={() => updateCurrentGame(currentGame + 1)}
                              >
                              Next
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
          {gameNumbers.map((gameNumber) => (
            <Grid item xs={12} lg={2.4} key={gameNumber}>
              <TeamScore gameNumber={gameNumber} />
            </Grid>
          ))}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}



export default LogScore;
