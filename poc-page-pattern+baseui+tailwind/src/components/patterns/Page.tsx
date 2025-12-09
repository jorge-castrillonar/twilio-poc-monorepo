/**
 * Page Component
 * Base layout container following Twilio Design System Page Pattern
 */

import React from 'react';

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export function Page({ children, className = '' }: PageProps) {
  return (
    <div className={`min-h-screen bg-twilio-gray-50 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
