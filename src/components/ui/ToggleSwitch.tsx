import { useState } from "react";

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function ToggleSwitch({ isOn, onToggle }: ToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <>
      <label className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            onClick={onToggle}
            type="checkbox"
            checked={isOn}
            onChange={handleCheckboxChange}
            className="sr-only"
          />
          <div
            className={`box block h-6 w-10 rounded-full ${
              isOn ? "bg-teal-600" : "bg-black"
            }`}
          ></div>
          <div
            className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
              isOn ? "translate-x-full" : ""
            }`}
          ></div>
        </div>
      </label>
    </>
  );
}
