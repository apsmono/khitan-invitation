import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      <header></header>

      <main>
        <Outlet />
      </main>

      <footer>
        <small>© 2025 apsmono</small>
      </footer>
    </div>
  );
}
