import React, { useEffect, useRef, useState } from "react";

const AutocompleteSelect = ({
  label,
  value,
  onChange,
  options = [],
  getOptionLabel = (opt) => opt.label,
  getOptionValue = (opt) => opt.value,
  name,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sincroniza input con value externo
  useEffect(() => {
    const selected = options.find((opt) => getOptionValue(opt) === value);
    setInputValue(selected ? getOptionLabel(selected) : "");
  }, [value, options]);

  // Filtra opciones dinámicamente
  useEffect(() => {
    if (inputValue === "") {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((opt) =>
          getOptionLabel(opt).toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, options]);

  // Cierra dropdown si clic fuera de input o dropdown, pero no si clic dentro del dropdown (incluido scroll)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !inputRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Maneja selección de opción
  const handleSelect = (opt) => {
    onChange(getOptionValue(opt));
    setInputValue(getOptionLabel(opt));
    setShowDropdown(false);
  };

  // Al enfocar input, muestra dropdown
  const handleFocus = () => {
    setShowDropdown(true);
  };

  // Controla blur para evitar cerrar cuando se hace scroll o clic dentro del dropdown
  const handleBlur = (e) => {
    // Espera a que se complete el click o foco
    setTimeout(() => {
      const active = document.activeElement;
      if (
        active !== inputRef.current &&
        !dropdownRef.current?.contains(active)
      ) {
        setShowDropdown(false);
      }
    }, 150);
  };

  return (
    <label className="block mb-4 font-semibold" htmlFor={name}>
      {label}
      <div className="relative">
        <input
          id={name}
          name={name}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={`Buscar ${label.toLowerCase()}...`}
          autoComplete="off"
          className={`w-full px-3 py-2 border rounded mt-1
            bg-white text-black border-gray-300
            dark:bg-gray-700 dark:text-white dark:border-gray-600
          `}
          required={required}
        />
        {showDropdown && filteredOptions.length > 0 && (
          <ul
            ref={dropdownRef}
            tabIndex={-1} // Para manejar blur correctamente
            className={`absolute z-10 w-full max-h-48 overflow-y-auto border rounded shadow
              bg-white text-black dark:bg-gray-800 dark:text-white
            `}
            // No cerrar dropdown al hacer scroll, solo fuera de dropdown/input
          >
            {filteredOptions.map((opt, idx) => (
              <li
                key={idx}
                onPointerDown={(e) => {
                  // onPointerDown para evitar blur antes de la selección
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer select-none"
              >
                {getOptionLabel(opt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
};

export default AutocompleteSelect;
