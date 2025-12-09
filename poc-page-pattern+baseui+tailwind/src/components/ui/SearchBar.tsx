/**
 * SearchBar Component
 * Search input following Twilio Design System Search Pattern
 * Uses Base UI Input for accessibility and consistency
 */

import { Input } from '@base-ui-components/react/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-twilio-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Input
        type="text"
        value={value}
        onValueChange={onChange}
        className="block w-full rounded-md border border-twilio-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-twilio-gray-400 focus:border-twilio-blue focus:outline-none focus:ring-1 focus:ring-twilio-blue data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
        placeholder={placeholder}
      />
    </div>
  );
}
