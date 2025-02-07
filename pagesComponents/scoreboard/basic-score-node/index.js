
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Grid } from "@mui/material";


function BasicScoreNode({ teamAScore, teamBScore, isCurrentGame = false }) {

    const activeScoreColor = isCurrentGame ? "#ffffff" : "#e8e8e8";
    return (
        <Grid sx={{ bgcolor: activeScoreColor }}
            > 
                <Grid container direction="column" sx={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 3px",
                minWidth: "40px"
                }}>
                    <Grid item lg={12}>
                    <MDTypography variant="h3" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: "bold", color: "#181818" }}>
                        {teamAScore}
                    </MDTypography>
                    </Grid>
                    <Grid item lg={12}>
                    <MDTypography variant="h3" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: "bold", color: "#181818" }}>
                        {teamBScore}
                    </MDTypography>
                    </Grid>
                </Grid>  
            </Grid>
        
    );
}

export default BasicScoreNode;