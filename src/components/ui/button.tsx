import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[1px] active:shadow-[0_2px_0_0_hsl(0,0%,0%/0.35)]",
  {
    variants: {
      variant: {
        default:
          // Warm primary, bright rim, slightly darker center for 3D feel
          "bg-gradient-to-b from-[hsl(14,78%,64%)] via-[hsl(14,78%,55%)] to-[hsl(14,78%,44%)] text-primary-foreground shadow-[0_4px_0_0_hsl(14,78%,34%),0_8px_18px_-4px_hsl(14,78%,28%/0.55),inset_0_1px_0_hsl(0,0%,100%/0.7),inset_0_-1px_0_hsl(14,78%,40%)] hover:from-[hsl(14,78%,68%)] hover:via-[hsl(14,78%,59%)] hover:to-[hsl(14,78%,48%)]",
        destructive:
          "bg-gradient-to-b from-[hsl(0,70%,62%)] via-[hsl(0,70%,54%)] to-[hsl(0,70%,44%)] text-destructive-foreground shadow-[0_4px_0_0_hsl(0,70%,34%),0_8px_18px_-4px_hsl(0,70%,28%/0.55),inset_0_1px_0_hsl(0,0%,100%/0.7),inset_0_-1px_0_hsl(0,70%,40%)] hover:from-[hsl(0,70%,66%)] hover:via-[hsl(0,70%,58%)] hover:to-[hsl(0,70%,48%)]",
        outline:
          "border border-border bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--background))] to-[hsl(var(--background)/0.96)] text-foreground shadow-[0_3px_0_0_hsl(var(--border)),0_6px_14px_-4px_hsl(var(--foreground)/0.18),inset_0_1px_0_hsl(0,0%,100%/0.7),inset_0_-1px_0_hsl(var(--border)/0.7)] hover:from-[hsl(var(--background))] hover:via-[hsl(var(--background))] hover:to-[hsl(var(--muted))]",
        secondary:
          "bg-gradient-to-b from-[hsl(40,7%,24%)] via-[hsl(40,7%,16%)] to-[hsl(40,7%,8%)] text-secondary-foreground shadow-[0_4px_0_0_hsl(40,7%,4%),0_8px_18px_-4px_hsl(40,7%,4%/0.65),inset_0_1px_0_hsl(0,0%,100%/0.2),inset_0_-1px_0_hsl(40,7%,6%)] hover:from-[hsl(40,7%,28%)] hover:via-[hsl(40,7%,20%)] hover:to-[hsl(40,7%,12%)]",
        ghost:
          "border border-transparent bg-gradient-to-b from-transparent via-transparent to-transparent text-foreground hover:from-[hsl(var(--accent)/0.65)] hover:via-[hsl(var(--accent)/0.4)] hover:to-[hsl(var(--accent)/0.2)] hover:text-accent-foreground shadow-[inset_0_1px_0_hsl(0,0%,100%/0.45)] rounded-full",
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
