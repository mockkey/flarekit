import { cn } from "@flarekit/ui/lib/utils";
import { MDXProvider } from "@mdx-js/react";
import type { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router";
import { ApiEndpoint } from "./ApiEndpoint";
import { CodeBlock } from "./CodeBlock";
import { ParamTable } from "./ParamTable";
import { ResponseExample } from "./ResponseExample";
import { SwaggerUIComponent } from "./SwaggerUI";

export const components = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => {
    const { children, ...rest } = props;
    return (
      <h1
        {...rest}
        className={cn("text-3xl text-pale-yellow mt-8 mb-6", props.className)}
      >
        {children}
      </h1>
    );
  },

  h2: (props: ComponentPropsWithoutRef<"h2">) => {
    const { children, ...rest } = props;
    return (
      <h2
        {...rest}
        className={cn("text-2xl text-pale-yellow mt-8 mb-6", props.className)}
      >
        {children}
      </h2>
    );
  },

  h3: (props: ComponentPropsWithoutRef<"h3">) => {
    const { children, ...rest } = props;
    return (
      <h3
        {...rest}
        className={cn("text-xl text-pale-yellow mt-8 mb-6", props.className)}
      >
        {children}
      </h3>
    );
  },

  h4: (props: ComponentPropsWithoutRef<"h4">) => {
    const { children, ...rest } = props;
    return (
      <h4
        {...rest}
        className={cn("text-lg text-pale-yellow mt-8 mb-6", props.className)}
      >
        {children}
      </h4>
    );
  },

  h5: (props: ComponentPropsWithoutRef<"h5">) => {
    const { children, ...rest } = props;
    return (
      <h5
        {...rest}
        className={cn("text-base text-pale-yellow mt-8 mb-6", props.className)}
      >
        {children}
      </h5>
    );
  },

  h6: (props: ComponentPropsWithoutRef<"h6">) => {
    const { children, ...rest } = props;
    return (
      <h6
        {...rest}
        className={cn("text-base text-pale-yellow mt-8 mb-6", props.className)}
      >
        {children}
      </h6>
    );
  },

  p: (props: ComponentPropsWithoutRef<"p">) => {
    const { children, ...rest } = props;
    return (
      <p
        {...rest}
        className={cn(
          "my-4 font-light [&>code]:text-pale-green",
          props.className,
        )}
      >
        {children}
      </p>
    );
  },

  a: (props: ComponentPropsWithoutRef<"a">) => {
    const { children, ...rest } = props;
    return (
      <span>
        {props.href ? (
          <Link
            to={props.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("text-pale-blue font-medium", props.className)}
            {...rest}
          >
            {children}
          </Link>
        ) : (
          <a
            {...rest}
            className={cn("text-pale-blue font-medium", props.className)}
          >
            {children}
          </a>
        )}
      </span>
    );
  },

  li: (props: ComponentPropsWithoutRef<"li">) => {
    const { children, ...rest } = props;
    return (
      <li {...rest} className={cn("my-2 font-light", props.className)}>
        {children}
      </li>
    );
  },

  ol: (props: ComponentPropsWithoutRef<"ol">) => {
    const { children, ...rest } = props;
    return (
      <ol
        {...rest}
        className={cn("my-3 list-decimal list-inside", props.className)}
      >
        {children}
      </ol>
    );
  },

  ul: (props: ComponentPropsWithoutRef<"ul">) => {
    const { children, ...rest } = props;
    return (
      <ul
        {...rest}
        className={cn("my-3 list-disc list-inside", props.className)}
      >
        {children}
      </ul>
    );
  },

  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => {
    const { children, ...rest } = props;
    return (
      <blockquote {...rest} className={cn("pl-4 italic", props.className)}>
        {children}
      </blockquote>
    );
  },

  pre: CodeBlock,

  table: (props: ComponentPropsWithoutRef<"table">) => {
    const { children, ...rest } = props;
    return (
      <div className="my-6 w-full overflow-x-auto">
        <table
          {...rest}
          className={cn("w-full border-collapse", props.className)}
        >
          {children}
        </table>
      </div>
    );
  },

  thead: (props: ComponentPropsWithoutRef<"thead">) => {
    const { children, ...rest } = props;
    return (
      <thead {...rest} className={cn("bg-muted/50", props.className)}>
        {children}
      </thead>
    );
  },

  tbody: (props: ComponentPropsWithoutRef<"tbody">) => {
    const { children, ...rest } = props;
    return (
      <tbody
        {...rest}
        className={cn("divide-y divide-border", props.className)}
      >
        {children}
      </tbody>
    );
  },

  tr: (props: ComponentPropsWithoutRef<"tr">) => {
    const { children, ...rest } = props;
    return (
      <tr {...rest} className={cn("hover:bg-muted/50", props.className)}>
        {children}
      </tr>
    );
  },

  th: (props: ComponentPropsWithoutRef<"th">) => {
    const { children, ...rest } = props;
    return (
      <th
        {...rest}
        className={cn(
          "border border-border px-4 py-2 text-left font-medium text-sm",
          props.className,
        )}
      >
        {children}
      </th>
    );
  },

  td: (props: ComponentPropsWithoutRef<"td">) => {
    const { children, ...rest } = props;
    return (
      <td
        {...rest}
        className={cn(
          "border border-border px-4 py-2 text-left text-sm",
          props.className,
        )}
      >
        {children}
      </td>
    );
  },

  ApiEndpoint,
  ParamTable,
  ResponseExample,
  SwaggerUIComponent,
  code: ({ children, className }: { children: string; className?: string }) => {
    return <code className={className}>{children}</code>;
  },
};

export function MDXProviderWrapper({
  children,
}: { children: React.ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
