
import BasicScoreBoard from "/pagesComponents/scoreboard/basic-scoreboard";
import MDBox from "/components/MDBox";

export default function BasicScoreboardOutput() {



 
    return (
        <MDBox id="ScoreBody" >  
            <BasicScoreBoard/>
        </MDBox>
    );
  }
  BasicScoreboardOutput.noSidenav = true;