import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "/lib/supabaseClient";
import Link from "next/link";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import { toast } from "react-toastify";

// Authentication layout components
import CoverLayout from "/pagesComponents/authentication/components/CoverLayout";

// Images
import bgImage from "/assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper: Create default branding record for a new user
  const createDefaultBranding = async (userId) => {
    const defaultBranding = {
      preset_name: "Default Branding",
      primary_color: "#0033A0",
      secondary_color: "#0041CC",
      logo_url: "/images/logos/elare-logo-avatar-light.png", // Ensure this default logo exists in your public folder
      active_branding: true,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("branding")
      .insert(defaultBranding)
      .select();
    if (error) {
      console.error("Error creating default branding:", error);
    } else {
      console.log("Default branding created:", data);
    }
  };

  const createDefaultMatchPreset = async (userId) => {
    // Build the default preset_data using your provided JSON,
    // but override user_id with the new user's id.
    const defaultPresetData = {
      matchData: {
        best_of: 3,
        user_id: userId,
        match_title: "Championship Court",
        team_a_name: "Team A",
        team_b_name: "Team B",
        current_game: 1,
        tournament_name: "Pickleball Broadcast",
      },
      gameData: [
        {
          win_by: 2,
          point_cap: 0,
          game_title: "Open Doubles",
          scoring_type: "Regular",
          win_on_serve: false,
          first_to_points: 11,
        },
        {
          win_by: 2,
          point_cap: 0,
          game_title: "Open Doubles",
          scoring_type: "Regular",
          win_on_serve: false,
          first_to_points: 11,
        },
        {
          win_by: 2,
          point_cap: 0,
          game_title: "Open Doubles",
          scoring_type: "Regular",
          win_on_serve: false,
          first_to_points: 11,
        },
      ],
    };
  
    // Build the payload for the match_presets table.
    const presetPayload = {
      preset_name: "Default",
      is_active: true,
      user_id: userId,
      preset_data: defaultPresetData,
    };
  
    // Insert the preset into the match_presets table.
    const { data, error } = await supabase
      .from("match_presets")
      .insert(presetPayload)
      .select();
  
    if (error) {
      console.error("Error creating default match preset:", error);
    } else {
      console.log("Default match preset created:", data);
    }
  };
  

  // Handle Sign Up (Creates account in Supabase Auth)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { email, password, name } = formData;

    // Sign up the user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    // Store the user info in your custom "users" table
    await supabase.from("users").insert([
      { id: data.user.id, email, full_name: name },
    ]);

    // Create default branding for the new user
    await createDefaultBranding(data.user.id);

    // Create default match preset for the new user.
    await createDefaultMatchPreset(data.user.id);


    toast.success("Check your email for a confirmation link!");
    router.push("/app/create-match"); // Redirect after sign up
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="dark"
          borderRadius="lg"
          coloredShadow="dark"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignUp}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                name="name"
                label="Name"
                variant="standard"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                name="email"
                label="Email"
                variant="standard"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                name="password"
                label="Password"
                variant="standard"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
              />
            </MDBox>
            {errorMessage && (
              <MDTypography color="error" variant="caption">
                {errorMessage}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="dark" fullWidth type="submit" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <Link href="/sign-in">
                  <MDTypography variant="button" color="dark" fontWeight="medium" textGradient>
                    Sign In
                  </MDTypography>
                </Link>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
