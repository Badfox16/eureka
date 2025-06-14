import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function Loader({ size = "default", className }: LoaderProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClass[size], className)}
    />
  );
}