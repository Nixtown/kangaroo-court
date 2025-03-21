import { useState, useEffect } from "react";
import { supabase } from "/lib/supabaseClient";
import MDButton from "/components/MDButton";

// @mui material components
import Card from "@mui/material/Card";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO context
import { useMaterialUIController } from "/context";
import { toast } from "react-toastify";

// Material UI Icons
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function CycleServers({ setMatchData, matchData, setGameData, gameData }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const currentServer =
  matchData && gameData && gameData.length >= matchData.current_game
    ? gameData[matchData.current_game - 1].server
    : 0;

  // Function to update server state and persist the change in Supabase
  const updateServer = async (newServer) => {
    if (!matchData || !gameData || gameData.length < matchData.current_game) {
      console.error("Data not loaded or invalid");
      return;
    }

    // Determine the current game index (matchData.current_game is assumed to be 1-indexed)
    const currentGameIndex = matchData.current_game - 1;

    // Clone the current game so we don't mutate state directly.
    let updatedGame = { ...gameData[currentGameIndex] };
    updatedGame.server = newServer;

    // Update local state.
    const newGameData = [...gameData];
    newGameData[currentGameIndex] = updatedGame;
    setGameData(newGameData);

    // Update the game record in Supabase.
    const { data, error } = await supabase
      .from("game_stats")
      .update(updatedGame)
      .eq("id", updatedGame.id);
      
    if (error) {
      console.error("Error updating game server:", error);
      toast.error("Error updating game server.");
    } else {
      console.log("Game server updated successfully:", data);
    }
  };

  // Increment the server (move forward)
  const handleIncrementServer = async () => {
    if (!matchData || !gameData || gameData.length < matchData.current_game) {
      console.error("Data not loaded or invalid");
      return;
    }
    const currentGameIndex = matchData.current_game - 1;
    const currentServer = gameData[currentGameIndex].server || "Server";
    const maxServer = gameData[currentGameIndex].scoring_type === "Rally" ? 2 : 4;
    const newServer = currentServer < maxServer ? currentServer + 1 : 1;
    await updateServer(newServer);
  };

  // Decrement the server (move backward)
  const handleDecrementServer = async () => {
    if (!matchData || !gameData || gameData.length < matchData.current_game) {
      console.error("Data not loaded or invalid");
      return;
    }
    const currentGameIndex = matchData.current_game - 1;
    const currentServer = gameData[currentGameIndex].server;
    const maxServer = gameData[currentGameIndex].scoring_type === "Rally" ? 2 : 4;
    const newServer = currentServer > 1 ? currentServer - 1 : maxServer;
    await updateServer(newServer);
  };

  return (
    <Card sx={{ overflow: "hidden"}}>
      <MDBox
        p={3}
        variant="gradient"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb={0}
          lineHeight={1}
        >
          <MDButton
            variant="gradient"
            color="dark"
            sx={{ mr: 2 }}
            onClick={handleDecrementServer}
          >
            <RemoveIcon />
          </MDButton>
          <MDTypography variant="h6" color="dark" align="center" sx={{ mx: 2 }}>
           Change Server ({currentServer})
          </MDTypography>
          <MDButton
            variant="gradient"
            color="dark"
            sx={{ ml: 2 }}
            onClick={handleIncrementServer}
          >
            <AddIcon />
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default CycleServers;
