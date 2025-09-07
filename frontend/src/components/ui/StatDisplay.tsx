import React from 'react';

interface StatDisplayProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({
  label,
  value,
  icon,
  size = 'md',
  highlight = false
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const valueClasses = highlight 
    ? 'text-blue-600 font-bold'
    : 'text-gray-800 font-semibold';

  return (
    <div className={`flex items-center justify-between ${sizeClasses[size]}`}>
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span>{label}:</span>
      </div>
      <span className={valueClasses}>{value}</span>
    </div>
  );
};