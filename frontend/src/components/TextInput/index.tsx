import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-200">Original text</label>
      <textarea
        className="min-h-[160px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        placeholder="Paste your message here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInput;

