export interface ButtonProps {
  name: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  color?: string; // Tailwind class (e.g. 'blue-500') or custom hex/RGB/oklch
}
