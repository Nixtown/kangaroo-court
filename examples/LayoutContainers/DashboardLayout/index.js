/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================
* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
Coded by www.creative-tim.com
=========================================================
*/

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { supabase } from "/lib/supabaseClient";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";

// NextJS Material Dashboard 2 PRO context
import { useMaterialUIController, setLayout } from "/context";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLayout(dispatch, "dashboard");

    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/authentication/sign-in/basic"); // Redirect if not authenticated
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, router]);

  if (loading) {
    return <MDBox>Loading...</MDBox>; // Prevents UI from flashing before redirect
  }

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: "relative",
        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      {children}
    </MDBox>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
