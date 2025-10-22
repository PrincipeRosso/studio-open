'use client';

import React, { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface AnnouncementBarProps {
  className?: string;
  dismissible?: boolean;
  variant?: 'info' | 'warning' | 'success' | 'primary';
}

export function AnnouncementBar({ 
  className, 
  dismissible = true, 
  variant = 'primary' 
}: AnnouncementBarProps) {
  const t = useTranslations('announcement');
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Ottieni lo stato della sidebar se disponibile
  let sidebarState = null;
  let isMobile = false;
  
  try {
    const sidebar = useSidebar();
    sidebarState = sidebar.state;
    isMobile = sidebar.isMobile;
  } catch {
    // useSidebar non è disponibile in questo contesto
  }

  useEffect(() => {
    setIsClient(true);
    // Controlla se l'utente ha già chiuso l'announcement
    if (dismissible) {
      const dismissed = localStorage.getItem('announcement-dismissed');
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, [dismissible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      localStorage.setItem('announcement-dismissed', 'true');
    }
  };

  // Non renderizzare durante l'SSR per evitare hydration mismatch
  if (!isClient || !isVisible) {
    return null;
  }

  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-100',
    success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/50 dark:border-green-800 dark:text-green-100',
    primary: 'bg-teal-600 border-teal-700 text-white dark:bg-teal-700 dark:border-teal-800 dark:text-teal-50'
  };

  // Calcola il padding left in base allo stato della sidebar
  const getSidebarAwareStyles = () => {
    // Se siamo su mobile, non applicare padding aggiuntivo
    if (isMobile) {
      return '';
    }
    
    // Se la sidebar è espansa, aggiungi padding left
    if (sidebarState === 'expanded') {
      return 'md:pl-64'; // 16rem = 256px = pl-64
    }
    
    // Se la sidebar è collassata, aggiungi padding minore
    if (sidebarState === 'collapsed') {
      return 'md:pl-12'; // 3rem = 48px = pl-12
    }
    
    return '';
  };

  return (
    <div className={cn(
      'relative w-full border-b transition-all duration-300 ease-in-out py-1',
      variantStyles[variant],
      getSidebarAwareStyles(),
      className
    )}>
      <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-3 w-3 flex-shrink-0" />
              <p className="text-xs leading-tight">
                {t('message')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={t('link')}
              className="text-xs underline hover:no-underline transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('linkText')}
            </a>

            <button
              onClick={handleDismiss}
              className="p-1 hover:opacity-70 transition-opacity duration-200"
              aria-label={t('dismiss')}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}