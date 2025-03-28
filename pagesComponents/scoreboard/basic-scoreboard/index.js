
import { useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";
import BasicScoreNode from "../basic-score-node";



export default function BasicScoreBoard({branding, activeMatch, activeGames}) {


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
    activeMatch && gamesData && gamesData.length >= activeMatch.current_game
        ? gamesData[activeMatch.current_game - 1]
        : defaultGame;

        const getCurrentGamePoints = (currentGame) => {
          let result = "";
      
          if (currentGame.scoring_type === "Rally") {
              if (currentGame.win_on_serve) {
                  // ✅ In rally scoring, server 1 = Team A, server 2 = Team B
                  const servingTeam = currentGame.server === 1 ? "Team A" : "Team B";
      
                  result = servingTeam === "Team A"
                      ? `${currentGame.team_a_game_points || 0}`
                      : `${currentGame.team_b_game_points || 0}`;
              } else {
                  // ✅ Handle Double Game Point (Both teams at 24 in win-by-2)
                  if (currentGame.team_a_score === currentGame.team_b_score && 
                      currentGame.team_a_score >= currentGame.first_to_points - 1) {
                      result = `${currentGame.team_a_game_points || 0} & ${currentGame.team_b_game_points || 0}`;
                  } else if (currentGame.team_a_score > currentGame.team_b_score) {
                      result = `${currentGame.team_a_game_points || 0}`;
                  } else {
                      result = `${currentGame.team_b_game_points || 0}`;
                  }
              }
          } else {
              // ✅ Regular Scoring: Determine team serving normally
              const servingTeam = currentGame.server === 1 || currentGame.server === 2 ? "Team A" : "Team B";
      
              result = servingTeam === "Team A"
                  ? `${currentGame.team_a_game_points || 0}`
                  : `${currentGame.team_b_game_points || 0}`;
          }
      
          return result;
      };
      

      


  
  
  useEffect(() => {
    document.body.classList.add("obs-transparent");

    return () => {
      document.body.classList.remove("obs-transparent"); // Reset when leaving
    };


  }, []);



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
                display: "flex", // Shrinks to fit the content
                minWidth: "fit-content", // Ensures it only takes the space needed
                margin: "0 auto", // Centers the container if needed
                bgcolor: "transparent",
                overflow: "hidden",
                flexWrap: "nowrap",
                borderRadius: "6px",
    
              }} >

              {/* -----------------  LOGO  ---------------- */}
              <Grid item  
                   sx={{
                    bgcolor: branding.primary_color,
                    display: "flex", 
                    alignItems: "center",
                    borderRadius: "6px 0 0 6px",
                    padding: "0 18px",
                    justifyContent: "center" // ✅ Ensures logo stays centered
                  }}
                  
                  >
                <MDBox
                  component="img"
                  src={branding.logo_url}
                  sx={{ maxwidth: "100%", height: "50px", objectFit: "contain",}}
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
                              backgroundColor: "#03b403",
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
                          `GAME POINT: ${getCurrentGamePoints(currentGame)}`
                         }
                </MDTypography>
            </MDBox>
            )}
          </MDBox>
    );
  }
  BasicScoreBoard.noSidenav = true;