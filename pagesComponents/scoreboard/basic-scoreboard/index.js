
import { useEffect, useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";
import BasicScoreNode from "../../../pagesComponents/scoreboard/basic-score-node";
import { supabase } from '/lib/supabaseClient';
import Card from "@mui/material/Card";


export default function BasicScoreBoard() {
  const [scoreData, setScoreData] = useState(null);
  const totalGames = scoreData?.current_game;
  const currentServer = scoreData?.server;
  const teamAName = scoreData?.team_a != null ? scoreData.team_a.toString().toUpperCase() : '';
  const teamBName = scoreData?.team_b != null ? scoreData.team_b.toString().toUpperCase() : '';



  useEffect(() => {
    document.body.classList.add("obs-transparent");

    // Fetch initial data
    async function fetchInitialData() {
      const { data, error } = await supabase
        .from("scoreboard")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) {
        console.error("Error fetching initial data:", error);
      } else {
        setScoreData(data);
      }
    }
    fetchInitialData();

    // Create a channel and subscribe to realtime changes
    const subscription = supabase
    .channel('scoreboard-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'scoreboard',
        filter: 'id=eq.1',
      },
      (payload) => {
        console.log("Realtime update received on Output Page:", payload);
        setScoreData(payload.new);
      }
    )
    .subscribe();

    return () => {
      document.body.classList.remove("obs-transparent"); // Reset when leaving
      supabase.removeChannel(subscription);
    };
  }, []);


    
    return (
            
          <MDBox>
            <MDBox
            sx={{
              bgcolor: "#ffffff",
              padding: "0px 12px",
              maxWidth: "fit-content",
              marginLeft: "18px"

            }}
            > 
              <MDTypography 
                        
                        sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: "bold", 
                          fontSize: "18px",
                          color: "#000000" }}>
                         {scoreData?.tournament_name.toString().toUpperCase() || ""}
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
                        {teamAName}
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
                        {teamBName}
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
              {Array.from({ length: totalGames }).map((_, index) => {
                const gameNumber = index + 1; // Game numbers start at 1
                return (
                  <BasicScoreNode
                    key={gameNumber}
                    teamAScore={scoreData[`team_a_score_game${gameNumber}`]}
                    teamBScore={scoreData[`team_b_score_game${gameNumber}`]}
                    isCurrentGame={gameNumber === scoreData.current_game}
                  />
                );
              })}
            </Grid>
            <MDBox
            sx={{
              bgcolor: "#ffffff",
              padding: "0px 8px",
              borderRadius: " 0 0 6px 6px",
              maxWidth: "fit-content",
              marginLeft: "18px"

            }}
            > 
              <MDTypography 
                        
                        sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: "bold", 
                          fontSize: "16px",
                          color: "#000000" }}>
                         {scoreData?.match_title.toString().toUpperCase() || ''}
                </MDTypography>
            </MDBox>
          </MDBox>
    );
  }
  BasicScoreBoard.noSidenav = true;