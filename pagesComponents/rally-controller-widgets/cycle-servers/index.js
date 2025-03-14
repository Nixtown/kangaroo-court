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

import { useState, useEffect } from "react";
import { supabase } from "/lib/supabaseClient";

import MDButton from "/components/MDButton";



// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO context
import { useMaterialUIController } from "/context";
import { toast } from "react-toastify";


function CycleServers({setMatchData, matchData, setGameData, gameData }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const handleCycleServer = async () => {
    // Validate that matchData and gameData exist and the index is valid.
    if (!matchData || !gameData || gameData.length < matchData.current_game) {
      console.error("Data not loaded or invalid");
      return;
    }
    
    // Determine the current game index (matchData.current_game is assumed to be 1-indexed)
    const currentGameIndex = matchData.current_game - 1;
    
    // Clone the current game so we don't mutate state directly.
    let updatedGame = { ...gameData[currentGameIndex] };
    
    // Cycle the server inline:
    const previousServer = updatedGame.server;
    let newServer;
    if (updatedGame.scoring_type === "Rally") {
      // For rally scoring, cycle between 1 and 2.
      newServer = (previousServer % 2) + 1;
    } else {
      // For regular scoring, cycle through 1 to 4.
      newServer = (previousServer % 4) + 1;
    }
    updatedGame.server = newServer;
    
    // Update the local gameData state.
    const newGameData = [...gameData];
    newGameData[currentGameIndex] = updatedGame;
    setGameData(newGameData);
    
    // Update the game record in Supabase.
    const { data, error } = await supabase
      .from('game_stats')
      .update(updatedGame)
      .eq('id', updatedGame.id);
      
    if (error) {
      console.error("Error updating game server:", error);
    } else {
      console.log("Game server updated successfully:", data);
    }
  };
  

  


  return (
    <Card sx={{overflow: "hidden", marginTop: "24px" }}>
      <MDBox
        p={3}
        // bgColor={matchData?.active_match  ? "dark" : "white"}
        variant="gradient"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={0}
          lineHeight={1}
        >
         <MDButton
                  variant="gradient"
                  color="dark"
                  fullWidth
                  onClick={handleCycleServer}
                  >
                  Change Sever
                </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}



export default CycleServers;
