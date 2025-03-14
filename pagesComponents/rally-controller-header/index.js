import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Switch from "@mui/material/Switch";
import Link from "next/link";
import { keyframes } from "@mui/material/styles";
import { toast } from "react-toastify";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import breakpoints from "/assets/theme/base/breakpoints";
import { supabase } from "/lib/supabaseClient";
import defaultLogo from "/assets/images/logos/elare-square.png";
import { Typography } from "@mui/material";

function RallyControllerHeader({ children, setMatchData, matchData, branding}) {
  const router = useRouter();


  // Animation for active match
  const glow = (color) => keyframes`
    0% {
      box-shadow: 0 0 5px 0 ${color};
    }
    50% {
      box-shadow: 0 0 15px 5px ${color};
    }
    100% {
      box-shadow: 0 0 5px 0 ${color};
    }
  `;

  



  return (
    <MDBox position="relative" mb={3}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            {branding ? (
              <Avatar
                src={branding.logo_url}
                alt="Logo"
                sx={{
                  boxSizing: "border-box",
                  bgcolor: branding.primary_color,
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid",
                  borderColor: branding.primary_color,
                  animation:
                    matchData && matchData.active_match
                      ? `${glow(branding.primary_color)} 2s linear infinite`
                      : "none",
                  transition: "all 0.3s ease-in-out",
                }}
                imgProps={{
                  style: { objectFit: "contain", width: "100%", height: "100%", padding: "8px" },
                }}
              />
            ) : (
              <Avatar
                src={defaultLogo}
                alt="Logo"
                sx={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid black",
                }}
              />
            )}
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              {/* <MDTypography variant="h4" fontWeight="medium">
                {matchData ? matchData.tournament_name : "Tournament Name"}
              </MDTypography> */}
              <MDTypography variant="h4" color="dark" fontWeight="bold">
                {matchData
                  ? `${matchData.team_a_name} vs ${matchData.team_b_name}`
                  : "Team A vs Team B"}
              </MDTypography>
              <MDBox>
            <MDTypography variant="button">
              {matchData ? `Best of ${matchData.best_of} | Game: ${matchData.current_game}` : "Best of 3 : Game 1"}
            </MDTypography>
          </MDBox>
            </MDBox>
          </Grid>
          <Grid item sx={{ ml: "auto" }}>
          
            <Link href={`/app/view-games/${matchData.id}`} passHref>
              <MDButton variant="outlined" color="dark">
                View Match
              </MDButton>
            </Link>
            <MDTypography ml={2} variant="button">
              Overlay
            </MDTypography>
            <Switch
              checked={matchData?.active_match || false}
              onChange={(e) => {
                if (e.target.checked && !matchData?.active_match) {
                  handleMakeActive();
                }
              }}
              disabled={matchData?.active_match}
             
            />
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

RallyControllerHeader.defaultProps = {
  children: "",
};

RallyControllerHeader.propTypes = {
  children: PropTypes.node,
};

export default RallyControllerHeader;
