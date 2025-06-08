import React from "react";
import { ButtonProps } from "./type";

const Button = ({
  name,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  color = "blue-500",
}: ButtonProps) => {
  const baseStyles =
    "rounded-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm md:text-base font-medium transition-all duration-300 ease-in-out focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

  const isBlue500 = color === "blue-500";

  const isTailwindColor = isBlue500;

  const getVariantStyles = () => {
    if (variant === "secondary") {
      return "bg-gray-300 text-gray-900 hover:bg-opacity-80 shadow-md hover:shadow-lg py-2! px-3!";
    }

    if (variant === "outline") {
      if (isBlue500) {
        return "border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white focus:ring-blue-500";
      }
      return "border text-white bg-transparent hover:opacity-90";
    }

    // primary
    if (isBlue500) {
      return "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-md hover:shadow-lg";
    }

    return "text-white shadow-md hover:shadow-lg";
  };

  // Enhanced custom styles for non-Tailwind colors
  const customStyle =
    !isTailwindColor && color
      ? {
          backgroundColor:
            variant === "primary" || variant === "secondary"
              ? color
              : "transparent",
          borderColor: variant === "outline" ? color : undefined,
          color: variant === "outline" ? color : "white",
          borderWidth: variant === "outline" ? "1px" : undefined,
          borderStyle: variant === "outline" ? "solid" : undefined,
        }
      : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${getVariantStyles()} ${className}`}
      style={customStyle}
    >
      {name}
    </button>
  );
};

export default Button;
