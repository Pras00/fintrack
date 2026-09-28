import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-rose-700",
        outline:
          "border border-border/80 bg-background hover:bg-muted/70 hover:text-foreground text-foreground",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80 border border-border/60",
        ghost: "hover:bg-muted hover:text-foreground text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        teal:
          "bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-xs",
        rose:
          "bg-[#E11D48] text-white hover:bg-[#BE123C] shadow-xs",
      },
      size: {
        default: "h-10 rounded-xl px-4.5 py-2.5 text-xs font-semibold",
        sm: "h-9 rounded-xl px-3.5 py-2 text-xs font-semibold",
        lg: "h-11 rounded-xl px-6 text-sm font-semibold",
        icon: "h-10 w-10 rounded-xl",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
