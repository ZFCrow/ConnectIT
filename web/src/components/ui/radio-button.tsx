import * as React from "react"

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, name, value, checked, onChange }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="cursor-pointer"
      />
      {label}
    </label>
  );
};

export { 
    RadioButton
 }