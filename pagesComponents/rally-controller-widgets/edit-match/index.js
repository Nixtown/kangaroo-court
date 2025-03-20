/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Card from "@mui/material/Card";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import Link from "next/link";


function EditMatch({matchData}) {
  return (
    <Card id="delete-account">
  <MDBox
    p={2}
    display="flex"
    flexDirection={{ xs: "column", sm: "row" }}
    alignItems="center"
    justifyContent="space-between"
  >
    <MDBox mb={{ xs: 2, sm: 0 }}>
      <MDTypography variant="h5" mb={1}>
        Modify Match
      </MDTypography>
      <MDTypography variant="body2" color="text">
        Manage match settings or review game details.
      </MDTypography>
    </MDBox>
    <MDBox
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      gap={{ xs: 1, sm: 2 }}
      width={{ xs: "100%", sm: "auto" }}
    >
      <Link href={`/app/view-games/edit/${matchData.id}`} passHref>
        <MDButton variant="outlined" color="secondary" fullWidth>
          Edit
        </MDButton>
      </Link>
      <Link href={`/app/matches/${matchData.event_id}`} passHref>
        <MDButton variant="gradient" color="dark" fullWidth>
          Matches
        </MDButton>
      </Link>
    </MDBox>
  </MDBox>
</Card>

  );
}


<MDButton variant="outlined" color="dark">
  View Match
</MDButton>

export default EditMatch;
