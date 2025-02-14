
import IntermissionScoreboard from "/pagesComponents/scoreboard/intermission-scoreboard";
import MDBox from "/components/MDBox";

export default function IntermissionScoreOutput() {



 
    return (
        <MDBox id="ScoreBody">
            <IntermissionScoreboard/>
        </MDBox>
    );
  }
  IntermissionScoreOutput.noSidenav = true;