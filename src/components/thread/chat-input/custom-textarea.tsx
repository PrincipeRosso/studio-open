'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ 
    value = '', 
    onChange, 
    onKeyDown, 
    placeholder, 
    disabled = false, 
    className,
    minHeight = 80,
    maxHeight = 200,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current!, []);

    // Auto-resize functionality
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value, minHeight, maxHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      adjustHeight();
    };

    return (
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full resize-none border-0 bg-transparent",
            "focus:outline-none focus:ring-0",
            "text-base placeholder:text-muted-foreground",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            height: `${minHeight}px`,
            padding: '12px 0',
            lineHeight: '1.5',
          }}
          {...props}
        />
      </div>
    );
  }
);

CustomTextarea.displayName = 'CustomTextarea';