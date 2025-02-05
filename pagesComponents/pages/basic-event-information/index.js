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
import MDButton from "/components/MDButton";
import { supabase } from '/lib/supabaseClient';

const BasicEventInformation = () => {
  // Local state for form fields
  const [tournamentName, setTournamentName] = useState("");
  const [matchTitle, setMatchTitle] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  // State to store the Pusher channel reference
  const [channel, setChannel] = useState(null);

  useEffect(() => {
     // Fetch Data from SupaBase
     async function fetchData() {
      const { data, error } = await supabase
        .from("log_score")
        .select("*")
        .eq("id", 2)
        .single(); // Assumes there is only one row with id=2

      if (error) {
        console.error("Error fetching log score:", error);
      } else if (data) {
        setTournamentName(data.tournament_name || "");
        setMatchTitle(data.match_title || "");
        setTeamA(data.team_a || "");
        setTeamB(data.team_b || "");
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

  // Handler to trigger the Pusher event on form submission
  const handleUpdate = async (e) => {
    e.preventDefault();

    const data = {
      tournamentName,
      matchTitle,
      teamA,
      teamB,
    };

    // Insert data into the "log_score" table
    const { error } = await supabase.from('log_score').upsert([
      {
        id: 2,
        tournament_name: tournamentName,
        match_title: matchTitle,
        team_a: teamA,
        team_b: teamB,
      },
    ]);

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
    <Card id="basic-event-info" sx={{ overflow: "visible" }}>
    <MDBox p={3}>
        <MDTypography variant="h5">
        Basic Event Information
        </MDTypography>
    </MDBox>
    <MDBox
        component="form"
        pb={3}
        px={3}
        onSubmit={handleUpdate}
    >
        <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
            <MDInput
            fullWidth
            label="Tournament Name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            inputProps={{ type: "text", autoComplete: "" }}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <MDInput
            fullWidth
            label="Match Title"
            value={matchTitle}
            onChange={(e) => setMatchTitle(e.target.value)}
            inputProps={{ type: "text", autoComplete: "" }}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <MDInput
            fullWidth
            label="(A) Team Name"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            inputProps={{ type: "text", autoComplete: "" }}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
            <MDInput
            fullWidth
            label="(B) Team Name"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            inputProps={{ type: "text", autoComplete: "" }}
            />
        </Grid>
        <Grid item xs={3}>
            <MDButton
            variant="gradient"
            color="dark"
            fullWidth
            type="submit"
            >
            Update
            </MDButton>
        </Grid>
        </Grid>
    </MDBox>
    </Card>
  );
};

export default BasicEventInformation;
