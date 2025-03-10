import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { supabase } from "/lib/supabaseClient";
import dataTableData from "/pagesComponents/ecommerce/orders/order-list/data/dataTableData";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
// Data
import GamesTable from "../../../examples/Tables/GamesTable";
import Footer from "/examples/Footer";
import GamesHeader from "/pagesComponents/games-header";



const ViewGames = () => {
  const router = useRouter();
  

  return (
    <DashboardLayout>
    <DashboardNavbar />
    <GamesHeader />
    <MDBox my={3}>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={0}
      >
      </MDBox>
      <Card>
        <GamesTable entriesPerPage={false} />
      </Card>
    </MDBox>
    <Footer />
  </DashboardLayout>
  );
};

export default ViewGames;
