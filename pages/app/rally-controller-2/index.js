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

import RallyController2 from "/pagesComponents/pages/score-logging/rally-controller-2";

const RallyControllerDash2 = () => {

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Grid container spacing={1}>
          <Grid item xs={12} lg={12} >
            <RallyController2  />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}



export default RallyControllerDash2;
