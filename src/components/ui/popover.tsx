import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    showArrow?: boolean;
    side?: "top" | "right" | "bottom" | "left";
  }
>(({ className, align = "center", sideOffset = 4, showArrow, side = "bottom", children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "relative overflow-visible",
        className,
      )}
      {...props}
    >
      {showArrow && side === "bottom" && (
        <div
          className={cn(
            "absolute z-10 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent -top-[6px] [border-bottom-color:hsl(var(--popover))] drop-shadow-[0_-1px_0_hsl(var(--border))]",
            align === "end" && "right-4 left-auto translate-x-0",
            align === "start" && "left-4 right-auto translate-x-0",
            align === "center" && "left-1/2 -translate-x-1/2",
          )}
          aria-hidden
        />
      )}
      {showArrow && side === "top" && (
        <div
          className={cn(
            "absolute z-10 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent -bottom-[6px] [border-top-color:hsl(var(--popover))] drop-shadow-[0_1px_0_hsl(var(--border))]",
            align === "end" && "right-4 left-auto translate-x-0",
            align === "start" && "left-4 right-auto translate-x-0",
            align === "center" && "left-1/2 -translate-x-1/2",
          )}
          aria-hidden
        />
      )}
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
