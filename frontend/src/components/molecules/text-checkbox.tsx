import { FC } from "react";
import { Checkbox } from "../ui/checkbox";

interface CheckBoxWithTextProps {
  id: string;
  text: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  containerClassName?: string;
}

const CheckBoxWithText: FC<CheckBoxWithTextProps> = ({
  id,
  text,
  checked,
  onCheckedChange,
  containerClassName,
}) => {
  return (
    <div className={`items-top flex space-x-2 ${containerClassName}`}>
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <label htmlFor={id} className="text-sm font-medium">
        {text}
      </label>
    </div>
  );
};

export default CheckBoxWithText;
