"use client"

import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ThreadHeaderProps {
  title: string
  onTitleChange?: (newTitle: string) => void
  onDeleteThread?: () => void
  onShareThread?: () => void
  isLoading?: boolean
}

export const ThreadHeader: React.FC<ThreadHeaderProps> = ({
  title,
  onTitleChange,
  onDeleteThread,
  onShareThread,
  isLoading = false
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(title)

  const handleTitleSubmit = () => {
    if (onTitleChange && editedTitle.trim()) {
      onTitleChange(editedTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setEditedTitle(title)
      setIsEditingTitle(false)
    }
  }

  // Skeleton per lo stato di caricamento
  if (isLoading) {
    return (
      <div className="bg-background/40 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="h-7 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background/40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Thread Title */}
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyPress}
                className="bg-transparent border-none outline-none text-lg w-full"
                autoFocus
              />
            ) : (
              <h1 
                className="text-lg truncate cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={() => setIsEditingTitle(true)}
                title="Clicca per modificare il titolo"
              >
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* Agent and Model Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {/* Thread Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                Rinomina thread
              </DropdownMenuItem>
              {onShareThread && (
                <DropdownMenuItem onClick={onShareThread}>
                  Condividi thread
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDeleteThread && (
                <DropdownMenuItem 
                  onClick={onDeleteThread}
                  className="text-destructive focus:text-destructive"
                >
                  Elimina thread
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}