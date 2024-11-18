import { FC } from "react";

interface StepTitleProps {
  step: number;
  total: number;
  title: string;
}
const StepTitle: FC<StepTitleProps> = ({ step, title, total }) => (
  <div className="select-none justify-center flex items-center space-x-2">
    <h1 className="text-primary">
      <span className="text-3xl">{step}</span>
      <span className="text-2xl">/{total}</span>
    </h1>
    <h1 className="text-xs">●</h1>
    <h1 className="text-4xl">{title}</h1>
  </div>
);

export default StepTitle;
