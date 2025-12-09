/**
 * Button Component
 * Button component using Base UI + Tailwind following Twilio Design System
 * Base UI provides accessible button behavior, Tailwind provides styling
 */

import React from 'react';
import { Button as BaseButton } from '@base-ui-components/react/button';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  focusableWhenDisabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  // Base styles for all buttons following Twilio Design System
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles matching Twilio color palette
  const variantStyles = {
    primary: 'bg-twilio-blue text-white hover:bg-blue-700 focus:ring-twilio-blue data-[disabled]:bg-twilio-blue',
    secondary: 'bg-twilio-gray-200 text-twilio-gray-900 hover:bg-twilio-gray-300 focus:ring-twilio-gray-500 data-[disabled]:bg-twilio-gray-200',
    danger: 'bg-twilio-red text-white hover:bg-red-700 focus:ring-twilio-red data-[disabled]:bg-twilio-red',
    ghost: 'bg-transparent text-twilio-blue hover:bg-twilio-gray-100 focus:ring-twilio-blue data-[disabled]:bg-transparent',
  };

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  // Combine all classes
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  return (
    <BaseButton
      className={combinedClassName}
      disabled={disabled}
      focusableWhenDisabled={focusableWhenDisabled}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
