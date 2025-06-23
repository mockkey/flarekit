import { cn } from "@flarekit/ui/lib/utils";
import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

interface CodeElement {
  props: {
    children: string;
  };
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const language = className?.match(/language-(\w+)/)?.[1];

  // Get the code content from the code element
  const codeContent =
    typeof children === "string"
      ? children
      : (children as CodeElement)?.props?.children || "";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre
        className={cn(
          "relative rounded-lg bg-muted p-4 overflow-x-auto",
          className,
        )}
      >
        <code className={cn("text-sm", language && `language-${language}`)}>
          {children}
        </code>
      </pre>
      <button
        type="button"
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
