// src/components/StatBox.tsx
import React from 'react';

interface StatBoxProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value, valueColor = 'text-primary' }) => {
  return (
    <div className="bg-black/30 rounded-lg p-4 text-center transition-all duration-300 hover:bg-primary/20 hover:-translate-y-1">
      <div className="text-sm text-light/80 mb-1">{label}</div>
      <div className={`text-lg font-bold ${valueColor}`}>{value}</div>
    </div>
  );
};