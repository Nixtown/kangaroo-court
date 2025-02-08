
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";


function BasicScoreNode({ teamAScore, teamBScore, isCurrentGame = false }) {

    const activeScoreColor = isCurrentGame ? "#ffffff" : "#e8e8e8";
    return (
        <Grid 
        sx={{ 
            bgcolor: activeScoreColor ,
            borderRadius: isCurrentGame ? " 0px 6px 6px 0px" : "0 0 0 0",
        }}
            > 
                <Grid container direction="column" sx={{
                justifyContent: "center",
                alignItems: "center",
                padding: "6px 3px",
                minWidth: "40px",
                }}>
                    <Grid item lg={12}>
                    <MDTypography variant="h3" 
                    sx={{ 
                        fontFamily: "'Montserrat', sans-serif", 
                        fontWeight: "bold", 
                        color: "#181818", 
                        lineHeight: "34px", 
                        }}>
                        {teamAScore}
                    </MDTypography>
                    </Grid>
                    <Grid item lg={12}>
                    <MDTypography variant="h3" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: "bold", color: "#181818", lineHeight: "34px", }}>
                        {teamBScore}
                    </MDTypography>
                    </Grid>
                </Grid>  
            </Grid>
        
    );
}

export default BasicScoreNode;