import React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: "bottom" | "top" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "bottom", // La position par défaut est bien "bottom"
  className,
  ...props
}) => {
  // Classes de positionnement basées sur la prop `position`
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className={cn("relative group", className)} {...props}>
      {/* L'élément enfant sur lequel l'infobulle s'applique */}
      {children}
      {/* L'infobulle elle-même, cachée par défaut */}
      <div
        className={cn(
          // Styles de base de l'infobulle
          "absolute z-50 w-max max-w-xs px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm dark:bg-gray-700",
          // Logique d'affichage au survol (hover)
          "invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity",
          // Application des classes de position
          positionClasses[position]
        )}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
};
