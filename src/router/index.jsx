import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "layouts/MainLayout";
import NotFound from "pages/NotFound";
import Home from "pages/Home";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          // path: "*",
          element: <Home />,
        },
        { path: "invite/:to", element: <Home /> },
        // {
        //   path: "about",
        //   element: <div>About Page</div>,
        // },
        // {
        //   path: "contact",
        //   element: <div>Contact Page</div>,
        // },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    // Vite will fill this from vite.config.js `base`
    basename: import.meta.env.BASE_URL,
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
