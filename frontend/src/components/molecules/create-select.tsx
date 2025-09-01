import { FC } from "react";
import CreatableSelect from "react-select/creatable";

const selectStyles = {
  control: (provided: object) => ({
    ...provided,
    border: "1px solid hsl(var(--border))",
    ":hover": {
      borderColor: "hsl(var(--primary))",
    },
    backgroundColor: "transparent",
    cursor: "text",
  }),
  option: (provided: object) => ({
    ...provided,
    transition: "background-color 0.3s ease",
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
  menu: (provided: object) => ({
    ...provided,
    backgroundColor: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
  }),
};
const components = {
  DropdownIndicator: null,
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
    onChange({ label: newValue, value: newValue, __isNew__: true });
  }

  return (
    <CreatableSelect
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "hsla(var(--primary)/50%)",
          primary25: "hsla(var(--primary)/10%)",
          primary50: "hsla(var(--primary)/20%)",
          primary75: "hsla(var(--primary)/30%)",
          neutral0: "hsl(var(--typography))",
          neutral5: "hsl(var(--typography)/25%)",
          neutral10: "hsl(var(--typography)/50%)",
          neutral20: "hsl(var(--typography)/75%)",
          neutral30: "hsl(var(--typography)/100%)",
          neutral40: "hsl(var(--typography)/100%)",
          neutral50: "hsl(var(--typography)/100%)",
          neutral60: "hsl(var(--typography)/100%)",
          neutral70: "hsl(var(--typography)/100%)",
          neutral80: "hsl(var(--typography)/100%)",
          neutral90: "hsl(var(--typography)/100%)",
        },
      })}
      {...(isSelect
        ? {
            ...props,
            styles: selectStyles,
            onChange: (v) => onChange(v as Option),
            value,
          }
        : {
            styles: selectStyles,
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
