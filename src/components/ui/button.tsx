
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-gadait text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-louisvuitton",
  {
    variants: {
      variant: {
        default: "bg-gadait-primary text-white hover:bg-gadait-primary/90 shadow-sm hover:shadow-gadait-hover",
        destructive:
          "bg-gadait-error text-white hover:bg-gadait-error/90",
        outline:
          "border border-gadait-border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-gadait-secondary text-white hover:bg-gadait-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-gadait-primary underline-offset-4 hover:underline",
        success: "bg-gadait-success text-white hover:bg-gadait-success/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-gadait px-3",
        lg: "h-11 rounded-gadait px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
