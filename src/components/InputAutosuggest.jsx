import React from 'react';

const InputAutosuggest = ({ label, name, value, onChange, type = "text", tooltip = null }) => (
  <div className="flex flex-col gap-1 relative group">
    <div className="flex items-center gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1 flex items-center gap-1">
        {label}
        {tooltip && <HelpCircle size={12} className="text-emerald-500 cursor-help" />}
      </label>
    </div>
    
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-white shadow-sm text-sm"
      placeholder="..."
    />
  </div>
);

export default InputAutosuggest;