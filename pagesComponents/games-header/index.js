import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDAvatar from "/components/MDAvatar";
import breakpoints from "/assets/theme/base/breakpoints";
import backgroundImage from "/assets/images/bg-profile.jpeg";
import { supabase } from "/lib/supabaseClient";
import Avatar from "@mui/material/Avatar";
import { keyframes } from "@mui/material/styles";

// Default avatar as fallback
import defaultLogo from "/assets/images/logos/elare-square.png";


function GamesHeader({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [branding, setBranding] = useState(null);

  const router = useRouter();
  const { match_id } = router.query;

  // Define the blinking animation keyframes
const blinker = keyframes`
50% {
  opacity: 0;
}
`;


  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }
    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, []);

  useEffect(() => {
    if (!match_id) return;
    const fetchMatchData = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", match_id)
        .single();
      if (error) {
        console.error("Error fetching match data:", error);
      } else {
        console.log("Match data:", data);
        setMatchData(data);
      }
    };
    fetchMatchData();
  }, [match_id]);

 // Fetch active branding (including logo_url and primary_color)
 useEffect(() => {
  const fetchBranding = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }
    const { data, error } = await supabase
      .from("branding")
      .select("logo_url, primary_color")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    if (error) {
      console.error("Error fetching branding:", error);
    } else {
      setBranding(data);
    }
  };
  fetchBranding();
}, []);

  useEffect(() => {
    if (matchData) {
      console.log("Active match value:", matchData.active_match);
    }
  }, [matchData]);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="10rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({
            functions: { rgba, linearGradient },
            palette: { gradients },
          }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
          <Avatar
      src={branding && branding.logo_url ? branding.logo_url : defaultLogo.src}
      alt="Logo"
      sx={{
        bgcolor: branding && branding.primary_color ? branding.primary_color : "primary.main",
        width: "67px",
        height: "67px",
      }}
      imgProps={{ style: { objectFit: "contain" } }}
    />

          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h4" fontWeight="medium">
                {matchData ? matchData.tournament_name : "Tournament Name"}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {matchData
                  ? `${matchData.team_a_name} vs ${matchData.team_b_name}`
                  : "Team A vs Team B"}
              </MDTypography>
              <MDBox></MDBox>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {matchData &&
                (matchData.active_match === true ||
                  matchData.active_match === "true" ||
                  matchData.active_match === 1) ? (
                  <>
                    <MDBox
                      component="span"
                      sx={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "green",
                        marginRight: "4px",
                        animation: `${blinker} 2s linear infinite`,
                      }}
                    />
                    Active
                  </>
                ) : (
                  <>
                    <MDBox
                      component="span"
                      sx={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "red",
                        marginRight: "4px",
                      }}
                    />
                    Inactive
                  </>
                )}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

GamesHeader.defaultProps = {
  children: "",
};

GamesHeader.propTypes = {
  children: PropTypes.node,
};

export default GamesHeader;
