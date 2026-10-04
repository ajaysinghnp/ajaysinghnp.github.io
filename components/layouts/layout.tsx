"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { Navigation } from "./nav";
import SiteFooter from "./site-footer";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const pathname = usePathname();
  if (pathname === "/") {
    // console.info("homepage");
    return children;
  }
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="relative flex flex-1 flex-col">
        <Navigation />
        <div className="mx-auto mb-12 w-full max-w-[80%] flex-1 pt-8 lg:pt-10">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Layout;
