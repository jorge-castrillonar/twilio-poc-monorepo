/**
 * PageHeader Component
 * Header for pages following Twilio Design System Page Pattern
 */

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-twilio-gray-200 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-twilio-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-twilio-gray-600">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
