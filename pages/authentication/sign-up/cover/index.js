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

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Sign Up (Creates account in Supabase Auth)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { email, password, name } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    // ✅ Store the user info in a `users` table (optional)
    await supabase.from("users").insert([
      { id: data.user.id, email, full_name: name },
    ]);

    alert("Check your email for a confirmation link!");
    router.push("/app/rally-controller"); // Redirect after sign up
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
              <MDButton
                variant="gradient"
                color="dark"
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <Link href="/authentication/sign-in/basic">
                  <MDTypography
                    variant="button"
                    color="dark"
                    fontWeight="medium"
                    textGradient
                  >
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
