import { FC } from "react";
import ReactSelect from "react-select";

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
    color: "hsl(var(--typography)/50%)",
    cursor: "text",
  }),
  menu: (provided: object) => ({
    ...provided,
    backgroundColor: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
  }),
};

interface Option {
  readonly label: React.ReactNode;
  readonly value: string;
}

const Select: FC<{
  isLoading?: boolean;
  options: Option[];
  isDisabled?: boolean;
  placeholder?: string;
}> = ({ ...props }) => (
  <ReactSelect
    {...props}
    isDisabled={props.isDisabled}
    placeholder={props.placeholder ?? "Select..."}
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
    styles={selectStyles}
  />
);

export default Select;
