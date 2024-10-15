import { FC } from "react";
import Haddot from "../atoms/haddot";

interface StepdotsProps {
  step: number;
  total: number;
}
const Stepdots: FC<StepdotsProps> = ({ step, total }) => (
  <div className="select-none flex space-x-1 justify-center">
    {Array.from({ length: total }, (_, idx) => idx).map((i) => (
      <Haddot completed={i < step} active={i === step} />
    ))}
  </div>
);

export default Stepdots;
