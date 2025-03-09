
import { useEffect, useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";
import { supabase } from '/lib/supabaseClient';
import { useRouter } from "next/router";


export default function IntermissionScoreboard() {
  
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
        scoring_type: "Rally",
        game_title: "MEN'S DOUBLES"
     }];
  const matchData = activeMatch ?? { best_of: 3, tournament_name: "..loading", current_game: 1, match_title: "Loading...", team_a_name: "Team A", team_b_name: "Team B" };
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
      is_game_point: false,
      game_title: "Open Doubles"           // if you are tracking side-outs
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
      
      
    // Team B: 1, 2
    // Team A: 
  


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


  }, [router.isReady, router.query.token]);


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

  const loadActiveMatchAndGame = async () => {
    const match = await fetchActiveMatch();
    if (match) {
      setActiveMatch(match);
      const game = await fetchGamesForMatch(match.id);
      setActiveGames(game);
    }
  };
  
  const fetchActiveMatch = async () => {
    // Wait until the router is ready
    if (!router.isReady) return null;
  
    let userId;
    const { token } = router.query;
    
    if (token) {
      // If a token is provided, look up the user by overlay_token
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
      // If no token, fall back to the currently logged-in user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated and no token provided:", authError);
        return null;
      }
      userId = user.id;
    }
  
    // Now, fetch the active match for that user
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
            
      <MDBox id="main" sx={{ paddingTop: "740px", paddingBottom: "200px"}}>
        <Grid container id="main-container" justifyContent="center" alignItems="center" margin="auto" direction="column"
          sx={{
            minWidth: "800px"
          }}
        >
            <Grid item id="best-of-node" 
             sx={{
                bgcolor: "#ffffff", 
                padding: "0px 12px", 
                borderRadius: " 12px 12px 0 0"
                }}>
              <MDBox>
                <MDTypography
                  sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: "bold", 
                   
                    fontSize: "28px",
                    color: "#000000" }}
                >
                 
                  {currentGame.game_title.toString().toUpperCase()}
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid  item id="tournament-info-node"
              sx={{
                background:`linear-gradient(90deg, ${branding.primary_color || "rgba(0,51,160,1)"} 0%, ${branding.secondary_color || "rgba(0,65,204,1)"} 100%)`,
                borderRadius: "18px",
              }}
            >
              <Grid container
                sx={{
                  padding: "0px 24px", 
                }}
                >
                <Grid item
                  sx={{
                    display: "flex", 
                    alignItems: "center",
                  }}  
                >
                  <MDBox
                    component="img"
                    src={branding.logo_url}
                    sx={{ width: "80px", height: "auto"}}
                  >
                  </MDBox>
                </Grid>
                <Grid item
                  sx={{
                    paddingLeft: "48px"
                  }}
                >
                  <MDBox>
                    <MDTypography pb={0}
                      sx={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: "bold", 
                        fontSize: "52px",
                        color: "#ffffff",
                        letterSpacing: "-0.8px",
                        lineHeight: "65px"
                      }}
                    >
                      {matchData.tournament_name.toString().toUpperCase()}
                    </MDTypography>
                  </MDBox>
                  <MDBox>
                    <MDTypography
                      sx={{
                        whiteSpace: "nowrap",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: "500", 
                        fontSize: "28px",
                        color: "#ffffff",
                        marginTop: "-14px",
                        letterSpacing: "-0.8px",
                      }}
                    >
                      {matchData.match_title.toString().toUpperCase()}
                    </MDTypography>
                  </MDBox>
                </Grid>            
              </Grid>
            <Grid item 
              sx={{
                bgcolor: "#ffffff",
                height: "2px",
                width: "100%"

              }}
            >
            </Grid>
          <  Grid item sx={{
                bgcolor: "#1a1818",
                padding: "12px 18px",
                borderRadius: "0 0 18px 18px"
              }}>
             <Grid container
              sx={{
                border: "2px solid #484945",
                borderRadius: "12px",
                 marginBottom: "8px"
              }}
              > 
              <Grid item xs={12} >
                  <Grid container justifyContent="space-between" >
                      <Grid item
                        sx={{
                          paddingLeft: "24px"
                        }}
                      >
                        <MDTypography
                          sx={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: "bold", 
                            fontSize: "42px",
                            color: "#ffffff",
                            lineHeight: "50px"
                          }}
                       >
                        {matchData.team_a_name.toString().toUpperCase()}
                      </MDTypography>
                      </Grid>
                      <Grid item
                        sx={{
                          paddingRight: "24px"
                        }}
                      >
                        <Grid container>


                          {/*--------------------------- */}
                          {/* Put the map feature here!! */}
                          {/*--------------------------- */}
                          {gamesData.slice(0, matchData.current_game).map((game, index) => (
                          <Grid item key={game.game_number}>
                            <MDTypography
                              sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: "bold", 
                                fontSize: "42px",
                                color: "#ffffff",
                                letterSpacing: "4px",
                                lineHeight: "50px",
                                width: "78px",
                                textAlign: "center"

                              }}
                            >
                              {game.team_a_score}
                            </MDTypography>
                          </Grid>
                          ))}
                        </Grid>
                      </Grid>
                  </Grid>
              </Grid>
            </Grid>
            <Grid container
              sx={{
                border: "2px solid #484945",
                borderRadius: "12px",
              }}
              > 
              <Grid item xs={12}>
                  <Grid container justifyContent="space-between" >
                      <Grid item
                        sx={{
                          paddingLeft: "24px"
                        }}
                      >
                        <MDTypography
                          sx={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: "bold", 
                            fontSize: "42px",
                            color: "#ffffff",
                            lineHeight: "50px"
                          }}
                       >
                        {matchData.team_b_name.toString().toUpperCase()}
                      </MDTypography>
                      </Grid>
                      <Grid item
                        sx={{
                          paddingRight: "24px"
                        }}
                      >
                        <Grid container>


                          {/*--------------------------- */}
                          {/* Put the map feature here!! */}
                          {/*--------------------------- */}
                          {gamesData.slice(0, matchData.current_game).map((game, index) => (
                          <Grid item key={game.game_number}>
                            <MDTypography
                              sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: "bold", 
                                fontSize: "42px",
                                color: "#ffffff",
                                letterSpacing: "4px",
                                lineHeight: "50px",
                                width: "78px",
                                textAlign: "center"

                              }}
                            >
                              {game.team_b_score}
                            </MDTypography>
                          </Grid>
                          ))}
                        </Grid>
                      </Grid>
                  </Grid>
              </Grid>
            </Grid>

          </Grid>  
          </Grid>
             
        </Grid>
      </MDBox>
    );
  }
  IntermissionScoreboard.noSidenav = true;