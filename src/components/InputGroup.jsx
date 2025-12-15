import React from "react";
import { HelpCircle } from "lucide-react";

const InputGroup = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  tooltip = null,
  validate = true,
}) => (
  <div className="flex flex-col gap-1 relative group">
    <div className="flex items-center gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1 flex items-center gap-1">
        {label}
        {tooltip && (
          <HelpCircle size={12} className="text-emerald-500 cursor-help" />
        )}
      </label>

      {/* Tooltip Flotante */}
      {tooltip && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-max px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
          {tooltip}
          {/* Triangulito abajo */}
          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
    {
      // si es textarea renderizo un textarea
      type === "textarea" ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={`w-full px-3 py-2.5 border ${
            validate
              ? value == ""
                ? "border-red-400"
                : "border-gray-300"
              : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white shadow-sm text-sm resize-y`}
          placeholder="..."
          rows={4}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={`w-full px-3 py-2.5 border ${
            validate
              ? value == ""
                ? "border-red-400"
                : "border-gray-300"
              : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white shadow-sm text-sm`}
          placeholder="..."
        />
      )
    }
  </div>
);

export default InputGroup;
