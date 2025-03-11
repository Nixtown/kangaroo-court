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
import RallyControllerWConfig from "/pagesComponents/pages/score-logging/rally-controller-w-config";
import RallyControllerHeader from "../../../pagesComponents/rally-controller-header";

const RallyControllerDash = () => {

  const [parentMatchData, setParentMatchData] = useState({
    current_game: 1,
    team_a_name: "Team A",
    team_b_name: "Team B",
    best_of: 3,
  });
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Grid container spacing={1}>
          <Grid item xs={12} lg={8} >
            <RallyControllerHeader parentMatchData={parentMatchData}/>
            <RallyControllerWConfig setParentMatchData={setParentMatchData}/>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}



export default RallyControllerDash;
