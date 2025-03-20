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
import { supabase } from "/lib/supabaseClient";
import { useRouter } from "next/router";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import IconButton from "@mui/material/IconButton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { toast } from "react-toastify";

function EventsTable({ entriesPerPage, canSearch, showTotalEntries, pagination, isSorted, noEndBorder }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch events for the logged in user
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      // Get the authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        setLoading(false);
        return;
      }

      // Fetch events that belong to this user
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // Function to handle deletion of selected events
  const handleDeleteSelected = async () => {
    // Extract selected events from the table instance
    const selectedEvents = selectedFlatRows.map((row) => row.original);
    if (selectedEvents.length < 1) {
      toast.error("Please select at least one event to delete.");
      return;
    }
    const idsToDelete = selectedEvents.map((event) => event.id);

    // Delete the selected events from Supabase
    const { error } = await supabase.from("events").delete().in("id", idsToDelete);
    if (error) {
      console.error("Error deleting events:", error);
      toast.error("Error deleting events.");
    } else {
      toast.success("Event(s) deleted successfully.");
      // Update the events state by filtering out the deleted events
      setEvents((prev) => prev.filter((event) => !idsToDelete.includes(event.id)));
    }
  };

  // Define table columns – here we show the Event Name and Created At date.
  const columns = useMemo(
    () => [
      {
        Header: "Event Name",
        accessor: "name",
        Cell: ({ value }) => <DataTableBodyCell>{value || "N/A"}</DataTableBodyCell>,
      },
      {
        Header: "Created At",
        accessor: "created_at",
        Cell: ({ value }) =>
          <DataTableBodyCell>
            {value ? new Date(value).toLocaleString() : "N/A"}
          </DataTableBodyCell>,
      },
    ],
    []
  );

  // Map events to table rows
  const rows = useMemo(
    () =>
      Array.isArray(events)
        ? events.map((event) => ({
            id: event.id,
            name: event.name,
            created_at: event.created_at,
          }))
        : [],
    [events]
  );

  // Build table data
  const tableData = useMemo(() => ({ columns, rows }), [columns, rows]);

  // Create the table instance with row selection enabled.
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
              <input type="checkbox" {...getToggleAllRowsSelectedProps()} onClick={(e) => e.stopPropagation()} />
            </MDBox>
          ),
          Cell: ({ row }) => (
            <MDBox sx={{ width: 50, display: "flex", justifyContent: "center" }}>
              <input type="checkbox" {...row.getToggleRowSelectedProps()} onClick={(e) => e.stopPropagation()} />
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

  // Default entries per page
  const defaultValue = entriesPerPage.defaultValue || 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];

  useEffect(() => {
    setPageSize(defaultValue);
  }, [defaultValue, setPageSize]);

  const [search, setSearch] = useState(globalFilter);
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  const entriesStart = pageIndex === 0 ? 1 : pageIndex * pageSize + 1;
  let entriesEnd = pageIndex === 0 ? pageSize : pageSize * (pageIndex + 1);
  if (pageIndex === pageOptions.length - 1) {
    entriesEnd = tableData.rows.length;
  }

  if (loading) {
    return (
      <MDBox p={3}>
        <MDTypography>Loading events...</MDTypography>
      </MDBox>
    );
  }

  // Render pagination items
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

  return (
    <MDBox>
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
            <MDBox sx={{ display: "flex", alignItems: "center", width: "12rem", ml: "auto" }}>
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
              <IconButton onClick={handleDeleteSelected} sx={{ ml: 1, color: "error.main" }}>
                <DeleteForeverIcon />
              </IconButton>
            </MDBox>
          )}
        </MDBox>
      )}
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
                <TableRow
                  key={key}
                  {...row.getRowProps({
                    onClick: () => router.push(`/app/matches/${row.original.id}`),
                    style: { cursor: "pointer" },
                    sx: { "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" } },
                  })}
                >
                  {row.cells.map((cell, cellKey) => (
                    <DataTableBodyCell key={cellKey} {...cell.getCellProps()}>
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
              Showing {entriesStart} to {entriesEnd} of {tableData.rows.length} entries
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

EventsTable.propTypes = {
  entriesPerPage: PropTypes.object,
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  pagination: PropTypes.object,
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default EventsTable;
