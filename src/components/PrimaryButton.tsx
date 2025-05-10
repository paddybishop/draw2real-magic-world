
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: "pink" | "turquoise" | "purple" | "yellow";
  size?: "small" | "medium" | "large";
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  color = "pink",
  size = "medium",
  className,
  ...props
}) => {
  const [sparkles, setSparkles] = useState<{ id: number; left: string; top: string }[]>([]);
  
  const bgColorMap = {
    pink: "bg-draw-pink",
    turquoise: "bg-draw-turquoise",
    purple: "bg-draw-purple",
    yellow: "bg-draw-yellow",
  };
  
  const sizeMap = {
    small: "py-2 px-4 text-sm",
    medium: "py-3 px-6 text-base",
    large: "py-4 px-8 text-lg",
  };

  const createSparkles = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Create 5 sparkles at random positions within the button
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`
    }));

    setSparkles(newSparkles);
    
    // Remove sparkles after animation
    setTimeout(() => {
      setSparkles([]);
    }, 2000);
  };

  return (
    <button
      className={cn(
        "relative rounded-full font-semibold shadow-lg",
        "hover:shadow-xl transition-all duration-300 active:scale-95 hover:-translate-y-1 focus:outline-none",
        "overflow-hidden text-white",
        bgColorMap[color],
        sizeMap[size],
        className
      )}
      onClick={createSparkles}
      {...props}
    >
      {children}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{ left: sparkle.left, top: sparkle.top }}
        />
      ))}
    </button>
  );
};

export default PrimaryButton;
