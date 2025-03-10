import { useEffect, useState } from "react";
import { supabase } from "/lib/supabaseClient";
import { useRouter } from "next/router";
import { ChromePicker } from "react-color"; // Using ChromePicker for now
import Autocomplete from "@mui/material/Autocomplete";

import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";

const BrandingSettings = () => {
  const router = useRouter();
  const [branding, setBranding] = useState({
    preset_name: "", // Optional preset name
    primary_color: "#0033A0",
    secondary_color: "#0041CC",
    logo_url: "",
    active_branding: true, // New/updated record will be active
  });
  const [uploading, setUploading] = useState(false);
  const [presets, setPresets] = useState([]);

  // Fetch current branding settings for the logged-in user
  useEffect(() => {
    const fetchBranding = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data, error } = await supabase
        .from("branding")
        .select("*")
        .eq("active_branding", true)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (error) console.error("Error fetching branding:", error);
      if (data) setBranding(data);
    };
    fetchBranding();
  }, []);

  // Fetch all presets for the logged-in user
  useEffect(() => {
    const fetchPresets = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data, error } = await supabase
        .from("branding")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) console.error("Error fetching presets:", error);
      else setPresets(data || []);
    };
    fetchPresets();
  }, []);

  // Handle color changes
  const handlePrimaryColorChange = (color) => {
    setBranding((prev) => ({ ...prev, primary_color: color.hex }));
  };

  const handleSecondaryColorChange = (color) => {
    setBranding((prev) => ({ ...prev, secondary_color: color.hex }));
  };

  // Handle file upload for logo
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = fileName;
  
    setUploading(true);
    const { error } = await supabase.storage
      .from("branding-images")
      .upload(filePath, file);
    if (error) {
      console.error("Error uploading image:", error);
    } else {
      const { data: publicData, error: publicURLError } = supabase.storage
        .from("branding-images")
        .getPublicUrl(filePath);
      if (publicURLError) {
        console.error("Error getting public URL:", publicURLError);
      } else if (publicData) {
        setBranding((prev) => ({ ...prev, logo_url: publicData.publicUrl }));
      }
    }
    setUploading(false);
  };

  // Deactivate all branding records for the current user
  const deactivateAllBranding = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }
    const { error } = await supabase
      .from("branding")
      .update({ active_branding: false })
      .eq("user_id", user.id);
    if (error) {
      console.error("Error deactivating previous branding records:", error);
    }
  };

  // Save Branding Settings (update current active branding for the current user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    await deactivateAllBranding();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }
    const brandingPayload = { ...branding, active_branding: true, user_id: user.id };
    const { data, error } = await supabase
      .from("branding")
      .upsert(brandingPayload);
    if (error) console.error("Error saving branding settings:", error);
    else {
      console.log("Branding settings saved:", data);
    }
    toast.success(
      "Branding Saved / Activated",
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: { width: "100%", maxWidth: "500px" },
      }
    );
  };

  // Save as New Preset (always insert a new row for the current user)
  const handleSaveNewPreset = async () => {
    await deactivateAllBranding();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return;
    }
    // Remove the id if it exists so a new one is generated
    const { id, ...presetWithoutId } = branding;
    const newPreset = { ...presetWithoutId, preset_name: branding.preset_name || "New Preset", active_branding: true, user_id: user.id };
  
    const { data, error } = await supabase
      .from("branding")
      .insert(newPreset)
      .select();
    if (error) console.error("Error saving new preset:", error);
    else {
      console.log("New preset saved:", data);
      setPresets((prev) => [data[0], ...prev]);
    }
  
    toast.success(
      "New Preset Created and Activated",
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: { width: "100%", maxWidth: "500px" },
      }
    );
  };

  // Load a preset into the form when selected
  const handleLoadPreset = (event, newValue) => {
    if (newValue) {
      setBranding(newValue);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Card sx={{ width: "80%", maxWidth: 600, margin: "0 auto" }}>
          <MDBox component="form" pb={3} px={3} onSubmit={handleSubmit}>
            <Grid container spacing={3} pt={3}>
              <Grid item xs={12}>
                <MDTypography variant="h5">Branding Settings</MDTypography>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={presets}
                  getOptionLabel={(option) =>
                    option.preset_name || new Date(option.updated_at).toLocaleString()
                  }
                  onChange={handleLoadPreset}
                  renderInput={(params) => (
                    <MDInput
                      {...params}
                      label="Load Preset"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  fullWidth
                  label="Preset Name"
                  value={branding.preset_name || ""}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, preset_name: e.target.value }))
                  }
                  inputProps={{ type: "text", autoComplete: "off" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} align="center">
                <MDTypography align="center" variant="subtitle2">
                  Primary Color
                </MDTypography>
                <ChromePicker
                  color={branding.primary_color}
                  onChangeComplete={handlePrimaryColorChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} align="center">
                <MDTypography align="center" variant="subtitle2">
                  Secondary Color
                </MDTypography>
                <ChromePicker
                  color={branding.secondary_color}
                  onChangeComplete={handleSecondaryColorChange}
                />
              </Grid>
              <Grid item xs={12} align="center">
                <MDBox
                  component="img"
                  src={branding.logo_url}
                  alt="Logo"
                  sx={{
                    width: "200px",
                    mt: 2,
                    borderRadius: "8px",
                    boxShadow: 3,
                    backgroundColor: branding.primary_color,
                    padding: "24px",
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} align="center">
                <MDInput
                  type="file"
                  onChange={handleFileChange}
                  inputProps={{ accept: "image/*" }}
                />
                {uploading && (
                  <MDTypography variant="caption">
                    Uploading...
                  </MDTypography>
                )}
              </Grid>
            </Grid>
            <Grid container spacing={3} pt={3} pl={3}>
              <Grid item xs={12}>
                <MDButton variant="gradient" color="dark" fullWidth type="submit">
                  Save / Activate
                </MDButton>
              </Grid>
              <Grid item xs={12} sx={{ pt: 2 }}>
                <MDButton variant="outlined" color="dark" fullWidth onClick={handleSaveNewPreset}>
                  Save as New Preset
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};

export default BrandingSettings;
