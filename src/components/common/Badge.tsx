import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'primary' | 'azure' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  let variantClass = '';
  switch (variant) {
    case 'success':
      variantClass = 'badge-success-subtle';
      break;
    case 'danger':
      variantClass = 'badge-danger-subtle';
      break;
    case 'azure':
      variantClass = 'badge-azure';
      break;
    default:
      variantClass = 'badge-success-subtle';
  }

  return (
    <span className={`badge-pill ${variantClass} ${className}`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
