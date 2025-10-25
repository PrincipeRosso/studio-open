'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface MiniCalendarProps {
  date: string; // ISO format: YYYY-MM-DD
  time?: string; // HH:MM format
  title?: string;
  operation?: string; // Tipo di operazione (create, update, delete, etc.)
  className?: string;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ 
  date, 
  time, 
  title,
  operation,
  className = '' 
}) => {
  const t = useTranslations('tools.composio.operations');
  const locale = useLocale();
  
  // Parse della data - fallback a oggi se non valida
  const dateObj = new Date(date);
  const isValidDate = !isNaN(dateObj.getTime());
  const finalDateObj = isValidDate ? dateObj : new Date();
  
  const dayOfMonth = finalDateObj.getDate();
  const month = finalDateObj.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', { month: 'short' });
  const dayOfWeek = finalDateObj.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', { weekday: 'short' });
  
  // Determina il titolo in base all'operazione
  const getOperationTitle = () => {
    if (title) return title;
    
    switch (operation) {
      case 'create_event':
        return t('createEvent');
      case 'update_event':
        return t('updateEvent');
      case 'delete_event':
        return t('deleteEvent');
      case 'list_events':
        return t('listEvents');
      case 'get_event':
        return t('getEvent');
      default:
        return t('createEvent'); // Default fallback
    }
  };
  
  return (
    <div className={`flex items-start gap-3 p-3 bg-background rounded-lg border border-border ${className}`}>
      {/* Mini Calendar Icon */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm">
          {/* Header del calendario */}
          <div className="bg-blue-600 text-white text-[10px] font-medium text-center py-0.5">
            {month.toUpperCase()}
          </div>
          {/* Giorno del mese */}
          <div className="bg-white text-foreground text-xl font-bold text-center leading-none pt-1.5 pb-1">
            {dayOfMonth}
          </div>
        </div>
      </div>
      
      {/* Event Details */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate mb-0.5">
          {getOperationTitle()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{dayOfWeek}, {finalDateObj.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        {time && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <span className="w-3 h-3 flex items-center justify-center">🕐</span>
            <span>{time}</span>
          </div>
        )}
      </div>
    </div>
  );
};

