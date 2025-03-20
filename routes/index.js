/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the NextJS Material Dashboard 2 PRO are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
*/

// NextJS Material Dashboard 2 PRO components


import MDAvatar from "/components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "/assets/images/logos/elare-square.png";

const routes = [
 
  // {
  //   type: "collapse",
  //   name: "Dashboards",
  //   key: "dashboards",
  //   icon: <Icon fontSize="medium">dashboard</Icon>,
  //   noCollapse: true,
  // },
  // { type: "title", title: "Pages", key: "title-pages" },
  // {
  //   type: "collapse",
  //   name: "Pages",
  //   key: "pages",
  //   icon: <Icon fontSize="medium">image</Icon>,
  //   collapse: [
  //     {
  //       name: "Profile",
  //       key: "profile",
  //       collapse: [
  //         {
  //           name: "Profile Overview",
  //           key: "profile-overview",
  //           route: "/pages/profile/profile-overview",
  //         },
  //         {
  //           name: "All Projects",
  //           key: "all-projects",
  //           route: "/pages/profile/all-projects",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Users",
  //       key: "users",
  //       collapse: [
  //         {
  //           name: "New User",
  //           key: "new-user",
  //           route: "/pages/users/new-user",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Account",
  //       key: "account",
  //       collapse: [
  //         {
  //           name: "Settings",
  //           key: "settings",
  //           route: "/pages/account/settings",
  //         },
  //         {
  //           name: "Billing",
  //           key: "billing",
  //           route: "/pages/account/billing",
  //         },
  //         {
  //           name: "Invoice",
  //           key: "invoice",
  //           route: "/pages/account/invoice",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Projects",
  //       key: "projects",
  //       collapse: [
  //         {
  //           name: "Timeline",
  //           key: "timeline",
  //           route: "/pages/projects/timeline",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Pricing Page",
  //       key: "pricing-page",
  //       route: "/pages/pricing-page",
  //     },
  //     { name: "RTL", key: "rtl", route: "/pages/rtl" },
  //     {
  //       name: "Widgets",
  //       key: "widgets",
  //       route: "/pages/widgets",
  //     },
  //     {
  //       name: "Charts",
  //       key: "charts",
  //       route: "/pages/charts",
  //     },
  //     {
  //       name: "Notfications",
  //       key: "notifications",
  //       route: "/pages/notifications",
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Applications",
  //   key: "applications",
  //   icon: <Icon fontSize="medium">apps</Icon>,
  //   collapse: [
  //     {
  //       name: "Kanban",
  //       key: "kanban",
  //       route: "/applications/kanban",
  //     },
  //     {
  //       name: "Wizard",
  //       key: "wizard",
  //       route: "/applications/wizard",
  //     },
  //     {
  //       name: "Data Tables",
  //       key: "data-tables",
  //       route: "/applications/data-tables",
  //     },
  //     {
  //       name: "Calendar",
  //       key: "calendar",
  //       route: "/applications/calendar",
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Ecommerce",
  //   key: "ecommerce",
  //   icon: <Icon fontSize="medium">shopping_basket</Icon>,
  //   collapse: [
  //     {
  //       name: "Products",
  //       key: "products",
  //       collapse: [
  //         {
  //           name: "New Product",
  //           key: "new-product",
  //           route: "/ecommerce/products/new-product",
  //         },
  //         {
  //           name: "Edit Product",
  //           key: "edit-product",
  //           route: "/ecommerce/products/edit-product",
  //         },
  //         {
  //           name: "Product Page",
  //           key: "product-page",
  //           route: "/ecommerce/products/product-page",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Orders",
  //       key: "orders",
  //       collapse: [
  //         {
  //           name: "Order List",
  //           key: "order-list",
  //           route: "/ecommerce/orders/order-list",
  //         },
  //         {
  //           name: "Order Details",
  //           key: "order-details",
  //           route: "/ecommerce/orders/order-details",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Authentication",
  //   key: "authentication",
  //   icon: <Icon fontSize="medium">content_paste</Icon>,
  //   collapse: [
  //     {
  //       name: "Sign In",
  //       key: "sign-in",
  //       collapse: [
  //         {
  //           name: "Basic",
  //           key: "basic",
  //           route: "/authentication/sign-in/basic",
  //         },
  //         {
  //           name: "Cover",
  //           key: "cover",
  //           route: "/authentication/sign-in/cover",
  //         },
  //         {
  //           name: "Illustration",
  //           key: "illustration",
  //           route: "/authentication/sign-in/illustration",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Sign Up",
  //       key: "sign-up",
  //       collapse: [
  //         {
  //           name: "Cover",
  //           key: "cover",
  //           route: "/authentication/sign-up/cover",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Reset Password",
  //       key: "reset-password",
  //       collapse: [
  //         {
  //           name: "Cover",
  //           key: "cover",
  //           route: "/authentication/reset-password/cover",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    type: "collapse",
    name: "Scoreboards",
    key: "Scoreboards",
    icon: <Icon fontSize="medium">videocam</Icon>,
    collapse: [
      {
        name: "Scoreboard Links",
        key: "scoreboard-links",
        route: "/app/scoreboards/",
      }
    ],
  },
  { type: "divider", key: "divider-1" },
  {
    type: "collapse",
    name: "Data",
    key: "Data",
    icon: <Icon fontSize="medium">folder</Icon>,
    collapse: [
      {
        name: "Create Event",
        key: "create-event",
        route: "/app/create-event",
      },
      {
        name: "Events",
        key: "events",
        route: "/app/events",
      },
    ],
  },
  { type: "divider", key: "divider-3" },
  {
    type: "collapse",
    name: "Settings",
    key: "Scoreboardss",
    icon: <Icon fontSize="medium">settings</Icon>,
    collapse: [
      {
        name: "Branding",
        key: "branding-settings",
        route: "/app/branding-settings",
      },
      {
        name: "Sign Out",
        key: "sign-out",
        route: "/authentication/sign-out",
      }
    ],
  },

  // {
  //   type: "collapse",
  //   name: "Components",
  //   key: "/components",
  //   icon: <Icon fontSize="medium">view_in_ar</Icon>,
  //   collapse: [
  //     {
  //       name: "Alerts",
  //       key: "alerts",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/alerts/material-dashboard/",
  //     },
  //     {
  //       name: "Avatar",
  //       key: "avatar",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/avatar/material-dashboard/",
  //     },
  //     {
  //       name: "Badge",
  //       key: "badge",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/badge/material-dashboard/",
  //     },
  //     {
  //       name: "Badge Dot",
  //       key: "badge-dot",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/badge-dot/material-dashboard/",
  //     },
  //     {
  //       name: "Box",
  //       key: "box",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/box/material-dashboard/",
  //     },
  //     {
  //       name: "Buttons",
  //       key: "buttons",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/buttons/material-dashboard/",
  //     },
  //     {
  //       name: "Date Picker",
  //       key: "date-picker",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/datepicker/material-dashboard/",
  //     },
  //     {
  //       name: "Dropzone",
  //       key: "dropzone",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/dropzone/material-dashboard/",
  //     },
  //     {
  //       name: "Editor",
  //       key: "editor",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/quill/material-dashboard/",
  //     },
  //     {
  //       name: "Input",
  //       key: "input",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/input/material-dashboard/",
  //     },
  //     {
  //       name: "Pagination",
  //       key: "pagination",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/pagination/material-dashboard/",
  //     },
  //     {
  //       name: "Progress",
  //       key: "progress",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/progress/material-dashboard/",
  //     },
  //     {
  //       name: "Snackbar",
  //       key: "snackbar",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/snackbar/material-dashboard/",
  //     },
  //     {
  //       name: "Social Button",
  //       key: "social-button",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/social-buttons/material-dashboard/",
  //     },
  //     {
  //       name: "Typography",
  //       key: "typography",
  //       href: "https://www.creative-tim.com/learning-lab/nextjs/typography/material-dashboard/",
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Change Log",
  //   key: "changelog",
  //   href: "",
  //   icon: <MDAvatar src={profilePicture.src} alt="Brooklyn Alice" size="sm" />,
  //   noCollapse: true,
  // },
];

export default routes;
