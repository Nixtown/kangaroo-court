
import BasicScoreBoard from "/pagesComponents/scoreboard/basic-scoreboard";
import MDBox from "/components/MDBox";

export default function BasicScoreboardOutput() {



 
    return (
        <MDBox id="ScoreBody" sx={{margin: "70px 0 0 120px"}}
        //  sx={{bgcolor:"#1b1b1b", padding: "300px"}}
         >
            <BasicScoreBoard/>
        </MDBox>
    );
  }
  BasicScoreboardOutput.noSidenav = true;