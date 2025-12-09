/**
 * Input Component
 * Input component using Base UI Field + Tailwind following Twilio Design System
 * Base UI provides accessible field behavior, validation, and error handling
 * Tailwind provides styling following Twilio design tokens
 */

import React from 'react';
import { Field } from '@base-ui-components/react/field';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  name?: string;
}

export function Input({
  label,
  error,
  helperText,
  name,
  className = '',
  ...props
}: InputProps) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Field.Root
      name={name || inputId}
      invalid={!!error}
      className="w-full"
    >
      {label && (
        <Field.Label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-twilio-gray-700 data-[disabled]:text-twilio-gray-500"
        >
          {label}
        </Field.Label>
      )}
      
      <Field.Control
        id={inputId}
        render={<input />}
        className={`
          block w-full rounded-md border px-3 py-2 text-sm shadow-sm
          placeholder-twilio-gray-400
          focus:outline-none focus:ring-2
          data-[invalid]:border-twilio-red data-[invalid]:focus:border-twilio-red data-[invalid]:focus:ring-twilio-red
          data-[valid]:border-twilio-gray-300 data-[valid]:focus:border-twilio-blue data-[valid]:focus:ring-twilio-blue
          border-twilio-gray-300 focus:border-twilio-blue focus:ring-twilio-blue
          disabled:cursor-not-allowed disabled:bg-twilio-gray-50 disabled:text-twilio-gray-500
          data-[disabled]:cursor-not-allowed data-[disabled]:bg-twilio-gray-50 data-[disabled]:text-twilio-gray-500
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <div className="mt-1 text-xs text-twilio-red" role="alert">
          {error}
        </div>
      )}
      
      {!error && helperText && (
        <Field.Description className="mt-1 text-xs text-twilio-gray-500">
          {helperText}
        </Field.Description>
      )}
    </Field.Root>
  );
}
