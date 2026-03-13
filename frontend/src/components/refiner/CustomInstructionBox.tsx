import React from 'react';

interface CustomInstructionBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomInstructionBox: React.FC<CustomInstructionBoxProps> = ({
  value,
  onChange,
  placeholder = 'e.g. Make it suitable for a stand-up update and mention blockers.',
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-300">Custom instruction</label>
      <textarea
        className="min-h-[72px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default CustomInstructionBox;
