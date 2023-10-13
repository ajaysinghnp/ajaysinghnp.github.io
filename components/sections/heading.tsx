import React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/helper/utils";

interface Props {
  title: string;
}

function Heading({ title }: Props) {
  return (
    <>
      <h1 className={cn("text-zinc-900 dark:text-zinc-300")}>{title}</h1>
      <Separator className="dark:bg-zinc-500" />
    </>
  );
}

export default Heading;
