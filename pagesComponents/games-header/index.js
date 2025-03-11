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
import Switch from "@mui/material/Switch";
import { toast } from "react-toastify";
// Default avatar as fallback
import defaultLogo from "/assets/images/logos/elare-square.png";
import Link from "next/link";
import MDButton from "/components/MDButton"; 


function GamesHeader({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [branding, setBranding] = useState(null);
  const router = useRouter();
  const { match_id } = router.query;


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
      .eq("active_branding", true)
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

  const handleMakeActive = async () => {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      toast.error("User not authenticated.");
      return;
    }
    // Deactivate all matches for this user
    const { error: updateAllError } = await supabase
      .from("matches")
      .update({ active_match: false })
      .eq("user_id", user.id);
    if (updateAllError) {
      console.error("Error deactivating matches:", updateAllError);
      toast.error("Error deactivating matches.");
      return;
    }
    // Activate the current match
    const { error: updateActiveError } = await supabase
      .from("matches")
      .update({ active_match: true })
      .eq("id", match_id);
    if (updateActiveError) {
      console.error("Error activating match:", updateActiveError);
      toast.error("Error activating match.");
      return;
    }
    toast.success("Overlay is active for this match.");
    // Update local state to reflect the change immediately
    setMatchData(prev => prev ? { ...prev, active_match: true } : prev);
  };
  

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
            imgProps={{ style: { objectFit: "contain", width: "100%", height: "100%", padding: "8px" } }}
          />
        ) : (
          // Fallback Avatar until branding loads
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
              <MDTypography variant="h4" fontWeight="medium">
                {matchData ? matchData.tournament_name : "Tournament Name"}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {matchData
                  ? `${matchData.team_a_name} vs ${matchData.team_b_name}`
                  : "Team A vs Team B"}
              </MDTypography>
              <MDBox></MDBox>
              <MDTypography color="text" fontWeight="regular" variant="button">Overlay</MDTypography>
              <Switch
              checked={matchData?.active_match || false}
              onChange={(e) => {
                // Only allow toggling on; if already active, do nothing.
                if (e.target.checked && !matchData?.active_match) {
                  handleMakeActive();
                }
              }}
              disabled={matchData?.active_match} // disable switch when already active
            />
            </MDBox>
          </Grid>
          <Grid item sx={{ ml: "auto" }}>
            <Link href={`/app/rally-controller/${match_id}`} passHref>
              <MDButton variant="gradient" color="dark">
                Launch Controller
              </MDButton>
            </Link>
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
