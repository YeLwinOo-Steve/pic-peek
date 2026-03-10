import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center gap-2",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full",
        "bg-gradient-to-r from-[hsl(var(--muted-foreground)/0.15)] via-[hsl(var(--primary)/0.12)] to-[hsl(var(--muted-foreground)/0.15)]",
        "shadow-[inset_0_1px_0_hsl(0,0%,100%/0.6),0_0_0_1px_hsl(var(--border)/0.6)]",
      )}
    >
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary/90 via-primary to-primary/90" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-5 w-5 rounded-full border-2 border-primary/90 bg-background",
        "shadow-[0_0_0_1px_hsl(var(--primary)/0.7),0_6px_10px_hsl(var(--primary)/0.45),inset_0_1px_0_hsl(0,0%,100%/0.9)]",
        "ring-offset-background transition-transform duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "data-[state=active]:scale-[1.02]",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
