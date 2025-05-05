
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-[#FFDEE2] text-rose-700 hover:bg-[#FFDEE2]/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]/80",
      },
      weight: {
        normal: "font-normal",
        semibold: "font-semibold",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
      }
    },
    defaultVariants: {
      variant: "default",
      weight: "semibold",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, weight, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, weight, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
