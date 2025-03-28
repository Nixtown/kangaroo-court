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
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MuiLink from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO examples
import SidenavCollapse from "/examples/Sidenav/SidenavCollapse";
import SidenavList from "/examples/Sidenav/SidenavList";
import SidenavItem from "/examples/Sidenav/SidenavItem";

// Custom styles for the Sidenav
import SidenavRoot from "/examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "/examples/Sidenav/styles/sidenav";

// NextJS Material Dashboard 2 PRO context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "/context";

// Import default logo (in case no branding is found)
import profilePicture from "/assets/images/logos/elare-square.png";

// Import Supabase client
import { supabase } from "/lib/supabaseClient";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const { pathname } = useRouter();
  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items[1];
  const itemName = items[items.length - 1];
  const [fullName, setFullName] = useState("");

  // Use dynamic branding instead of static brand/brandName
  // Default values:
  const [branding, setBranding] = useState({
    logo_url: profilePicture.src,
    preset_name: "Elare Pickleball",
  });


  useEffect(() => {
    const fetchFullName = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching full name:", error);
      } else {
        setFullName(data?.full_name || "");
      }
    };
  
    fetchFullName();
  }, []);


  // Fetch active branding from Supabase on mount
  useEffect(() => {
    const fetchBranding = async () => {
      const { data, error } = await supabase
        .from("branding")
        .select("*")
        .eq("active_branding", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching branding:", error);
      } else if (data) {
        setBranding({
          logo_url: data.logo_url || profilePicture.src,
          preset_name: data.preset_name || "Elare Pickleball",
        });
      }
    };
    fetchBranding();
  }, []);

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    setOpenCollapse(collapseName);
    setOpenNestedCollapse(itemParentName);
  }, [collapseName, itemParentName]);

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : transparentSidenav
      );
      setWhiteSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : whiteSidenav
      );
    }
    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  // Render all the nested collapse items from routes.js
  const renderNestedCollapse = (collapse) => {
    return collapse.map(({ name, route, key, href }) =>
      href ? (
        <MuiLink
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavItem name={name} nested />
        </MuiLink>
      ) : (
        <Link href={route} key={key} sx={{ textDecoration: "none" }}>
          <SidenavItem name={name} active={route === pathname} nested />
        </Link>
      )
    );
  };

  // Render collapses from routes.js
  const renderCollapse = (collapses) =>
    collapses.map(({ name, collapse, route, href, key }) => {
      let returnValue;
      if (collapse) {
        returnValue = (
          <SidenavItem
            key={key}
            color={color}
            name={name}
            active={key === itemParentName ? "isParent" : false}
            open={openNestedCollapse === key}
            onClick={({ currentTarget }) =>
              openNestedCollapse === key &&
              currentTarget.classList.contains("MuiListItem-root")
                ? setOpenNestedCollapse(false)
                : setOpenNestedCollapse(key)
            }
          >
            {renderNestedCollapse(collapse)}
          </SidenavItem>
        );
      } else {
        returnValue = href ? (
          <MuiLink
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavItem color={color} name={name} active={key === itemName} />
          </MuiLink>
        ) : (
          <Link href={route} key={key} sx={{ textDecoration: "none" }}>
            <SidenavItem color={color} name={name} active={key === itemName} />
          </Link>
        );
      }
      return <SidenavList key={key}>{returnValue}</SidenavList>;
    });

  // Render all routes from routes.js (visible items on the Sidenav)
  const renderRoutes = routes.map(
    ({ type, name, icon, title, collapse, noCollapse, key, href, route }) => {
      let returnValue;
      if (type === "collapse") {
        if (href) {
          returnValue = (
            <MuiLink
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavCollapse
                name={name}
                icon={icon}
                active={key === collapseName}
                noCollapse={noCollapse}
              />
            </MuiLink>
          );
        } else if (noCollapse && route) {
          returnValue = (
            <Link href={route} key={key} passHref>
              <SidenavCollapse
                name={name}
                icon={icon}
                noCollapse={noCollapse}
                active={key === collapseName}
              >
                {collapse ? renderCollapse(collapse) : null}
              </SidenavCollapse>
            </Link>
          );
        } else {
          returnValue = (
            <SidenavCollapse
              key={key}
              name={name}
              icon={icon}
              active={key === collapseName}
              open={openCollapse === key}
              onClick={() =>
                openCollapse === key
                  ? setOpenCollapse(false)
                  : setOpenCollapse(key)
              }
            >
              {collapse ? renderCollapse(collapse) : null}
            </SidenavCollapse>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }
      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={() => setMiniSidenav(dispatch, true)}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <Link href="/">
          <MDBox display="flex" alignItems="center">
            <MDBox
              component="img"
              src={branding.logo_url}
              alt={branding.preset_name}
              width="1.75rem"
            />
            <MDBox
              width={!branding.preset_name && "100%"}
              sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
            >
              <MDTypography
                component="h6"
                variant="button"
                fontWeight="medium"
                color={textColor}
              >
               {fullName}
              </MDTypography>
            </MDBox>
          </MDBox>
        </Link>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "dark",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
