import { FC } from "react";
import CreatableSelect from "react-select/creatable";

const components = {
  DropdownIndicator: null,
};

const styles = {
  control: (provided: object) => ({
    ...provided,
    cursor: "text",
  }),
  option: (provided: object) => ({
    ...provided,
    cursor: "text",
  }),
  input: (provided: object) => ({
    ...provided,
    cursor: "text",
  }),
  placeholder: (provided: object) => ({
    ...provided,
    cursor: "text",
  }),
};

interface Option {
  readonly label: string;
  readonly value: string;
  readonly __isNew__?: boolean;
}

type CreateSelectProps = {
  isSelect?: boolean;
  onChange: (v: Option) => void;
  value?: Option;
  isLoading?: boolean;
  options?: Option[];
  isDisabled?: boolean;
};

const CreateSelect: FC<CreateSelectProps> = ({
  isSelect,
  onChange,
  value,
  ...props
}) => {
  function handleChange(newValue: string) {
    onChange({
      label: newValue,
      value: newValue,
      __isNew__: true,
    });
  }

  return (
    <CreatableSelect
      {...(isSelect
        ? {
            ...props,
            onChange: (v) => onChange(v as Option),
            value,
          }
        : {
            styles,
            components,
            menuIsOpen: false,
            onInputChange: (v) => handleChange(v),
            inputValue: value?.value ?? "",
            escapeClearsValue: false,
            onMenuClose: () => handleChange(value?.value ?? ""),
            onChange: (v) => handleChange((v as Option).value),
            value,
          })}
    />
  );
};

export default CreateSelect;
