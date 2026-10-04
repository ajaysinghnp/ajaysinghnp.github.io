import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const Circle = ({ className }: Props) => {
  return <div className={cn("h-12 w-12 rounded-full bg-purple-500/60", className)} />;
};
