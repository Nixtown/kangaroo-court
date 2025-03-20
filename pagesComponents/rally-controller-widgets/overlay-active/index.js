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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { supabase } from "/lib/supabaseClient";
import Icon from "@mui/material/Icon";


// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO context
import { useMaterialUIController } from "/context";
import { toast } from "react-toastify";


function OverlayActive({setMatchData, matchData }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  

    // Activate the current match overlay.
  const handleMakeActive = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      toast.error("User not authenticated.");
      return;
    }
    // Deactivate all matches for this user.
    const { error: updateAllError } = await supabase
      .from("matches")
      .update({ active_match: false })
      .eq("user_id", user.id);
    if (updateAllError) {
      console.error("Error deactivating matches:", updateAllError);
      toast.error("Error deactivating matches.");
      return;
    }
    // Activate the current match.
    const { error: updateActiveError } = await supabase
      .from("matches")
      .update({ active_match: true })
      .eq("id", matchData.id);
    if (updateActiveError) {
      console.error("Error activating match:", updateActiveError);
      toast.error("Error activating match.");
      return;
    }
    toast.success("Overlay is active for this match.");
    setMatchData(prev => prev ? { ...prev, active_match: true } : prev);
  };

  return (
    <Card sx={{overflow: "hidden", marginTop: "24px" }}>
      <MDBox
        p={3}
        // bgColor={matchData?.active_match  ? "dark" : "white"}
        variant="gradient"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        sx={({ palette: { background } }) => ({
          background: darkMode && !matchData?.active_match  && background.card,
        })}
      >
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb= "4px"
          lineHeight={1}
        >
             <Icon
                    fontSize="large"
                    color={matchData?.active_match  ? "error" : "secondary"}
                  >
                    videocamera
                  </Icon>
          <MDTypography variant="h6" fontWeight="bold" align="center">
            {matchData?.active_match  ? "OBS Active" : "OBS Off"}
          </MDTypography>
          
          <MDBox mt={-0.5} mr={-1.5}>
            <Switch
                          checked={matchData?.active_match || false}
                          onChange={(e) => {
                            if (e.target.checked && !matchData?.active_match) {
                              handleMakeActive();
                            }
                          }}
                          disabled={matchData?.active_match}
                         
                        />
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}



export default OverlayActive;
