
import { useEffect, useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";
import BasicScoreNode from "../basic-score-node";
import { supabase } from '/lib/supabaseClient';
import { useRouter } from "next/router";


export default function BasicScoreBoard() {

  const router = useRouter();
  const [branding, setBranding] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeGames, setActiveGames] = useState(null);
  const gamesData = activeGames ?? 
    [{  team_a_score: 0, 
        team_b_score: 0, 
        game_number: 1, 
        team_a_game_points: 0, 
        team_b_game_points: 0,
        server: 2,
        scoring_type: "Rally"
     }];
  const matchData = activeMatch ?? { tournament_name: "..loading", current_game: 1, match_title: "Loading...", team_a_name: "Team A", team_b_name: "Team B" };
  const currentServer =
    activeMatch && 
    gamesData && 
    gamesData.length >= activeMatch.current_game &&
    gamesData[activeMatch.current_game - 1]
      ? gamesData[activeMatch.current_game - 1].server
      : 2;


    const defaultGame = {
      team_a_score: 0,
      team_b_score: 0,
      game_number: 1,
      team_a_game_points: 0,
      team_b_game_points: 0,
      server: 2,
      scoring_type: "Rally",
      is_game_point_updatable: true,  // if you need this flag as well
      side_out_count: 0,
      is_game_point: false              // if you are tracking side-outs
    };
    
    const currentGame =
      activeMatch &&
      gamesData &&
      gamesData.length >= activeMatch.current_game
        ? gamesData[activeMatch.current_game - 1]
        : defaultGame;

    const currentGamePoints = (() => {
      if (currentGame.scoring_type === "Rally") {
        // Compare the team scores to decide which team's game points to show.
        if (currentGame.team_a_score > currentGame.team_b_score) {
          return currentGame.team_a_game_points || 0;
        } else if (currentGame.team_b_score > currentGame.team_a_score) {
          return currentGame.team_b_game_points || 0;
        } else {
          // If scores are tied, you might choose one or return a default.
          return currentGame.team_a_game_points || 0;
        }
      } else {
        // For Regular scoring, use the server to determine which team's game points to show.
        if (currentGame.server === 1 || currentGame.server === 2) {
          return currentGame.team_a_game_points || 0;
        } else if (currentGame.server === 3 || currentGame.server === 4) {
          return currentGame.team_b_game_points || 0;
        }
      }
      return 0;
    })();
      
      
    useEffect(() => {
      console.log("Router ready:", router.isReady, "Token:", router.query.token);
      if (!router.isReady) return;
      // ... rest of your fetch logic
    }, [router.isReady, router.query.token]);
    
  

  
  useEffect(() => {
    document.body.classList.add("obs-transparent");
  


    loadActiveMatchAndGame();

    return () => {
      document.body.classList.remove("obs-transparent"); // Reset when leaving
    };


  },  [router.isReady, router.query.token]);

  const loadActiveMatchAndGame = async () => {
    const match = await fetchActiveMatch();
    if (match) {
      setActiveMatch(match);
      const game = await fetchGamesForMatch(match.id);
      setActiveGames(game);
    }
  };

  useEffect(() => {
    const fetchActiveBranding = async () => {
      const { data, error } = await supabase
        .from("branding")
        .select("*")
        .eq("active_branding", true)
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
  
  const fetchActiveMatch = async () => {
    // Wait until the router is ready
    if (!router.isReady) return null;
  
    const { match_id, token } = router.query;
  
    if (match_id) {
      // If match_id exists in the URL, fetch that match regardless of active status.
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", match_id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching match by id:", error);
        return null;
      }
      return data;
    } else {
      // If no match_id, then check for a token.
      let userId;
      if (token) {
        // If a token is provided, look up the user by overlay_token.
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("overlay_token", token)
          .maybeSingle();
        if (userError || !userData) {
          console.error("Error fetching user by overlay token:", userError);
          return null;
        }
        userId = userData.id;
      } else {
        // If no token, fall back to the currently logged-in user.
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("User not authenticated and no token provided:", authError);
          return null;
        }
        userId = user.id;
      }
  
      // Now, fetch the active match for that user.
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("active_match", true)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        console.error("Error fetching active match:", error);
        return null;
      }
      return data;
    }
  };
  


  const fetchGamesForMatch = async (matchId) => {
    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("match_id", matchId)
      .order("game_number", { ascending: true }); // Order the games by game_number

      if (error) {
        console.error("Error fetching games for match:", error);
        return []; // Return an empty array on error
      }
    
      return data;
  };

    //// Realtime Updates with Supabase v2 ////
  useEffect(() => {
    // Wait until activeMatch is available
    if (!activeMatch?.id) return;

    // Function to reload all data
    const refreshData = () => {
      loadActiveMatchAndGame();
    };

    console.log("Listeners are being setup again.")

    // Listener for changes in the "matches" table for the current active match
    const matchChannel = supabase
      .channel("match_channel")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for any events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "matches",
          filter: `id=eq.${activeMatch.id}`,
        },
        (payload) => {
          console.log("Realtime match update:", payload);
          refreshData();
        }
      )
      .subscribe();

    // Listener for changes in the "game_stats" table for the current active match
    const gameChannel = supabase
      .channel("game_channel")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for any events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "game_stats",
          filter: `match_id=eq.${activeMatch.id}`,
        },
        (payload) => {
          // console.log("Realtime game update:", payload);
          refreshData();
        }
      )
      .subscribe();

    // Cleanup subscriptions when activeMatch changes or component unmounts
    return () => {
      matchChannel.unsubscribe();
      gameChannel.unsubscribe();
    };
  
  }, [activeMatch?.id]);


  if (!branding) {
    return <div></div>;
  }


    return (
            
          <MDBox sx={{
            filter: "drop-shadow(0 0 5px rgba(0,0,0,0.3))",
          }}>
            <MDBox
            sx={{
              bgcolor: "#ffffff",
              padding: "0px 12px",
              maxWidth: "fit-content",
              marginLeft: "18px",
              borderRadius: " 6px 6px 0 0",
            }}
            > 
              <MDTypography 
                        
                        sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: "bold", 
                         
                          fontSize: "18px",
                          color: "#000000" }}>
                         {matchData.tournament_name.toString().toUpperCase() || ""}
                </MDTypography>
            </MDBox>
            
            <Grid container  sx={{
                display: "inline-flex", // Shrinks to fit the content
                width: "max-content", // Ensures it only takes the space needed
                margin: "0 auto", // Centers the container if needed
                bgcolor: "transparent",
                borderRadius: "6px",
    
              }} >

              {/* -----------------  LOGO  ---------------- */}
              <Grid item  
                  sx={{bgcolor: branding.primary_color,
                  display: "flex", 
                  alignItems: "center",
                  borderRadius: "6px 0 0 6px",
                  padding: "0 18px"
              }}>
                <MDBox
                  component="img"
                  src={branding.logo_url}
                  sx={{ width: "100%", height: "50px"}}
                >
                </MDBox>
              </Grid>

              {/* ----------------  TEAM NAMES  ---------------- */}
              <Grid item sx={{
                background:`linear-gradient(90deg, ${branding.primary_color || "rgba(0,51,160,1)"} 0%, ${branding.secondary_color || "rgba(0,65,204,1)"} 100%)`,
                alignContent: "center",
                 minWidth: "375px"
              }} >
                <MDBox>
                  <Grid display="flex">
                    <Grid>
                      <MDTypography 
                        variant="h3" 
                        sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: "bold", 
                          lineHeight: "34px",
                          color: "#ffffff" }}>
                        {matchData.team_a_name}
                      </MDTypography>
                    </Grid>


            

                    {currentGame.scoring_type === "Rally" ? (  

                    <Grid display="flex" alignItems="center" sx={{ width: "50px", marginLeft: "auto", gap: "6px", padding: "0 9px 0 30px"}}>   
                      <MDBox sx={{width: "12px"}}>
                        <MDBox id="server2"
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: branding.primary_color,
                              display: currentServer === 1 ? "default" : "none",
                            }}
                          />
                      </MDBox>
                    </Grid>

                    ) : (
                    

                    <Grid display="flex" alignItems="center" sx={{ width: "69px", marginLeft: "auto", gap: "6px", padding: "0 9px 0 30px"}}>
                    <MDBox id="serverbox" sx={{width: "12px", bgcolor: "black"}}>
                      <MDBox id="server1"
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "#03b403",
                            display: (currentServer === 1 || currentServer === 2) ? "default" : "none",    
                          }}
                        />
                    </MDBox>
                    <MDBox sx={{width: "12px"}}>
                      <MDBox id="server2"
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "#03b403",
                            display: currentServer === 2 ? "default" : "none",
                          }}
                        />
                    </MDBox>
                  </Grid>
                  )}
                  </Grid>
                  <Grid display="flex">
                    <Grid>
                      <MDTypography variant="h3" 
                      sx={{ 
                        fontFamily: "'Montserrat', sans-serif", 
                        fontWeight: "bold", 
                        color: "#ffffff",
                        lineHeight: "34px", 
                        
                        }}>
                        {matchData.team_b_name}
                      </MDTypography>
                    </Grid>

                    {currentGame.scoring_type === "Rally" ? (  

                    <Grid display="flex" alignItems="center" sx={{ width: "50px", marginLeft: "auto", gap: "6px", padding: "0 9px 0 30px"}}>   
                      <MDBox sx={{width: "12px"}}>
                        <MDBox id="server2"
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: "#03b403",
                              display: currentServer === 2 ? "default" : "none",
                            }}
                          />
                      </MDBox>
                    </Grid>

                    ) : (


                    <Grid display="flex" alignItems="center" sx={{ width: "69px", marginLeft: "auto", gap: "6px", padding: "0 9px 0 30px"}}>
                    <MDBox id="serverbox" sx={{width: "12px", bgcolor: "black"}}>
                      <MDBox id="server1"
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "#03b403",
                            display: (currentServer === 3 || currentServer === 4) ? "default" : "none",    
                          }}
                        />
                    </MDBox>
                    <MDBox sx={{width: "12px"}}>
                      <MDBox id="server2"
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "#03b403",
                            display: currentServer === 4 ? "default" : "none",
                          }}
                        />
                    </MDBox>
                    </Grid>
                    )}
                  </Grid>
                </MDBox>
              </Grid>
              {/* ----------------  SCORE NODES  ---------------- */}              
              {/* {gamesData.map((game, index) => (
              <BasicScoreNode
                key={game.game_number}
                teamAScore={game.team_a_score}
                teamBScore={game.team_b_score}
                isCurrentGame={index === gamesData.length - 1}
              />
            ))} */}
            {gamesData.slice(0, matchData.current_game).map((game, index) => (
            <BasicScoreNode
              key={game.game_number}
              teamAScore={game.team_a_score}
              teamBScore={game.team_b_score}
              isCurrentGame={index === matchData.current_game - 1}
            />
            ))}


            </Grid>
            <MDBox
            sx={{
              bgcolor: "#ffffff",
              padding: "0px 8px",
              borderRadius: " 0 0 6px 6px",
              maxWidth: "fit-content",
              marginLeft: "18px",
              position: "relative", // Required for z-index to work
              zIndex: 2, // Lower stacking order so it appears underneath

            }}
            > 
              <MDTypography 
                        
                        sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: "bold", 
                          fontSize: "16px",
                          color: "#000000" }}>
                         {activeMatch?.match_title.toString().toUpperCase() || ''}
                </MDTypography>
            </MDBox>
            {currentGame.is_game_point && (
            <MDBox
            sx={{
              bgcolor: "#ffffff",
              padding: "8px 8px 0 8px",
              borderRadius: " 0 0 6px 6px",
              maxWidth: "fit-content",
              marginLeft: "18px",
              marginTop: "-8px",
              background: "linear-gradient(90deg, rgba(0,51,160,1) 0%, rgba(0,65,204,1) 100%)",
              position: "relative", // Required for z-index to work
              zIndex: 1, // Lower stacking order so it appears underneath
            }}
            > 
              <MDTypography 
                        
                        sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: "bold", 
                          fontSize: "16px",
                          color: "#ffffff" }}>
                         {
                          `GAME POINT: ${currentGamePoints}`
                         }
                </MDTypography>
            </MDBox>
            )}
          </MDBox>
    );
  }
  BasicScoreBoard.noSidenav = true;