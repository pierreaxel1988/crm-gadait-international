
import { cn } from "@/lib/utils"
import React from "react"
import LoadingScreen from "../layout/LoadingScreen"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  children?: React.ReactNode;
}

function Skeleton({
  className,
  loading = true,
  children,
  ...props
}: SkeletonProps) {
  if (loading) {
    if (children) {
      return (
        <div className={cn("relative", className)} {...props}>
          <div className="invisible">
            {children}
          </div>
          <div className="absolute inset-0">
            <LoadingScreen fullscreen={false} />
          </div>
        </div>
      )
    }
    
    return (
      <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    )
  }
  
  return <>{children}</>
}

export { Skeleton }
