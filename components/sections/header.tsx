import React from "react";
import Image from "next/image";

import MainNav from "@/components/sections/main-nav";
import TopBar from "./top-bar";
import Slider from "./slider";

const posts = [
  {
    text: "Something random to be published. 📬",
    url: "something-random-to-be-published",
  },
  {
    text: "Testing posts scroller! 🍷",
    url: "testing-posts-scroller",
  },
  {
    text: "What do you think about this? 🤔",
    url: "what-do-you-think-about-this",
  },
  {
    text: "Sample content for the scroller test 🥳",
    url: "sample-content-for-the-scroller-test",
  },
  {
    text: "नेपाली युनिकाेड चेक 🥳",
    url: "nepali-unicode-test",
  },
];

interface Props {
  slider?: boolean;
}

function Header({ slider = true }: Props) {
  return (
    <header className="sticky top-0 w-full rounded shadow-md shadow-zinc-500">
      <TopBar />
      <div className="bg-primary-fill-light  shadow-sm shadow-zinc-500">
        <div className="container navigation flex content-center justify-start gap-4 py-1">
          <div className="brand mr-4 px-2 flex">
            <Image
              alt="Logo"
              src="/images/full_code.svg"
              width={128}
              height={128}
            />
          </div>
          <MainNav />
        </div>
      </div>
      {slider && <Slider type="post" content={posts} />}
    </header>
  );
}

export default Header;
