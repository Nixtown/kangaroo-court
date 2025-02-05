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
import Pusher from "pusher-js";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import { supabase } from '/lib/supabaseClient';

const TeamScore = ({ gameNumber = 1 }) => {
  // State to store the Pusher channel reference
  const [channel, setChannel] = useState(null);
  const [teamAScore, setTeamAScore] = useState("");
  const [teamBScore, setTeamBScore] = useState("");

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
        setTeamAScore(data[`team_a_score_game${gameNumber}`] || "0");
        setTeamBScore(data[`team_b_score_game${gameNumber}`] || "0");
    }
  }
  fetchData();
  

    // Initialize Pusher with the public environment variables
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
      authEndpoint: "/api/pusher/auth", // Make sure your API route is set up correctly
    });
    console.log("Pusher Key (Client Side):", process.env.NEXT_PUBLIC_PUSHER_APP_KEY);

    // Subscribe to a private channel for log-score events
    const pusherChannel = pusher.subscribe("private-log-score");
    setChannel(pusherChannel);

    // Cleanup on component unmount
    return () => {
      pusherChannel.unsubscribe();
      pusher.disconnect();
    };

  }, []);

  const handleUpdate = async (newTeamAScore, newTeamBScore) => {
    // Convert input values to integers, defaulting to 0 if empty or invalid.
    const numericTeamAScore = newTeamAScore === "" ? 0 : parseInt(newTeamAScore, 10);
    const numericTeamBScore = newTeamBScore === "" ? 0 : parseInt(newTeamBScore, 10);
  
    const data = {
      teamAScore: numericTeamAScore,
      teamBScore: numericTeamBScore,
    };
    console.log("Handler is Running", data);
  
    // Insert data into the "log_score" table
    const { error } = await supabase
    .from('scoreboard')
    .update({
        [`team_a_score_game${gameNumber}`]: numericTeamAScore,
        [`team_b_score_game${gameNumber}`]: numericTeamBScore,
    })
    .eq('id', 1);
  
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Data saved successfully:", data);
        // Optionally, trigger your Pusher event here as well.
      }
  
  
      // Trigger Pusher event if channel is available
      if (channel) {
        channel.trigger("client-log-score-update", data);
        console.log("Update sent via Pusher:", data);
      } else {
        console.error("Pusher channel is not available");
      }
    };
  
  


  return (
    <Card id="score-loggin" sx={{ overflow: "visible" }} variant="outlined">
    <MDBox px={3} pb={2} pt={2} >
        <MDTypography variant="body2">
        {"Game: " + gameNumber}
        </MDTypography>
    </MDBox>
    <MDBox
        component="form"
        pb={3}
        px={3}
    >
    <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
            <MDInput
            fullWidth
            label="A"
            value={teamAScore ? teamAScore : "0"}
            onChange={(e) => {
                const newValue = e.target.value;
                setTeamAScore(newValue);
                // Call the handler immediately with the new value and the current value of Team B's score
                handleUpdate(newValue, teamBScore);
            }}
            inputProps={{ type: "number" }}
            />
        </Grid>
        <Grid item xs={12} sm={12}>
            <MDInput
            fullWidth
            label="B"
            value={teamBScore ? teamBScore : "0"}
            onChange={(e) => {
                const newValue = e.target.value;
                setTeamBScore(newValue);
                // Call the handler immediately with the new value and the current value of Team B's score
                handleUpdate(teamAScore, newValue);
            }}
            inputProps={{ type: "number" }}
            />
        </Grid>
    </Grid>
    </MDBox>
    </Card>
  );
};

export default TeamScore;
