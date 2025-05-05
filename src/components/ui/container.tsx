
import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div
      className={cn(
        "max-w-[1100px] mx-auto px-6 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
