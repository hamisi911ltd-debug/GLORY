import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        primary: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        secondary: "bg-white text-foreground border border-border shadow-xs hover:bg-surface-2",
        ghost: "text-brand-blue hover:bg-brand-blue-light",
        destructive: "bg-danger text-danger-foreground shadow-sm hover:bg-danger/90",
        outline: "border border-border bg-background hover:bg-surface-2 text-foreground",
        "outline-brand": "border-2 border-brand text-brand hover:bg-brand-light",
        hero: "bg-brand text-brand-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-brand/95",
        "hero-outline": "border-2 border-white/80 text-white hover:bg-white hover:text-navy backdrop-blur",
        link: "text-brand-blue underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
