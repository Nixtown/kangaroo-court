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

// Layout components
import BaseLayout from "/pagesComponents/pages/account/components/BaseLayout";
import BasicEventInformation from "/pagesComponents/pages/log-score";

function LogScore() {
  
  return (
    <BaseLayout>
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <BasicEventInformation />
          </Grid>
        </Grid>
      </MDBox>
    </BaseLayout>
  );
}

export default LogScore;
