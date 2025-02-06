import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import Card from "@mui/material/Card";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";

import TeamScore from "/pagesComponents/pages/score-logging/rally-controller";
import RallyController from "../../../pagesComponents/pages/score-logging/rally-controller";

export default function TestComponent() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} lg={7}>
                <RallyController/>
            </Grid>
        </Grid>    
      </MDBox>
    </DashboardLayout>
  );
}
