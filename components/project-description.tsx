import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGemoji from "remark-gemoji";

interface ProjectDescriptionProps {
  children: string;
  className?: string;
}

export function ProjectDescription({ children, className }: ProjectDescriptionProps) {
  return (
    <div className={`project-description ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkGemoji]}>{children}</ReactMarkdown>
    </div>
  );
}
