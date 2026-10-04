import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Camera,
  GitBranch,
  Globe,
  Mail,
  MessageSquare,
  Play,
} from "lucide-react";

interface Props {
  name: string;
  className?: string;
}

const Icon = ({ name, className }: Props) => {
  switch (name) {
    case "facebook":
      return <Globe className={cn("h-4 w-4", className)} />;
    case "instagram":
      return <Camera className={cn("h-4 w-4", className)} />;
    case "twitter":
      return <MessageSquare className={cn("h-4 w-4", className)} />;
    case "email":
      return <Mail className={cn("h-4 w-4", className)} />;
    case "youtube":
      return <Play className={cn("h-4 w-4", className)} />;
    case "github":
      return <GitBranch className={cn("h-4 w-4", className)} />;
    case "linkedin":
      return <BriefcaseBusiness className={cn("h-4 w-4", className)} />;
    default:
      return <GitBranch className={cn("h-4 w-4", className)} />;
  }
};

export default Icon;
