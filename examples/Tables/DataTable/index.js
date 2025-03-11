import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useRowSelect,
} from "react-table";
import "regenerator-runtime/runtime.js";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDPagination from "/components/MDPagination";
import MDButton from "/components/MDButton"; // Assuming you have this component
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { supabase } from "/lib/supabaseClient";
import Link from "next/link";
import { toast } from "react-toastify";

function DataTable({ entriesPerPage, canSearch, showTotalEntries, pagination, isSorted, noEndBorder }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
  
      // Get the authenticated user's id
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        setLoading(false);
        return;
      }
  
      // Fetch only matches for this user
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setMatches(data || []);
      }
      setLoading(false);
    };
  
    fetchMatches();
  }, []);

  // Function to handle activation of a match
const handleActivate = async (matchId) => {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("User not authenticated:", authError);
    toast.error("User not authenticated.");
    return;
  }
  // Deactivate all matches for this user
  const { error: deactivationError } = await supabase
    .from("matches")
    .update({ active_match: false })
    .eq("user_id", user.id);
  if (deactivationError) {
    console.error("Error deactivating matches:", deactivationError);
    toast.error("Error deactivating matches.");
    return;
  }
  // Activate the selected match
  const { error: activationError } = await supabase
    .from("matches")
    .update({ active_match: true })
    .eq("id", matchId);
  if (activationError) {
    console.error("Error activating match:", activationError);
    toast.error("Error activating match.");
    return;
  }
  toast.success("Match activated!");
  // Optionally, refresh your state or redirect if necessary.
};



  // Define columns for your matches table.
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        Cell: ({ value }) => <DataTableBodyCell>{value}</DataTableBodyCell>,
      },
      {
        Header: "Tournament",
        accessor: "tournament_name",
        Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
      },
      {
        Header: "Match Title",
        accessor: "match_title",
        Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
      },
      {
        Header: "Team A",
        accessor: "team_a_name",
        Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
      },
      {
        Header: "Team B",
        accessor: "team_b_name",
        Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
      },
      {
        Header: "Overlay",
        accessor: "active_match",
        Cell: ({ row, value }) => (
          <DataTableBodyCell
            onClick={() => handleActivate(row.original.id)}
            sx={{ cursor: "pointer" }}
          >
            <Icon sx={{ color: value ? "green" : "red" }}>
              {value ? "visibility" : "visibility_off"}
            </Icon>
          </DataTableBodyCell>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <Link href={`/app/view-games/${row.original.id}`} passHref>
            <MDButton variant="gradient" color="dark" size="small">
              View Games
            </MDButton>
          </Link>
        ),
      },
    ],
    []
  );
  

  // Map matches to rows
  const rows = useMemo(
    () =>
      Array.isArray(matches)
        ? matches.map((match) => ({
            id: match.id,
            tournament_name: match.tournament_name,
            match_title: match.match_title,
            team_a_name: match.team_a_name,
            team_b_name: match.team_b_name,
            active_match: match.active_match,
            status: match.status
          }))
        : [],
    [matches]
  );

  // Build table data object
  const tableData = useMemo(() => ({ columns, rows }), [columns, rows]);

  // Create the table instance including useRowSelect for row selection.
  const tableInstance = useTable(
    { columns, data: tableData.rows, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
(hooks) => {
  hooks.visibleColumns.push((cols) => [
    {
      id: "selection",
      width: 100, // set a fixed width (adjust as needed)
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <MDBox sx={{ width: 50, display: "flex", justifyContent: "center" }}>
          <input
            type="checkbox"
            {...getToggleAllRowsSelectedProps()}
           
          />
        </MDBox>
      ),
      Cell: ({ row }) => (
        <MDBox sx={{ width: 50, display: "flex", justifyContent: "center" }}>
          <input
            type="checkbox"
            {...row.getToggleRowSelectedProps()}
            
          />
        </MDBox>
      ),
    },
    ...cols,
  ]);
}

  );

  // Destructure necessary properties from tableInstance including selectedFlatRows.
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows: tableRows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
    selectedFlatRows,
  } = tableInstance;

  // Set default entries per page
  const defaultValue = entriesPerPage.defaultValue || 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];

  useEffect(() => setPageSize(defaultValue), [defaultValue, setPageSize]);

  // Delete handler for selected rows
  const handleDeleteSelected = async () => {
    // Extract the selected rows’ original data.
    const selectedMatches = selectedFlatRows.map((row) => row.original);
    const idsToDelete = selectedMatches.map((match) => match.id);


    // Delete from Supabase.
    const { error } = await supabase.from("matches").delete().in("id", idsToDelete);
    if (error) {
      console.error("Error deleting matches:", error);
    } else {
      // Remove deleted matches from state.
      setMatches((prev) => prev.filter((match) => !idsToDelete.includes(match.id)));
    }
  };

  // Make Active handler for selected row
const handleMakeActive = async () => {
  // Get the authenticated user's id
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("User not authenticated:", authError);
    return;
  }

  // First, set all matches for this user to inactive
  const { error: updateAllError } = await supabase
    .from("matches")
    .update({ active_match: false })
    .eq("user_id", user.id);
  if (updateAllError) {
    console.error("Error setting matches inactive:", updateAllError);
    return;
  }

  // Ensure that at least one row is selected
  if (selectedFlatRows.length < 1) {
    alert("Please select a match to activate.");
    return;
  }

  // Use the first selected match as the one to activate
  const matchToActivate = selectedFlatRows[0].original;

  // Update the selected match to active
  const { error: updateActiveError } = await supabase
    .from("matches")
    .update({ active_match: true })
    .eq("id", matchToActivate.id);
  if (updateActiveError) {
    console.error("Error setting the match active:", updateActiveError);
    return;
  }

  // Update local state to reflect the changes.
  // Here we update each match so that only the activated one remains active.
  setMatches((prevMatches) =>
    prevMatches.map((match) =>
      match.user_id === user.id
        ? { ...match, active_match: match.id === matchToActivate.id }
        : match
    )
  );
};


  // Pagination rendering and search functionality (same as before)...
  const renderPagination = pageOptions.map((option) => (
    <MDPagination
      item
      key={option}
      onClick={() => gotoPage(Number(option))}
      active={pageIndex === option}
    >
      {option + 1}
    </MDPagination>
  ));

  const [search, setSearch] = useState(globalFilter);
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  const entriesStart = pageIndex === 0 ? 1 : pageIndex * pageSize + 1;
  let entriesEnd = pageIndex === 0 ? pageSize : pageSize * (pageIndex + 1);
  if (pageIndex === pageOptions.length - 1) {
    entriesEnd = tableRows.length;
  }

  if (loading) {
    return (
      <MDBox p={3}>
        <MDTypography>Loading matches...</MDTypography>
      </MDBox>
    );
  }

  return (
    <MDBox>
      {/* Action button for selected rows */}
  

      <TableContainer sx={{ boxShadow: "none" }}>
        {(entriesPerPage || canSearch) && (
          
          <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
               <MDBox mb={2}>
               <Link href="/app/create-match" passHref>
          <MDButton variant="gradient" color="dark">
            New Match
          </MDButton>
          </Link>
                <MDButton variant="gradient" color="dark" onClick={handleDeleteSelected} sx={{ ml: 2 }}>
                  Delete Selected
                </MDButton>
      
              </MDBox>

            {entriesPerPage && (
              <MDBox display="flex" alignItems="center">
                <Autocomplete
                  disableClearable
                  value={pageSize.toString()}
                  options={entries}
                  onChange={(event, newValue) => {
                    setPageSize(parseInt(newValue, 10));
                  }}
                  size="small"
                  sx={{ width: "5rem" }}
                  renderInput={(params) => <MDInput {...params} />}
                />
                <MDTypography variant="caption" color="secondary">
                  &nbsp;&nbsp;entries per page
                </MDTypography>
              </MDBox>
              
            )}
            {canSearch && (
              <MDBox width="12rem" ml="auto">
                <MDInput
                  placeholder="Search..."
                  value={search}
                  size="small"
                  fullWidth
                  onChange={({ currentTarget }) => {
                    setSearch(currentTarget.value);
                    onSearchChange(currentTarget.value);
                  }}
                />
              </MDBox>
            )}
            
          </MDBox>
          
        )}
        <Table {...getTableProps()}>
          <MDBox component="thead">
            {headerGroups.map((headerGroup, key) => (
              <TableRow key={key} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, key) => (
                  <DataTableHeadCell
                    key={key}
                    {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                    width={column.width || "auto"}
                    align={column.align || "left"}
                    sorted={isSorted ? (column.isSortedDesc ? "desc" : "asce") : false}
                  >
                    {column.render("Header")}
                  </DataTableHeadCell>
                ))}
              </TableRow>
            ))}
          </MDBox>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, key) => {
              prepareRow(row);
              return (
                <TableRow key={key} {...row.getRowProps()}>
                  {row.cells.map((cell, cellKey) => (
                    <DataTableBodyCell
                      key={cellKey}
                      noBorder={noEndBorder && tableRows.length - 1 === key}
                      align={cell.column.align || "left"}
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
                    </DataTableBodyCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <MDBox
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          p={pageOptions.length === 1 ? 0 : 3}
        >
          <MDBox mb={{ xs: 3, sm: 0 }} p={3}>
            <MDTypography variant="button" color="secondary" fontWeight="regular">
              Showing {entriesStart} to {entriesEnd} of {tableRows.length} entries
            </MDTypography>
          </MDBox>
          {pageOptions.length > 1 && (
            <MDPagination variant={pagination.variant || "gradient"} color={pagination.color || "dark"}>
              {canPreviousPage && (
                <MDPagination item onClick={() => previousPage()}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                </MDPagination>
              )}
              {renderPagination}
              {canNextPage && (
                <MDPagination item onClick={() => nextPage()}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                </MDPagination>
              )}
            </MDPagination>
          )}
        </MDBox>
      </TableContainer>
    </MDBox>
  );
}

DataTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "dark" },
  isSorted: true,
  noEndBorder: false,
};

DataTable.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark", "light"]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default DataTable;
