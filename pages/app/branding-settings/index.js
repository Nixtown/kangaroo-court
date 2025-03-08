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
    active_branding: true, // We'll always set the new/updated record to active
  });
  const [uploading, setUploading] = useState(false);
  const [presets, setPresets] = useState([]);

  // Fetch current branding settings on mount
  useEffect(() => {
    const fetchBranding = async () => {
      const { data, error } = await supabase
        .from("branding")
        .select("*")
        .eq("active_branding", true) // Only load the active branding record
        .limit(1)
        .maybeSingle();
      if (error) console.error("Error fetching branding:", error);
      if (data) setBranding(data);
    };
    fetchBranding();
  }, []);
  

  // Fetch all presets for loading previous settings
  useEffect(() => {
    const fetchPresets = async () => {
      const { data, error } = await supabase
        .from("branding")
        .select("*")
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

  const deactivateAllBranding = async () => {
    const { error } = await supabase
      .from("branding")
      .update({ active_branding: false })
      .not("id", "is", null);
    if (error) {
      console.error("Error deactivating previous branding records:", error);
    }
  };
  

  // Save Branding Settings (update current active branding)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Deactivate all branding records first
    await deactivateAllBranding();

    // Ensure the current record will be active
    const brandingPayload = { ...branding, active_branding: true };

    // Upsert (update if exists, insert otherwise)
    const { data, error } = await supabase
      .from("branding")
      .upsert(brandingPayload);
    if (error) console.error("Error saving branding settings:", error);
    else {
      console.log("Branding settings saved:", data);
      // Optionally, refresh presets list
    }
    toast.success(
        "Branding Saved / Activated",
        {
          position: "top-center", // Positions the toast at the top center
          autoClose: 3000,        // Auto-closes after 3 seconds
          hideProgressBar: false, // Displays the progress bar
          closeOnClick: true,     // Allows dismissal on click
          pauseOnHover: true,     // Pauses autoClose timer when hovered
          draggable: true,        // Enables dragging to dismiss
          theme: "dark",       // Uses the "colored" theme for a vibrant look
          style: { width: "100%", maxWidth: "500px" },
        }
      );
  };

  // Save as New Preset (always insert new row)
  const handleSaveNewPreset = async () => {
    // Deactivate all existing presets
    await deactivateAllBranding();
    // Remove existing id if present so a new one is generated
    const { id, ...presetWithoutId } = branding;
    const newPreset = { ...presetWithoutId, preset_name: branding.preset_name || "New Preset", active_branding: true };

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
          position: "top-center", // Positions the toast at the top center
          autoClose: 3000,        // Auto-closes after 3 seconds
          hideProgressBar: false, // Displays the progress bar
          closeOnClick: true,     // Allows dismissal on click
          pauseOnHover: true,     // Pauses autoClose timer when hovered
          draggable: true,        // Enables dragging to dismiss
          theme: "dark",       // Uses the "colored" theme for a vibrant look
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

              {/* Preset Loader */}
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

              {/* Preset Name Input */}
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

              {/* Primary Color Picker */}
              <Grid item xs={12} sm={6} align="center">
                <MDTypography align="center" variant="subtitle2">
                  Primary Color
                </MDTypography>
                <ChromePicker
                  color={branding.primary_color}
                  onChangeComplete={handlePrimaryColorChange}
                />
              </Grid>

              {/* Secondary Color Picker */}
              <Grid item xs={12} sm={6} align="center">
                <MDTypography align="center" variant="subtitle2">
                  Secondary Color
                </MDTypography>
                <ChromePicker
                  color={branding.secondary_color}
                  onChangeComplete={handleSecondaryColorChange}
                />
              </Grid>

              {/* Logo Preview */}
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

              {/* Logo Upload */}
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

            {/* Save Buttons */}
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
