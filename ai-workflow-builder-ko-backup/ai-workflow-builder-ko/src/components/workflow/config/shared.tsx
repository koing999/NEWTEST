'use client';

import { ReactNode } from 'react';

// ============================================
// 공통 UI 컴포넌트
// ============================================

interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  color?: string;
}

export function SelectField({ label, value, onChange, options, hint, color = 'blue' }: SelectFieldProps) {
  return (
    <FormField label={label} hint={hint}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'password' | 'url';
  hint?: string;
  color?: string;
}

export function TextInput({ label, value, onChange, placeholder, type = 'text', hint, color = 'blue' }: TextInputProps) {
  return (
    <FormField label={label} hint={hint}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500`}
      />
    </FormField>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  color?: string;
  mono?: boolean;
  dark?: boolean;
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, hint, color = 'blue', mono, dark }: TextAreaProps) {
  return (
    <FormField label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500 ${mono ? 'font-mono' : ''} ${dark ? 'bg-gray-900 text-green-400' : ''}`}
      />
    </FormField>
  );
}

interface RangeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
}

export function RangeSlider({ label, value, onChange, min, max, step = 1, minLabel, maxLabel }: RangeSliderProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{minLabel || min}</span>
          <span>{maxLabel || max}</span>
        </div>
      )}
    </div>
  );
}

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      <label htmlFor={id} className="text-sm text-gray-600">{label}</label>
    </div>
  );
}

interface InfoBoxProps {
  color: string;
  icon?: string;
  title: string;
  children: ReactNode;
}

export function InfoBox({ color, icon, title, children }: InfoBoxProps) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    lime: 'bg-lime-50 border-lime-200 text-lime-700',
    fuchsia: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color] || colorClasses.gray}`}>
      <p className="text-xs">
        {icon && <span className="mr-1">{icon}</span>}
        <strong>{title}</strong>
        <br />
        {children}
      </p>
    </div>
  );
}

interface QuickButtonsProps {
  options: { value: number; label: string }[];
  currentValue: number;
  onSelect: (value: number) => void;
  color?: string;
}

export function QuickButtons({ options, currentValue, onSelect, color = 'gray' }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`px-2 py-1 text-xs rounded ${
            currentValue === opt.value
              ? `bg-${color}-500 text-white`
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
