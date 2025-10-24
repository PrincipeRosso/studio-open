'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const ChatInputSkeleton: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="bg-card border-border shadow-sm rounded-3xl">
        <CardContent className="p-0">
          <div className="relative flex flex-col w-full h-full justify-end">
            {/* Textarea area skeleton */}
            <div className="relative flex items-end gap-2 px-3 pb-2 pt-3">
              <div className="flex-1 min-h-[80px] bg-muted rounded-2xl animate-pulse relative">
                {/* Placeholder text lines */}
                <div className="absolute top-4 left-4 right-4 space-y-2">
                  <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-32" />
                </div>
              </div>
            </div>

            {/* Bottom controls skeleton */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                {/* Attach button skeleton */}
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded animate-pulse" />
                </div>
                
                {/* Agent/Model selector skeleton */}
                <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5 animate-pulse">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full animate-pulse" />
                  <div className="w-12 h-3 bg-muted-foreground/30 rounded animate-pulse" />
                  <div className="w-3 h-3 bg-muted-foreground/30 rounded animate-pulse" />
                </div>
              </div>

              {/* Send button skeleton */}
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex items-center justify-center">
                <div className="w-4 h-4 bg-muted-foreground/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};