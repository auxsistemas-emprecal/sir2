import React, { useState, useEffect } from "react";
import Downshift from "downshift";
import { HelpCircle } from "lucide-react";

function InputAutosuggest({
  label,
  name,
  value,
  onChange,
  type = "text",
  tooltip = null,
  validate = true,
  searchEndpoint,
  textSuggestor = "nombre",
  itemsKeys = "id_tercero",
}) {
  const [tercerosSuggest, setTercerosSuggest] = useState([]);

  const searchValues = async (query = "") => {
    return await searchEndpoint(query);
  };

  useEffect(() => {
    (async () => {
      const temporal = await searchEndpoint("");
      setTercerosSuggest(temporal);
    })();
  }, []);

  const handleSelection = (e = "") => {
    if (!e) return;

    onChange({
      target: {
        name,
        value: e.nombre,
        type: "text",
        checked: false,
        completeObject: e,
      },
    });
  };

  return (
    <div className="flex flex-col gap-1 relative group w-full">
      <div className="flex items-center gap-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1 flex items-center gap-1">
          {label}
          {tooltip && (
            <HelpCircle size={12} className="text-emerald-500 cursor-help" />
          )}
        </label>
      </div>

      <Downshift
        itemToString={(item) => (item ? item[textSuggestor] : "")}
        onChange={handleSelection}
        onInputValueChange={(val) => {
          onChange({
            target: {
              name,
              value: val,
              type: "text",
              checked: false,
              completeObject: val,
            },
          });
        }}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          selectedItem,
          getRootProps,
        }) => (
          <div className="relative">
            <div {...getRootProps({}, { suppressRefError: true })}>
              <input
                {...getInputProps()}
                value={value ?? inputValue}
                className={`w-full px-3 py-2.5 text-sm text-gray-700 bg-white
                  border rounded-lg shadow-sm transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                  ${
                    validate
                      ? value == ""
                        ? "border-red-400 focus:ring-red-200"
                        : "border-gray-300"
                      : "border-gray-300"
                  }
                `}
              />
            </div>

            <ul
              {...getMenuProps()}
              className={`absolute z-50 w-full mt-1 bg-white border border-gray-100 
                rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-x-hidden
                ${isOpen ? "block" : "hidden"}
              `}
            >
              {isOpen &&
                tercerosSuggest
                  .filter(
                    (item) =>
                      !inputValue ||
                      item[textSuggestor]
                        ?.toUpperCase()
                        .includes(inputValue.toUpperCase())
                  )
                  .map((item, index) => (
                    <li
                      key={item[itemsKeys]}
                      {...getItemProps({
                        index,
                        item,
                        className: `
                          px-4 py-2 text-sm cursor-pointer border-b border-gray-50 last:border-0
                          transition-colors duration-150
                          ${
                            highlightedIndex === index
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }
                          ${
                            selectedItem === item
                              ? "font-bold bg-emerald-100/50 text-emerald-800"
                              : ""
                          }
                        `,
                      })}
                    >
                      <div className="flex justify-between items-center">
                        <span>{item[textSuggestor]}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.placa ?? ""}
                        </span>
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        )}
      </Downshift>
    </div>
  );
}

export default InputAutosuggest;
