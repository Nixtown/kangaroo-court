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
import AddIcon from "@mui/icons-material/Add";


function EventsHeader({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [branding, setBranding] = useState(null);
  const router = useRouter();



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


  return (
<MDBox position="relative" mb={3}>
  <MDBox
    display="flex"
    alignItems="center"
    position="relative"
    minHeight="10rem"
    borderRadius="xl"
    sx={({ functions: { rgba, linearGradient }, palette: { gradients } }) => ({
      backgroundImage: `${linearGradient(
        rgba(gradients.info.main, 0.6),
        rgba(gradients.info.state, 0.6)
      )}, url(${backgroundImage.src})`,
      backgroundSize: "cover",
      backgroundPosition: "50%",
      overflow: "hidden",
    })}
  />
  <Card
    sx={{
      position: "relative",
      mt: { xs: -15, sm: -8 },
      mx: { xs: 1, sm: 3 },
      py: 2,
      px: 2,
    }}
  >
    <Grid container spacing={2} alignItems="center" wrap="wrap">
      <Grid item>
        {branding ? (
          <Avatar
            src={branding.logo_url}
            alt="Logo"
            sx={{
              boxSizing: "border-box",
              bgcolor: branding.primary_color,
              width: { xs: "60px", sm: "100px" },
              height: { xs: "60px", sm: "100px" },
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
              style: {
                objectFit: "contain",
                width: "100%",
                height: "100%",
                padding: "8px",
              },
            }}
          />
        ) : (
          <Avatar
            src={defaultLogo}
            alt="Logo"
            sx={{
              width: { xs: "60px", sm: "100px" },
              height: { xs: "60px", sm: "100px" },
              borderRadius: "50%",
              border: "3px solid black",
            }}
          />
        )}
      </Grid>
      <Grid item xs zeroMinWidth>
        <MDBox ml={2}>
          <MDTypography
            variant="h4"
            color="dark"
            fontWeight="bold"
          >
            All Events
          </MDTypography>
          <MDTypography variant="subtitle2" color="text">
            View and manage your current events in real-time.
          </MDTypography>
        </MDBox>
      </Grid>
      <Grid item xs={12} sm="auto">
        <Link href="/app/create-event" passHref>
          <MDButton variant="outlined" color="dark" fullWidth>
            Create Event
          </MDButton>
        </Link>
      </Grid>
    </Grid>
    {children}
  </Card>
</MDBox>


  );
}

EventsHeader.defaultProps = {
  children: "",
};

EventsHeader.propTypes = {
  children: PropTypes.node,
};

export default EventsHeader;
