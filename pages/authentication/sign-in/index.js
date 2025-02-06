/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

==========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// @mui material components
import Switch from "@mui/material/Switch";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";

// Authentication layout components
import IllustrationLayout from "/pagesComponents/authentication/components/IllustrationLayout";

// Image
import bgImage from "/assets/images/illustrations/pickleball-on-court-blue.jpg";

function Illustration() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // Function to handle sign in
  const handleSignIn = (e) => {
    e.preventDefault();

    // Check credentials against our hard-coded values
    if (username === "Elare" && password === "Picklehead") {
      setError("");

      // Example of persisting login information:
      // If "Remember me" is checked, store the login flag/token in localStorage.
      // Otherwise, use sessionStorage (which will be cleared when the session ends).
      if (rememberMe) {
        localStorage.setItem("loggedIn", "true");
        // You might also store a token, user ID, or other secure info.
      } else {
        sessionStorage.setItem("loggedIn", "true");
      }

      // Redirect to the dashboard
      router.push("/pages/log-score");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <IllustrationLayout
      title="Sign In"
      description="Enter your username and password to sign in"
      illustration={bgImage}
    >
      <MDBox component="form" role="form" onSubmit={handleSignIn}>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="password"
            label="Password"
            fullWidth
            value={password}
            
            onChange={(e) => setPassword(e.target.value)}
          />
        </MDBox>
        <MDBox display="flex" alignItems="center" ml={-1}>
          <Switch checked={rememberMe} onChange={handleSetRememberMe} />
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            onClick={handleSetRememberMe}
            sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
          >
            &nbsp;&nbsp;Remember me
          </MDTypography>
        </MDBox>
        {error && (
          <MDBox mt={2}>
            <MDTypography variant="caption" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}
        <MDBox mt={4} mb={1}>
          <MDButton
            variant="gradient"
            color="dark"
            size="large"
            fullWidth
            type="submit"
          >
            Sign In
          </MDButton>
        </MDBox>
        {/*
          Optionally, include a sign-up link:
          <MDBox mt={3} textAlign="center">
            <MDTypography variant="button" color="text">
              Don&apos;t have an account?{" "}
              <Link href="/authentication/sign-up/cover">
                <MDTypography
                  variant="button"
                  color="dark"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </Link>
            </MDTypography>
          </MDBox>
        */}
      </MDBox>
    </IllustrationLayout>
  );
}

export default Illustration;