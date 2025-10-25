'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, ArrowUp, Paperclip, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { AgentModelSelector, Agent, Model, defaultAgents, defaultModels } from './agent-model-selector';
import { CustomTextarea } from './custom-textarea';

export interface ChatInputHandles {
  getPendingFiles: () => File[];
  clearPendingFiles: () => void;
}

export interface ChatInputProps {
  onSubmit: (message: string, options?: { model_name?: string; agent_id?: string }) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  isLoading?: boolean;
}

export interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  localUrl?: string;
}

export const ChatInput = memo(forwardRef<ChatInputHandles, ChatInputProps>(
  ({ onSubmit, placeholder, loading = false, disabled = false, autoFocus = true, value: controlledValue, onChange: controlledOnChange, isLoading = false }, ref) => {
    const t = useTranslations('chatInput');
    const isControlled = controlledValue !== undefined && controlledOnChange !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState('');
    const value = isControlled ? controlledValue : uncontrolledValue;
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent>(defaultAgents[0]);
    const [selectedModel, setSelectedModel] = useState<Model>(defaultModels[0]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      getPendingFiles: () => pendingFiles,
      clearPendingFiles: () => setPendingFiles([]),
    }));

    const setValue = useCallback((newValue: string) => {
      if (isControlled) {
        controlledOnChange?.(newValue);
      } else {
        setUncontrolledValue(newValue);
      }
    }, [isControlled, controlledOnChange]);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [value]);

    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [autoFocus]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();
      if ((!value.trim() && uploadedFiles.length === 0) || loading || disabled || isUploading) return;

      let message = value;
      if (uploadedFiles.length > 0) {
        const fileInfo = uploadedFiles.map((file) => `[Uploaded File: ${file.path}]`).join('\n');
        message = message ? `${message}\n\n${fileInfo}` : fileInfo;
      }

      onSubmit(message, {
        agent_id: selectedAgent.id,
        model_name: selectedModel.id
      });
      setValue('');
      setUploadedFiles([]);
    }, [value, uploadedFiles, loading, disabled, isUploading, onSubmit, setValue, selectedAgent, selectedModel]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    }, [handleSubmit]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setPendingFiles(Array.from(files));
      
      try {
        const uploadedFiles = Array.from(files).map(file => ({
          name: file.name,
          path: `/uploads/${file.name}`,
          size: file.size,
          type: file.type,
          localUrl: URL.createObjectURL(file)
        }));
        
        setTimeout(() => {
          setUploadedFiles(prev => [...prev, ...uploadedFiles]);
          setIsUploading(false);
          setPendingFiles([]);
        }, 1000);
      } catch (error) {
        console.error('File upload error:', error);
        setIsUploading(false);
        setPendingFiles([]);
      }
    };

    const removeFile = (index: number) => {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleThirdPartyApps = () => {
      // TODO: Implementare logica per integrazione app terze
      console.log('Integrazione app terze cliccata');
    };

    // Skeleton per lo stato di caricamento
    if (isLoading) {
      return (
        <div className="mx-auto w-full max-w-2xl">
          <Card className="bg-card border-border shadow-sm rounded-3xl">
            <CardContent className="p-0">
              <div className="relative flex flex-col w-full h-full justify-end">
                <div className="relative flex items-end gap-2 px-3 pb-2">
                  <div className="flex-1 min-h-[80px] bg-muted rounded-2xl animate-pulse" />
                </div>
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                    <div className="w-24 h-6 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card className="bg-card border-border shadow-sm rounded-3xl">
          <CardContent className="p-0">
            {uploadedFiles.length > 0 && (
              <div className="p-3 border-b border-border">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-2 py-1 rounded-xl text-sm">
                      <span className="truncate max-w-32">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && pendingFiles.length > 0 && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <div className="flex items-center gap-2 bg-background/90 px-3 py-2 rounded-3xl border border-border">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{t('uploading')} {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}...</span>
                </div>
              </div>
            )}

            <div className="relative flex flex-col w-full h-full justify-end">
              <div className="relative flex items-end gap-2 px-3 pb-2">
                <CustomTextarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder || t('placeholder')}
                  disabled={loading || disabled}
                  minHeight={80}
                  maxHeight={200}
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1.5">
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="*/*" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading || disabled || isUploading}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted/50 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Paperclip className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{t('attachFile')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Third Party Apps Integration */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleThirdPartyApps}
                          disabled={loading || disabled}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted/50 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Settings2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Integrazioni App Terze</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Agent and Model Selector */}
                  <AgentModelSelector
                    selectedAgent={selectedAgent}
                    selectedModel={selectedModel}
                    agents={defaultAgents}
                    models={defaultModels}
                    onAgentChange={setSelectedAgent}
                    onModelChange={setSelectedModel}
                    disabled={loading || disabled}
                  />
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={(!value.trim() && uploadedFiles.length === 0) || loading || disabled || isUploading}
                        className={cn(
                          "w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-95",
                          (value.trim() || uploadedFiles.length > 0) && !loading && !disabled && !isUploading
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {loading || isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {loading || isUploading ? (
                        <p>{t('uploading')} {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}...</p>
                      ) : (
                        <p>{t('sendMessage')}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
));

ChatInput.displayName = 'ChatInput';