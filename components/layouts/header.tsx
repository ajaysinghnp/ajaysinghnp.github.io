import { Homemade_Apple } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const homemadeApple = Homemade_Apple({ weight: ["400"], subsets: ["latin"] });

const Header = () => {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between px-16 py-6",
        // "bg-primary-900 text-white"
      )}
    >
      <div className={cn("brand", "flex items-center justify-center gap-4")}>
        <Image src="/Logo.svg" width={50} height={50} alt="Logo for Ajay" />
        <h1 className={cn(homemadeApple.className, "text-primary-100 text-2xl font-bold")}>Ajay</h1>
      </div>
      <div className={cn("navigation", "flex flex-row items-center justify-between gap-36")}>
        <nav>
          <ul className={cn("text-muted-100 flex flex-row gap-12 font-medium uppercase")}>
            <li className="text-primary-100 hover:text-primary-100 font-bold">
              <Link href="/">Profile</Link>
            </li>
            <li className="hover:text-primary-100">
              <Link href="/about">About</Link>
            </li>
            <li className="hover:text-primary-100">
              <Link href="/about">Skills</Link>
            </li>
            <li className="hover:text-primary-100">
              <Link href="/projects">Projects</Link>
            </li>
            <li className="hover:text-primary-100">
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
        <button
          type="button"
          className={cn(
            "bg-primary-100/80 hover:bg-primary-100 shine-border-hover rounded px-16 py-2 text-white",
          )}
        >
          Blogs
        </button>
      </div>
    </header>
  );
};

export default Header;
