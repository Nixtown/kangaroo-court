
import { useEffect, useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";
import BasicScoreNode from "../basic-score-node";
import { supabase } from '/lib/supabaseClient';
import Card from "@mui/material/Card";


export default function BasicScoreBoard2() {

  const [activeMatch, setActiveMatch] = useState(null);
  const [activeGames, setActiveGames] = useState(null);
  const gamesData = activeGames ?? [{ team_a_score: 0, team_b_score: 0, game_number: 1 }];
  const matchData = activeMatch ?? { tournament_name: "..loading", current_game: 1, match_title: "Loading...", team_a_name: "Team A", team_b_name: "Team B" };
  const currentServer = matchData.server ?? 2;
  const currentGamePoints =
  (currentServer === 1 || currentServer === 2)
    ? activeGames[matchData.current_game - 1].team_a_game_points
    : activeGames[matchData.current_game - 1].team_b_game_points;

  
  useEffect(() => {
    document.body.classList.add("obs-transparent");
  


    loadActiveMatchAndGame();

    return () => {
      document.body.classList.remove("obs-transparent"); // Reset when leaving
    };


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
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .is("active_match", true)
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
          console.log("Realtime game update:", payload);
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



  /////// Has timeout but it was working. ////////

    // //// Realtime Updates with Supabase v2 ////
    // useEffect(() => {
    //   // Wait until activeMatch is available
    //   if (!activeMatch?.id) return;

    //   // Function to reload all data
    //   const refreshData = () => {
    //     loadActiveMatchAndGame();
    //   };

    //   // Listener for changes in the "matches" table for the current active match
    //   const matchChannel = supabase
    //     .channel("match_channel")
    //     .on(
    //       "postgres_changes",
    //       {
    //         event: "*", // Listen for any events
    //         schema: "public",
    //         table: "matches",
    //         filter: `id=eq.${activeMatch.id}`,
    //       },
    //       (payload) => {
    //         console.log("Realtime match update:", payload);
    //         // Use a small delay to let changes settle, then refresh data
    //         setTimeout(refreshData, 200);
    //       }
    //     )
    //     .subscribe();

    //   // Listener for changes in the "game_stats" table for the current active match
    //   const gameChannel = supabase
    //     .channel("game_channel")
    //     .on(
    //       "postgres_changes",
    //       {
    //         event: "*", // Listen for any events
    //         schema: "public",
    //         table: "game_stats",
    //         filter: `match_id=eq.${activeMatch.id}`,
    //       },
    //       (payload) => {
    //         console.log("Realtime game update:", payload);
    //         setTimeout(refreshData, 200);
    //       }
    //     )
    //     .subscribe();

    //   // Cleanup subscriptions when activeMatch changes or component unmounts
    //   return () => {
    //     matchChannel.unsubscribe();
    //     gameChannel.unsubscribe();
    //   };
    // }, [activeMatch]);

  
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
                  sx={{bgcolor: "#0033a0",
                  display: "flex", 
                  alignItems: "center",
                  borderRadius: "6px 0 0 6px",
                  padding: "0 18px"
              }}>
                <MDBox
                  component="img"
                  src="/images/logos/elare-logo-avatar-light.png"
                  sx={{ width: "46px", height: "auto"}}
                >
                </MDBox>
              </Grid>

              {/* ----------------  TEAM NAMES  ---------------- */}
              <Grid item sx={{
                background: "linear-gradient(90deg, rgba(0,51,160,1) 0%, rgba(0,65,204,1) 100%)",
                alignContent: "center",
                 minWidth: "300px"
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
                    <Grid display="flex" alignItems="center" sx={{ marginLeft: "auto", gap: "6px", padding: "0 9px 0 30px"}}>
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
                  </Grid>
                </MDBox>
              </Grid>
              {/* ----------------  SCORE NODES  ---------------- */}              
              {gamesData.map((game, index) => (
              <BasicScoreNode
                key={game.game_number}
                teamAScore={game.team_a_score}
                teamBScore={game.team_b_score}
                isCurrentGame={index === gamesData.length - 1}
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
            {matchData.is_game_point && (
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
  BasicScoreBoard2.noSidenav = true;