import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-emerald-400 text-white shadow hover:bg-emerald-500 rounded-full",
        ghost: "border border-emerald-400 text-emerald-600 hover:bg-emerald-50 rounded-full",
        secondary: "bg-[#F4F4F1] text-[#111210] hover:bg-[#E8E8E3] rounded-full",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 rounded-full",
        outline: "border border-[#E8E8E3] bg-white shadow-sm hover:bg-[#F4F4F1] rounded-xl",
        link: "text-emerald-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8 text-base",
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

export { Button, buttonVariants };
