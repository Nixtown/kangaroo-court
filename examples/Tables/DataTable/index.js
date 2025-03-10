import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";

// react-table hooks
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
} from "react-table";
import "regenerator-runtime/runtime.js";

// MUI components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDPagination from "/components/MDPagination";

// NextJS Material Dashboard 2 PRO examples (custom cells)
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

// Import your Supabase client
import { supabase } from "/lib/supabaseClient";

function DataTable({ entriesPerPage, canSearch, showTotalEntries, pagination, isSorted, noEndBorder }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch matches data from Supabase
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        // Ensure we have an array even if no data is returned.
        setMatches(data || []);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  // Define columns for your matches table.
  const columns = useMemo(() => [
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
      Header: "Status",
      accessor: "active_match",
      Cell: ({ value }) =>
        value ? (
          <DataTableBodyCell>
            <Icon sx={{ color: "green" }}>done</Icon> Active
          </DataTableBodyCell>
        ) : (
          <DataTableBodyCell>
            <Icon sx={{ color: "red" }}>close</Icon> Inactive
          </DataTableBodyCell>
        ),
    },
  ], []);

  // Map matches to rows
  const rows = useMemo(() => {
    return Array.isArray(matches)
      ? matches.map((match) => ({
          id: match.id,
          tournament_name: match.tournament_name,
          match_title: match.match_title,
          team_a_name: match.team_a_name,
          team_b_name: match.team_b_name,
          active_match: match.active_match,
        }))
      : [];
  }, [matches]);

  // Build table data object
  const table = useMemo(() => ({ columns, rows }), [columns, rows]);

  // The rest of your DataTable component remains the same,
  // using table.columns and table.rows with react-table.

  const defaultValue = entriesPerPage.defaultValue || 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];

  const tableInstance = useTable(
    { columns, data: table.rows, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination
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
  } = tableInstance;

  // Set default entries per page
  useEffect(() => setPageSize(defaultValue), [defaultValue, setPageSize]);

  // Render paginations, search, etc. (the code below remains mostly unchanged)
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

  // Search state
  const [search, setSearch] = useState(globalFilter);
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  // Calculate entries start and end
  const entriesStart = pageIndex === 0 ? 1 : pageIndex * pageSize + 1;
  let entriesEnd = pageIndex === 0 ? pageSize : pageSize * (pageIndex + 1);
  if (pageIndex === pageOptions.length - 1) {
    entriesEnd = tableRows.length;
  }

  if (loading) {
    return <MDBox p={3}><MDTypography>Loading matches...</MDTypography></MDBox>;
  }

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {(entriesPerPage || canSearch) && (
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
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
        <MDBox mb={{ xs: 3, sm: 0 }}>
          <MDTypography variant="button" color="secondary" fontWeight="regular">
            Showing {entriesStart} to {entriesEnd} of {tableRows.length} entries
          </MDTypography>
        </MDBox>
        {pageOptions.length > 1 && (
          <MDPagination variant={pagination.variant || "gradient"} color={pagination.color || "dark"}>
            {/* Previous page button */}
            {canPreviousPage && (
              <MDPagination item onClick={() => previousPage()}>
                <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
              </MDPagination>
            )}
            {renderPagination}
            {/* Next page button */}
            {canNextPage && (
              <MDPagination item onClick={() => nextPage()}>
                <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
              </MDPagination>
            )}
          </MDPagination>
        )}
      </MDBox>
    </TableContainer>
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
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default DataTable;
