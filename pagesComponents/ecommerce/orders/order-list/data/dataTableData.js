import { useEffect, useState } from "react";
import { supabase } from "/lib/supabaseClient";

// Components
import IdCell from "/pagesComponents/ecommerce/orders/order-list/components/IdCell";
import DefaultCell from "/pagesComponents/ecommerce/orders/order-list/components/DefaultCell";
import StatusCell from "/pagesComponents/ecommerce/orders/order-list/components/StatusCell";

const MatchesTable = () => {
  const [matches, setMatches] = useState([]); // ✅ Ensure matches is always an array
  const [loading, setLoading] = useState(true); // ✅ Loading state

  // Fetch matches from Supabase
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true); // Start loading
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        console.log("Fetched matches:", data); // ✅ Debugging log
        setMatches(data || []); // ✅ Ensure matches is always an array
      }
      setLoading(false); // Stop loading
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <p>Loading matches...</p>; // ✅ Show loading text while fetching data
  }

  // ✅ Ensure matches is always an array before calling map()
  const dataTableData = {
    columns: [
      { Header: "ID", accessor: "id", Cell: ({ value }) => <IdCell id={value} /> },
      { Header: "Tournament", accessor: "tournament_name", Cell: ({ value }) => <DefaultCell value={value || "N/A"} /> },
      { Header: "Match Title", accessor: "match_title", Cell: ({ value }) => <DefaultCell value={value || "N/A"} /> },
      { Header: "Team A", accessor: "team_a_name", Cell: ({ value }) => <DefaultCell value={value || "N/A"} /> },
      { Header: "Team B", accessor: "team_b_name", Cell: ({ value }) => <DefaultCell value={value || "N/A"} /> },
      {
        Header: "Status",
        accessor: "active_match",
        Cell: ({ value }) =>
          value ? <StatusCell icon="done" color="success" status="Active" /> :
            <StatusCell icon="close" color="error" status="Inactive" />,
      },
    ],
    rows: matches.length > 0 ? matches.map((match) => ({
      id: match.id,
      tournament_name: match.tournament_name || "N/A",
      match_title: match.match_title || "N/A",
      team_a_name: match.team_a_name || "N/A",
      team_b_name: match.team_b_name || "N/A",
      active_match: match.active_match,
    })) : [],
  };

  return dataTableData;
};

export default MatchesTable;
