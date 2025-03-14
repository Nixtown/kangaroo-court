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
        pr={3}
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <MDBox p={3} lineHeight={1}>
          <MDBox mb={1}>
            <MDTypography variant="h5">Modify Match</MDTypography>
          </MDBox>
          <MDTypography variant="button" color="text">
          Manage match settings or review game details.
          </MDTypography>
        </MDBox>
        <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }}>
        <Link href={`/app/view-games/edit/${matchData.id}`} passHref>
          <MDButton variant="outlined" color="secondary">
            Edit
          </MDButton>
        </Link>
          <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
          <Link href={`/app/matches`} passHref>
            <MDButton variant="gradient" color="dark" sx={{ height: "100%" }}>
              Matches
            </MDButton>
          </Link>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}


<MDButton variant="outlined" color="dark">
  View Match
</MDButton>

export default EditMatch;
