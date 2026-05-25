"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-border font-mono text-xs uppercase tracking-widest shadow-none outline-none select-none transition-[background,opacity,color,border-color] duration-150 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-none disabled:border-border disabled:bg-foreground/[0.06] disabled:text-foreground/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background hover:opacity-90 active:opacity-80",
        violet:
          "border-transparent bg-linear-to-r from-violet-500 to-violet-600 text-white hover:from-violet-400 hover:to-violet-500 active:opacity-90",
        outline:
          "border-foreground/20 bg-foreground/[0.05] text-foreground hover:border-foreground/40 hover:bg-foreground/[0.1] active:opacity-90",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground active:opacity-90",
        destructive:
          "border-transparent bg-linear-to-r from-red-500/90 to-red-600/90 text-white hover:from-red-400 hover:to-red-500 active:opacity-90",
      },
      size: {
        default: "h-10 gap-2 px-5",
        sm: "h-8 gap-1.5 px-4 text-[10px]",
        lg: "h-11 gap-2.5 px-6 text-[11px]",
        pill: "h-10 gap-2 px-6 text-[11px]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
