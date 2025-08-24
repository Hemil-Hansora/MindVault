"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',

        // 🔗 Links
        '[&_a]:text-accent [&_a:hover]:underline',

        // 🟦 Inline code
        '[&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1 [&_code]:py-0.5',

        // 🟦 Code blocks (<pre>)
        '[&_pre]:bg-secondary [&_pre]:text-foreground/45 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto',

        // 🟦 Remove inner white <code> background inside <pre>
        '[&_pre_code]:bg-transparent [&_pre_code]:text-inherit',

        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
