
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import BookingCard from "/examples/Cards/BookingCard";
import Tooltip from "@mui/material/Tooltip";
import MDTypography from "/components/MDTypography";
import Icon from "@mui/material/Icon";
// Images
import booking1 from "/assets/images/basic-scoreboard-graphic.png";
import booking2 from "/assets/images/intermission-scoreboard-graphic.png";
import { supabase } from "/lib/supabaseClient";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";


const Scoreboards = () => {

    const [overlayToken, setOverlayToken] = useState("");


      // Fetch the overlay token from the users table
  useEffect(() => {
    const fetchOverlayToken = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("overlay_token")
        .eq("id", user.id)
        .maybeSingle();
      if (userError) {
        console.error("Error fetching overlay token:", userError);
      } else if (userData && userData.overlay_token) {
        setOverlayToken(userData.overlay_token);
      }
    };

    fetchOverlayToken();
  }, []);

    const getOverlayUrl = (overlayType) => {
        const baseUrl = window.location.origin;
        if (overlayType === "basic") {
          return `${baseUrl}/scoreboards/basic/${overlayToken}`;
        } else if (overlayType === "intermission") {
          return `${baseUrl}/scoreboards/intermission/${overlayToken}`;
        }
        return "";
      };

      const handleCopyUrl = (overlayType) => {
        const url = getOverlayUrl(overlayType);
        navigator.clipboard.writeText(url)
          .then(() => {
            toast.success("Overlay URL copied to clipboard!");
          })
          .catch((err) => {
            console.error("Error copying URL: ", err);
            toast.error("Failed to copy URL.");
          });
      };


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={8}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={4}>
                    <MDBox mt={3}>
                        <BookingCard
                        image={booking1}
                        title="Basic Scoreboard"
                        description='The Basic Scoreboard appears in the upper right-hand corner during gameplay, modeled after the PPA. It clearly displays the score, server, and game status, keeping viewers informed with a clean and professional design.'
                        price="OBS Overlay"
                        location="Upper Right"
                        action={
                            <>
                             <MDTypography
                                variant="body1"
                                color="primary"
                                lineHeight={1}
                                onClick={() => window.open(getOverlayUrl("basic"), "_blank")}
                                sx={{ cursor: "pointer", mx: 3 }}
                            >
                                <Icon color="inherit">link</Icon>
                            </MDTypography>
                              <MDTypography 
                                variant="body1" 
                                color="dark" 
                                lineHeight={1} 
                                onClick={() => handleCopyUrl("basic")}
                                sx={{ cursor: "pointer", mx: 3 }} 
                                >
                                <Icon color="inherit">copy</Icon>
                              </MDTypography>
                            </>
                          }
                        />
                    </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                    <MDBox mt={3}>
                        <BookingCard
                        image={booking2}
                        title="Intermission Scoreboard"
                        description='The Intermission Scoreboard is a centered graphic displayed between games, modeled after PPA broadcasts. It highlights the current score, game progress, and key match details, keeping viewers engaged during breaks.'
                        price="OBS Overlay"
                        location="Centered"
                        action={
                            <>
                            <MDTypography
                                variant="body1"
                                color="primary"
                                lineHeight={1}
                                onClick={() => window.open(getOverlayUrl("intermission"), "_blank")}
                                sx={{ cursor: "pointer", mx: 3 }}
                            >
                                <Icon color="inherit">link</Icon>
                            </MDTypography>
                              <MDTypography 
                              onClick={() => handleCopyUrl("intermission")}
                              variant="body1" color="dark" lineHeight={1} sx={{ cursor: "pointer", mx: 3 }}>
                                <Icon color="inherit">copy</Icon>
                              </MDTypography>
                            </>
                          }
                        />
                    </MDBox>
                    </Grid>
                </Grid>
            </MDBox>
        </DashboardLayout>

    );
};

export default Scoreboards;