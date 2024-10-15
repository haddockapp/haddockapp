import { Circle, CircleCheck } from "lucide-react";
import { FC, useMemo } from "react";

interface HaddotProps {
  active?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}
const Haddot: FC<HaddotProps> = ({ active, size = "xs" }) => {
  const color = useMemo(() => (active ? "primary" : "gray-200"), [active]);

  return (
    <span
      className={`text-${size} bg-${color} rounded-full text-${
        active ? "white" : color
      } select-none`}
    >
      {active ? <CircleCheck /> : <Circle />}
    </span>
  );
};

export default Haddot;
