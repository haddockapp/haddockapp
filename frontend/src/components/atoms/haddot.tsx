import { Circle, CircleCheck } from "lucide-react";
import { FC, useMemo } from "react";

interface HaddotProps {
  completed?: boolean;
  active?: boolean;
  size?: number;
}
const Haddot: FC<HaddotProps> = ({ completed, active, size = 20 }) => {
  const color = useMemo(
    () => (active || completed ? "primary" : "gray-200"),
    [active, completed]
  );

  return (
    <span
      className={`bg-${color} rounded-full text-${
        active || completed ? "white" : color
      } select-none`}
    >
      {completed ? <CircleCheck size={size} /> : <Circle size={size} />}
    </span>
  );
};

export default Haddot;
