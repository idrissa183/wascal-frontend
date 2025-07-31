import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 dark:border-gray-600 dark:border-t-primary-400",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const containerVariants = cva("flex flex-col items-center justify-center", {
  variants: {
    fullScreen: {
      true: "fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50",
      false: "py-8 px-4 min-h-[200px]",
    },
    centered: {
      true: "min-h-[calc(100vh-8rem)]",
      false: "",
    },
  },
  defaultVariants: {
    fullScreen: false,
    centered: false,
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
  fullScreen?: boolean;
  centered?: boolean;
  overlay?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      className,
      size,
      text,
      fullScreen = false,
      centered = false,
      overlay = false,
      ...props
    },
    ref
  ) => {
    const containerClass = cn(
      containerVariants({ fullScreen, centered }),
      overlay && "absolute inset-0 bg-white/90 dark:bg-gray-900/90",
      className
    );

    return (
      <div className={containerClass} {...props} ref={ref}>
        <div className="text-center space-y-4">
          {/* Spinner */}
          <div className={cn(spinnerVariants({ size }), "mx-auto")} />

          {/* Texte de chargement */}
          {text && (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium animate-pulse">
                {text}
              </p>
              {/* Points d'animation optionnels */}
              <div className="flex justify-center space-x-1">
                <div
                  className="w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Composant spécialisé pour les pages entières
export const PageLoadingSpinner: React.FC<{
  text?: string;
  size?: VariantProps<typeof spinnerVariants>["size"];
}> = ({ text = "Chargement...", size = "lg" }) => (
  <LoadingSpinner
    size={size}
    text={text}
    fullScreen
    centered
    className="z-50"
  />
);

// Composant spécialisé pour les sections
export const SectionLoadingSpinner: React.FC<{
  text?: string;
  size?: VariantProps<typeof spinnerVariants>["size"];
  overlay?: boolean;
}> = ({ text = "Chargement...", size = "md", overlay = false }) => (
  <LoadingSpinner size={size} text={text} overlay={overlay} className="py-12" />
);

// Composant inline pour les boutons
export const InlineLoadingSpinner: React.FC<{
  size?: VariantProps<typeof spinnerVariants>["size"];
  className?: string;
}> = ({ size = "sm", className }) => (
  <div className={cn(spinnerVariants({ size }), className)} />
);

export { LoadingSpinner, spinnerVariants };
