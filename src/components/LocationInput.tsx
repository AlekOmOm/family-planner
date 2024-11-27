import { useEffect, useRef, useState } from 'react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  className?: string;
  required?: boolean;
}

export function LocationInput({ value, onChange, id, className, required }: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only trigger onChange if the input has 3 or more characters
    if (newValue.length >= 3) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Update the final value on blur
    onChange(inputValue);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      required={required}
      placeholder="Enter location..."
    />
  );
}