import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        shine:
          "bg-primary text-primary-foreground before:absolute before:inset-0 before:-z-10 before:bg-primary after:absolute after:top-0 after:-left-[75%] after:z-10 after:block after:h-full after:w-1/2 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:skew-x-[-25deg] after:animate-shine",
        default:
          "border border-primary duration-300 dark:bg-primary/70 dark:hover:bg-primary/80 bg-primary text-primary-foreground shadow hover:bg-primary/90 shadow-md",
        destructive:
          "border border-destructive duration-300 dark:bg-destructive/70 dark:hover:bg-destructive/80 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border border-secondary bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "duration-500 hover:bg-primary/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "border border-card-foreground bg-dark text-white shadow hover:bg-dark/90 dark:bg-card dark:hover:bg-card-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
