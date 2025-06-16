import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

interface LinkProps extends React.ComponentPropsWithoutRef<typeof NextLink> {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  asButton?: boolean;
  className?: string;
}

export function Link({
  href,
  variant,
  size,
  asButton = false,
  className,
  children,
  ...props
}: LinkProps) {
  return (
    <NextLink
      href={href}
      className={
        asButton
          ? cn(buttonVariants({ variant, size }), className)
          : cn(className)
      }
      {...props}
    >
      {children}
    </NextLink>
  );
}