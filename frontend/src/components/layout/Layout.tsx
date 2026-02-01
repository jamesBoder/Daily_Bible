import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { OfflineBanner } from "../common/OfflineBanner";


export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      <main className="flex-1 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
