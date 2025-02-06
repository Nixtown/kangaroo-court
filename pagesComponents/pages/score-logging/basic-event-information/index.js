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
      }
    }
    fetchData();


  }, []);

  // Handler to trigger the Pusher event on form submission
  const handleUpdate = async (e) => {
    e.preventDefault();


    // Insert data into the "log_score" table
    const { error } = await supabase
    .from('scoreboard')
    .update({
        tournament_name: tournamentName,
        match_title: matchTitle,
        team_a: teamA,
        team_b: teamB,
    })
    .eq('id', 1);
 

    if (error) {
      console.error("Error saving to Supabase:", error);
    } else {
      console.log("Data saved successfully:");
    }
  };



  return (
    <Card lg={12} id="basic-event-info" sx={{ overflow: "visible" }}>
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
