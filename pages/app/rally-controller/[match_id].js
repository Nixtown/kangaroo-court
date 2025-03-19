/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================
* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
Coded by www.creative-tim.com
==========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useRef  } from "react";
import { supabase } from '/lib/supabaseClient';

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import Grid from "@mui/material/Grid";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import MatchTimer from "/pagesComponents/rally-controller-widgets/match-timer";
import { useRouter } from "next/router";
import Icon from "@mui/material/Icon";
import { useMediaQuery } from '@mui/material';
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import MDButton from "/components/MDButton";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import Link from "next/link";






// Layout components
import RallyControllerWConfig from "/pagesComponents/pages/score-logging/rally-controller-w-config";
import RallyControllerHeader from "../../../pagesComponents/rally-controller-header";
import OverlayActive from "../../../pagesComponents/rally-controller-widgets/overlay-active";
import BasicScoreBoard from "/pagesComponents/scoreboard/basic-scoreboard";
import EditMatch from "../../../pagesComponents/rally-controller-widgets/edit-match";
import GamesTable from "../../../examples/Tables/GamesTable";
import CycleServers from "../../../pagesComponents/rally-controller-widgets/cycle-servers";


const RallyControllerDash = () => {

  const [matchData, setMatchData] = useState({
    current_game: 1,
    team_a_name: "Team A",
    team_b_name: "Team B",
    best_of: 3,
    tournament_name: "Elare Pickleball",
    match_title: "Open Play"
  });

  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [gameData, setGameData] = useState();
  const [branding, setBranding] = useState(null);
  const router = useRouter();
  const { match_id } = router.query;
  const isSmallScreen = useMediaQuery('(max-width:850px)');
  const routeChangeHandlerRef = useRef();

  const currentGame = gameData?.[matchData?.current_game - 1] || {}; // Ensures currentGame is always an object


  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      console.log("Route change attempted to:", url, "shallow:", shallow);
      if (matchData?.status === "In Progress" && !shallow) {
        console.log("Navigation blocked: match is in progress.");
        setPendingNavigation(url);
        setShowLeavePopup(true);
        // Block navigation by emitting an error and throwing a custom message.
        router.events.emit("routeChangeError");
        throw "Prevent route change";
      } else {
        console.log("Navigation allowed.");
      }
    };

    // Store handler in the ref so we can reference it later.
    routeChangeHandlerRef.current = handleRouteChange;
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", routeChangeHandlerRef.current);
    };
  }, [matchData, router]);

  // Confirm leave: remove the handler and navigate
  const confirmLeave = () => {
    if (pendingNavigation) {
      console.log("Confirming leave. Pending navigation to:", pendingNavigation);
      setShowLeavePopup(false);
      const target = pendingNavigation;
      setPendingNavigation(null);
      // Remove the route-change handler so that our navigation is not blocked.
      router.events.off("routeChangeStart", routeChangeHandlerRef.current);
      router.push(target)
        .then(() => {
          console.log("Navigation to", target, "was successful.");
        })
        .catch((err) => {
          if (err !== "Prevent route change") {
            console.error("Error during navigation:", err);
          } else {
            console.log("Navigation prevented (expected error).");
          }
        });
    } else {
      console.log("No pending navigation URL found.");
    }
  };
  
  const cancelLeave = () => {
    setShowLeavePopup(false);
    setPendingNavigation(null);
  };



 
  useEffect(() => {
    console.log("MatchData updated:", matchData);
  }, [matchData]); // Re-run effect when matchData changes

    useEffect(() => {
      const fetchActiveBranding = async () => {
        // Get the current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("User is not authenticated:", authError);
          return;
        }
    
        // Query the branding table for the active branding record for this user
        const { data, error } = await supabase
          .from("branding")
          .select("*")
          .eq("active_branding", true)
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
    
        if (error) {
          console.error("Error fetching active branding:", error);
        } else {
          setBranding(data);
        }
      };
    
      fetchActiveBranding();
    }, []);

    // Fetch active match data, but only for the current logged-in user.
useEffect(() => {
  const fetchActiveMatch = async () => {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User is not authenticated:", authError);
      return;
    }
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .eq('user_id', user.id) // Only load match for the current user
      .single(); // Assuming there's only one active match per user

    if (error || !data) {
      console.error("No active match found or error fetching match:", error);
      router.push("/app/create-match"); // Redirect if no active match is found
      toast.error(
        "Create a match before using rally controller.",
        {
          position: "top-center", // Positions the toast at the top center
          autoClose: 3000,        // Auto-closes after 3 seconds
          hideProgressBar: false, // Displays the progress bar
          closeOnClick: true,     // Allows dismissal on click
          pauseOnHover: true,     // Pauses autoClose timer when hovered
          draggable: true,        // Enables dragging to dismiss
          theme: "dark",       // Uses the "colored" theme for a vibrant look
          style: { width: "100%", maxWidth: "500px" },
        }
      );
    } else {
      setMatchData(data);
    }
  };

  if (router.isReady) {
    fetchActiveMatch();
  }
}, [router]);

  /// Get all the games using the active match id
  useEffect(() => {
    const fetchGameStats = async () => {
      if (matchData && matchData.id) {
        const { data, error } = await supabase
          .from('game_stats')
          .select('*')
          .eq('match_id', matchData.id);
          
        if (error) {
          console.error("Error fetching game stats:", error);
        } else {
          setGameData(data);
        }
      }
    };
  
    fetchGameStats();
  }, [matchData]);


  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Grid container rowSpacing={3} columnSpacing={3}>
          <Grid item xs={12} lg={8} >
            <Card id="incriment-games"sx={{ width: "100%", marginBottom: "24px" } }>
            <Grid sx={{marginTop: "24px", marginBottom: "24px"}}item display="flex" flexDirection="column" justifyContent="center" alignItems="center" >
              {!isSmallScreen && <BasicScoreBoard branding={branding} activeMatch={matchData} activeGames={gameData} />}
              {isSmallScreen &&
              <MDBox>
              <MDTypography textAlign="center" variant="subtitle2">
                {`${matchData.team_a_name} vs ${matchData.team_b_name}`}
              </MDTypography>
              <MDTypography textAlign="center" variant="h1">
              {currentGame.team_a_score !== undefined && currentGame.team_b_score !== undefined
                ? `${currentGame.team_a_score} - ${currentGame.team_b_score}`
                : "Loading..."}
            </MDTypography>
            <MDTypography textAlign="center" variant="subtitle1">
              {currentGame.server !== undefined ? `Server: ${currentGame.server}` : ""}
            </MDTypography>
              </MDBox>
              }

            </Grid>
          </Card>
            
            
            {/* <RallyControllerHeader matchData={matchData} setMatchData={setMatchData} branding={branding}/> */}
            <RallyControllerWConfig matchData={matchData} setMatchData={setMatchData} setGameData={setGameData} gameData={gameData} branding={branding} />
         </Grid>
          <Grid item xs={12} lg={4}>
            <MatchTimer
              title={{ text: "Match Timer" }}
              icon={{ color: "dark", component: "timer" }}
              direction="right"
              matchData={matchData}
              setMatchData={setMatchData}
            />
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <OverlayActive
                setMatchData={setMatchData}
                matchData={matchData}
              />
              </Grid>
              <Grid item xs={12} lg={6}>
              <CycleServers
                setMatchData={setMatchData}
                matchData={matchData}
                setGameData={setGameData} 
                gameData={gameData}
              />
              </Grid>

            </Grid>
            <MDBox sx={{marginTop: "24px"}}>
            <EditMatch 
              setMatchData={setMatchData}
              matchData={matchData}
            />
            </MDBox>         
          </Grid> 
        </Grid>
        <Card sx={{marginTop: "24px"}}> 
        <GamesTable entriesPerPage={false} setMatchData={setMatchData} matchData={matchData} gameData={gameData}/>
      </Card>

   {/* MUI Popup for Internal Navigation Confirmation */}
   <Dialog open={showLeavePopup} onClose={cancelLeave}>
          <DialogTitle>Leave Ongoing Match?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This match is in progress. The match timer will continue to run until you mark this match as complete.
              Are you sure you want to leave?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={cancelLeave} color="dark" variant="outlined">
              Stay
            </MDButton>
            <MDButton onClick={confirmLeave} color="error" variant="contained">
              Leave
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    </DashboardLayout>

  );
}



export default RallyControllerDash;
