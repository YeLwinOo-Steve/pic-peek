import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[1px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[hsl(14,78%,60%)] to-[hsl(14,78%,46%)] text-primary-foreground shadow-[0_4px_0_0_hsl(14,78%,38%),0_6px_12px_-2px_hsl(14,78%,30%/0.4),inset_0_1px_1px_hsl(0,0%,100%/0.25)] hover:from-[hsl(14,78%,63%)] hover:to-[hsl(14,78%,49%)]",
        destructive:
          "bg-gradient-to-b from-[hsl(0,70%,58%)] to-[hsl(0,70%,48%)] text-destructive-foreground shadow-[0_4px_0_0_hsl(0,70%,38%),0_6px_12px_-2px_hsl(0,70%,30%/0.4),inset_0_1px_1px_hsl(0,0%,100%/0.25)] hover:from-[hsl(0,70%,62%)] hover:to-[hsl(0,70%,52%)]",
        outline:
          "border border-border bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))] text-foreground shadow-[0_3px_0_0_hsl(var(--border)),0_4px_8px_-2px_hsl(var(--foreground)/0.1),inset_0_1px_1px_hsl(0,0%,100%/0.6)] hover:from-[hsl(var(--background))] hover:to-[hsl(var(--muted))]",
        secondary:
          "bg-gradient-to-b from-[hsl(40,7%,18%)] to-[hsl(40,7%,8%)] text-secondary-foreground shadow-[0_4px_0_0_hsl(40,7%,4%),0_6px_12px_-2px_hsl(40,7%,4%/0.5),inset_0_1px_1px_hsl(0,0%,100%/0.1)] hover:from-[hsl(40,7%,22%)] hover:to-[hsl(40,7%,12%)]",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
