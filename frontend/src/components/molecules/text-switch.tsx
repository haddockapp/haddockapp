import { FC } from "react";
import { Switch } from "../ui/switch";

interface CheckBoxWithTextProps {
  id: string;
  text: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  containerClassName?: string;
}

const SwitchWithText: FC<CheckBoxWithTextProps> = ({
  id,
  text,
  checked,
  onCheckedChange,
  containerClassName,
}) => {
  return (
    <div
      className={`items-center flex space-x-2 align-middle ${containerClassName}`}
    >
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <label htmlFor={id} className="text-sm font-medium">
        {text}
      </label>
    </div>
  );
};

export default SwitchWithText;
