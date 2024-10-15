import { FC } from "react";

interface HaddotProps {
  active?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}
const Haddot: FC<HaddotProps> = ({ active, size = "xs" }) => (
  <span
    className={`text-${size} text-${
      active ? "primary" : "gray-200"
    } select-none`}
  >
    ●
  </span>
);

export default Haddot;
