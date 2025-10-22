'use client';

import React, { useState } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StudioIcon } from '@/components/studio-icon';

export interface Agent {
  id: string;
  name: string;
  description?: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface AgentModelSelectorProps {
  selectedAgent: Agent;
  selectedModel: Model;
  agents: Agent[];
  models: Model[];
  onAgentChange: (agent: Agent) => void;
  onModelChange: (model: Model) => void;
  disabled?: boolean;
}

const defaultAgents: Agent[] = [
  {
    id: 'studio',
    name: 'Studio',
    description: 'Agente di default per conversazioni generali'
  }
];

const defaultModels: Model[] = [
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20B',
    provider: 'OpenRouter',
    description: 'Modello gratuito per uso generale'
  }
];

export const AgentModelSelector: React.FC<AgentModelSelectorProps> = ({
  selectedAgent,
  selectedModel,
  agents = defaultAgents,
  models = defaultModels,
  onAgentChange,
  onModelChange,
  disabled = false
}) => {
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <>
      {/* Agent Selector */}
      <DropdownMenu open={agentDropdownOpen} onOpenChange={setAgentDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-7 px-2 text-xs font-normal hover:bg-muted/50",
              "flex items-center gap-1.5 min-w-0"
            )}
          >
            <StudioIcon size={12} className="flex-shrink-0" />
            <span className="truncate">{selectedAgent.name}</span>
            <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Seleziona Agente
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {agents.map((agent) => (
            <DropdownMenuItem
              key={agent.id}
              onClick={() => {
                onAgentChange(agent);
                setAgentDropdownOpen(false);
              }}
              className={cn(
                "cursor-pointer text-sm",
                selectedAgent.id === agent.id && "bg-accent"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <StudioIcon size={12} className="text-muted-foreground" />
                  <span className="font-medium">{agent.name}</span>
                </div>
                {agent.description && (
                  <span className="text-xs text-muted-foreground ml-5">
                    {agent.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Model Selector */}
      <DropdownMenu open={modelDropdownOpen} onOpenChange={setModelDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-8 w-8 p-0 hover:bg-muted/50",
              "flex items-center justify-center"
            )}
          >
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Seleziona Modello
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => {
                onModelChange(model);
                setModelDropdownOpen(false);
              }}
              className={cn(
                "cursor-pointer text-sm",
                selectedModel.id === model.id && "bg-accent"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">({model.provider})</span>
                </div>
                {model.description && (
                  <span className="text-xs text-muted-foreground ml-5">
                    {model.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export { defaultAgents, defaultModels };