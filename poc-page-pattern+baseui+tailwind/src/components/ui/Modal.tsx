/**
 * Modal Component
 * Modal dialog component using Base UI Dialog + Tailwind following Twilio Design System
 * Base UI provides accessible dialog behavior (focus management, keyboard nav, ARIA)
 * Tailwind provides styling following Twilio design tokens
 */

import React from 'react';
import { Dialog } from '@base-ui-components/react/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        
        {/* Viewport - scrollable container */}
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Popup - modal content */}
          <Dialog.Popup
            className={`relative w-full ${sizeClasses[size]} transform rounded-lg bg-white shadow-xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-twilio-gray-200 px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-twilio-gray-900">
                {title}
              </Dialog.Title>
              
              <Dialog.Close 
                className="rounded-md text-twilio-gray-400 hover:text-twilio-gray-600 focus:outline-none focus:ring-2 focus:ring-twilio-blue"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-end space-x-3 border-t border-twilio-gray-200 px-6 py-4">
                {footer}
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
