import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
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
import MDButton from "/components/MDButton";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { supabase } from "/lib/supabaseClient";
import { toast } from "react-toastify";
import IconButton from "@mui/material/IconButton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";


function GamesTable({ entriesPerPage, canSearch, showTotalEntries, pagination, isSorted, noEndBorder, setMatchData, matchData, gameData }) {
  const router = useRouter();
  const games = gameData


  const formatDuration = (seconds) => {
    if (seconds == null) return "N/A";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      // If hours exist, pad minutes and seconds to two digits
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      // Otherwise, just display minutes and seconds
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
  };


  // Define columns for the games table.
  const columns = useMemo(() => [
    {
      Header: "Game Title",
      accessor: "game_title",
      Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
    },
    {
      Header: "Scoring Type",
      accessor: "scoring_type",
      Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
    },
    {
      Header: "Team A Score",
      accessor: "team_a_score",
      Cell: ({ value }) => <DataTableBodyCell>{value !== null ? value : "N/A"}</DataTableBodyCell>,
    },
    {
      Header: "Team B Score",
      accessor: "team_b_score",
      Cell: ({ value }) => <DataTableBodyCell>{value !== null ? value : "N/A"}</DataTableBodyCell>,
    },
    {
      Header: "Side Out Count",
      accessor: "side_out_count",
      Cell: ({ value }) => <DataTableBodyCell>{value !== null ? value : "N/A"}</DataTableBodyCell>,
    },
    {
      Header: "Winner",
      accessor: "winner",
      Cell: ({ value }) => (
        <DataTableBodyCell>
          {value === 1
            ? matchData
              ? matchData.team_a_name
              : "Team A"
            : value === 2
            ? matchData
              ? matchData.team_b_name
              : "Team B"
            : "N/A"}
        </DataTableBodyCell>
      ),
    },
    {
      Header: "Duration",
      accessor: "duration",
      Cell: ({ value }) => <DataTableBodyCell>{formatDuration(value)}</DataTableBodyCell>,
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
    },
  ], [matchData]);

  // Map games to rows
  const rows = useMemo(() =>
    Array.isArray(games)
      ? games.map((game) => ({
          id: game.id,
          game_title: game.game_title,
          team_a_score: game.team_a_score,
          team_b_score: game.team_b_score,
          winner: game.winner,
          game_completed: game.game_completed,
          scoring_type: game.scoring_type,
          side_out_count: game.side_out_count,
          status: game.status,
          duration: game.duration
        }))
      : [],
    [games]
  );

  const tableData = useMemo(() => ({ columns, rows }), [columns, rows]);

  // Create the table instance including row selection if needed.
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
          width: 50,
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <MDBox sx={{ width: 50, display: "flex", justifyContent: "center" }}>
              <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
            </MDBox>
          ),
          Cell: ({ row }) => (
            <MDBox sx={{ width: 50, display: "flex", justifyContent: "center" }}>
              <input type="checkbox" {...row.getToggleRowSelectedProps()} />
            </MDBox>
          ),
        },
        ...cols,
      ]);
    }
  );

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

  const defaultValue = entriesPerPage.defaultValue || 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];

  useEffect(() => setPageSize(defaultValue), [defaultValue, setPageSize]);

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

// Delete handler for selected games
const handleDeleteSelected = async () => {
  // Extract the selected rows’ original game data.
  const selectedGames = selectedFlatRows.map((row) => row.original);
  const idsToDelete = selectedGames.map((game) => game.id);
  const amountDeleted = idsToDelete.length;

  if (!matchData || !matchData.id) {
    console.error("No match selected to update.");
    toast.error("Error: No active match.");
    return;
  }

  // Delete from Supabase "game_stats" table.
  const { error } = await supabase.from("game_stats").delete().in("id", idsToDelete);
  
  if (error) {
    console.error("Error deleting games:", error);
    toast.error("Error deleting selected games.");
    return;
  }

  // Calculate the new `best_of`
  const newBestOf = Math.max(1, matchData.best_of - amountDeleted);

  // Update matchData state
  setMatchData((prevMatchData) => ({
    ...prevMatchData,
    best_of: newBestOf,
    current_game: 1, // Reset current game
  }));

  // 🔥 Update the match in Supabase
  const { error: updateError } = await supabase
    .from("matches")
    .update({ best_of: newBestOf, current_game: 1 })
    .eq("id", matchData.id);

  if (updateError) {
    console.error("Error updating match:", updateError);
    toast.error("Error updating match in database.");
    return;
  }

  toast.success("Selected games deleted and match updated successfully.");
};



  return (
    <MDBox>
      {/* Action buttons */}
      <MDBox display="flex" alignItems="center" p={3}>
   
          <MDBox 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            width: "100%"  // Ensures full width for spacing
          }}
        >
          {/* Back Button (Left) */}
          <IconButton onClick={() => router.push(`/app/matches/${matchData.event_id}`)}>
            <Icon>arrow_back</Icon>
          </IconButton>

          {/* Delete Button (Right) */}
          <IconButton onClick={handleDeleteSelected} sx={{ color: "error.main" }}>
            <DeleteForeverIcon />
          </IconButton>
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
      <TableContainer sx={{ boxShadow: "none" }}>
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

GamesTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "dark" },
  isSorted: true,
  noEndBorder: false,
};

GamesTable.propTypes = {
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

export default GamesTable;
