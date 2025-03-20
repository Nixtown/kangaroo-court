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

function CycleGame({ setMatchData, matchData, setGameData, gameData }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const currentGame =   matchData && gameData ? matchData.current_game
  : 1;


  
  const handleChangeGame = async (delta) => {
    // Calculate the new game number
    const newGameNumber = matchData.current_game + delta;
  
    // Check boundaries: ensure it doesn't go below 1 or above best_of
    if (newGameNumber < 1 || newGameNumber > matchData.best_of) {
      console.log("Game number out of bounds.");
      return;
    }
  
    // Only update if there's an actual change
    if (newGameNumber !== matchData.current_game) {
      const { data, error } = await supabase
        .from('matches')
        .update({ current_game: newGameNumber })
        .eq('id', matchData.id);
  
      if (error) {
        console.error("Error updating match current_game:", error);
      } else {
        setMatchData(prev => ({ ...prev, current_game: newGameNumber }));
      }
    }
  };


  return (
    <Card sx={{ overflow: "hidden", marginTop: "24px" }}>
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
            onClick={() => handleChangeGame(-1)}
            disabled={matchData.current_game === 1}
          >
            <RemoveIcon />
          </MDButton>
          <MDTypography variant="h6" color="dark" align="center" sx={{ mx: 2 }}>
           Change Game ({currentGame})
          </MDTypography>
          <MDButton
            variant="gradient"
            color="dark"
            sx={{ ml: 2 }}
            onClick={() => handleChangeGame(+1)}
            disabled={matchData.current_game === matchData.best_of}
          >
            <AddIcon />
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default CycleGame;
