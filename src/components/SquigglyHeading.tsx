
import React from "react";
import { cn } from "@/lib/utils";

interface SquigglyHeadingProps {
  children: React.ReactNode;
  className?: string;
  colors?: string;
}

const SquigglyHeading: React.FC<SquigglyHeadingProps> = ({ 
  children, 
  className,
  colors = "from-draw-pink via-draw-turquoise to-draw-yellow"
}) => {
  return (
    <div className={cn("squiggle-border", colors)}>
      <h1 className={cn("font-bold text-2xl text-center", className)}>
        {children}
      </h1>
    </div>
  );
};

export default SquigglyHeading;
