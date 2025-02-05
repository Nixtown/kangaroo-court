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
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import MDButton from "/components/MDButton";

// Layout components
import BasicEventInformation from "/pagesComponents/pages/score-logging/basic-event-information";
import TeamScore from "/pagesComponents/pages/score-logging/team-score";

function LogScore() {
  
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
                    Current Game:
                  </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <MDButton
                              variant="gradient"
                              color="dark"
                              fullWidth
                              type="submit"
                              >
                              Previous
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <MDButton
                              variant="gradient"
                              color="dark"
                              fullWidth
                              type="submit"
                              >
                              Next
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
          <MDBox p={3}>
            <Grid container rowSpacing={3} columnSpacing={2}>
              <Grid item xs={12} lg={2.4}>
                <TeamScore gameNumber={1}/>
              </Grid>
              <Grid item xs={12} lg={2.4}>
                <TeamScore gameNumber={2}/>
              </Grid>
              <Grid item xs={12} lg={2.4}>
                <TeamScore gameNumber={2}/>
              </Grid>
              <Grid item xs={12} lg={2.4}>
                <TeamScore gameNumber={4}/>
              </Grid>
              <Grid item xs={12} lg={2.4}>
                <TeamScore gameNumber={5}/>
              </Grid>
            </Grid>
          </MDBox>  
          
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}



export default LogScore;
