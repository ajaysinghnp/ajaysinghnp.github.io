"use client";

import React from 'react'
import { Navigation } from './nav'
import Footer from './footer'
import { usePathname } from 'next/navigation';

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  const pathname = usePathname();
  if (pathname === '/') {
    console.log('homepage')
    return children
  }
  return (
    <div className="relative">
      <div className="relative">
        <Navigation />
        <div className="w-full mx-auto max-w-[90%] mb-12">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Layout