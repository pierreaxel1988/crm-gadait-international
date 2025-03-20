
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-futuraMd tracking-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-loro-hazel text-white hover:bg-loro-hazel/90 dark:bg-loro-sand dark:text-loro-navy dark:hover:bg-loro-sand/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-loro-hazel underline-offset-4 hover:underline",
        admin: "bg-[#F3EFE2] text-[#8B6F4E] hover:bg-[#EAE4D3] font-futuraMd text-xs tracking-wide uppercase",
        action: "bg-[#006837] text-white hover:bg-[#005a2f] font-futuraMd",
        task: "bg-[#006837] text-white hover:bg-[#005a2f] font-futuraMd rounded-full",
        invite: "border border-[#B8860B] text-[#B8860B] bg-white hover:bg-[#F3EFE2] font-futuraMd",
        danger: "bg-[#DC3545] text-white hover:bg-[#bb2d3b] font-futuraMd",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-5 text-base",
        icon: "h-10 w-10",
        badge: "h-7 px-3 py-0.5 text-xs",
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
