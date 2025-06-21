// src/components/Card.tsx
import React, { type ReactNode } from 'react';

interface CardProps {
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`
      bg-gray-dark/60 border border-border rounded-xl p-6 shadow-xl
      backdrop-blur-lg transition-transform duration-300 hover:-translate-y-1
      ${className}
    `}>
      <div className="flex items-center gap-4 pb-4 mb-4 border-b border-border">
        <i className={`${icon} text-2xl bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text`}></i>
        <h2 className="text-xl font-semibold text-light">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};