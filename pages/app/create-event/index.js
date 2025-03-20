import { useState } from "react";
import { supabase } from "/lib/supabaseClient";
import { useRouter } from "next/router";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import { toast } from "react-toastify";

const CreateEvent = () => {
  const router = useRouter();
  const [eventName, setEventName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      toast.error("User not authenticated");
      return;
    }

    // Insert the new event into the events table.
    const { data, error } = await supabase
      .from("events")
      .insert({ name: eventName, user_id: user.id })
      .select();

    if (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event");
      return;
    }

    if (data && data.length > 0) {
      const eventId = data[0].id;
      toast.success("Event created successfully");
      // Redirect to matches page using the new event id.
      // router.push(`/app/matches/${eventId}`);
      router.push(`/app/matches/`);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Card sx={{ width: "100%" }}>
          <MDBox component="form" onSubmit={handleSubmit} p={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12}>
                <MDTypography variant="h5">Create Event</MDTypography>
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  fullWidth
                  label="Event Name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  inputProps={{ type: "text", autoComplete: "off" }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <MDButton type="submit" variant="gradient" color="dark" fullWidth>
                  Create Event
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};

export default CreateEvent;
