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
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";

// Layout components
import BasicEventInformation from "/pagesComponents/pages/score-logging/basic-event-information";
import TeamScore from "/pagesComponents/pages/score-logging/team-score";

function LogScore() {
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <BasicEventInformation />
          </Grid>
        </Grid>
      <MDBox mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={2.2}>
            <TeamScore gameNumber={1}/>
          </Grid>
          <Grid item xs={12} lg={2.2}>
            <TeamScore gameNumber={2}/>
          </Grid>
          <Grid item xs={12} lg={2.2}>
            <TeamScore gameNumber={3}/>
          </Grid>
          <Grid item xs={12} lg={2.2}>
            <TeamScore gameNumber={4}/>
          </Grid>
          <Grid item xs={12} lg={2.2}>
            <TeamScore gameNumber={5}/>
          </Grid>
        </Grid>
      </MDBox>  
      </MDBox>
    </DashboardLayout>
  );
}

export default LogScore;
