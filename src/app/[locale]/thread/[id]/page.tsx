'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { AuthProvider } from '@/contexts/auth-context';
import { ChatArea } from '@/components/thread/chat-area';
import { ChatInput } from '@/components/thread/chat-input/chat-input';
import { ChatInputSkeleton } from '@/components/thread/chat-input/chat-input-skeleton';
import { ThreadHeader } from '@/components/thread/thread-header';
import { ThreadHeaderSkeleton } from '@/components/thread/thread-header-skeleton';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

function ThreadContent() {
  const params = useParams();
  const threadId = params.id as string;
  const [messagesLoading, setMessagesLoading] = useState(true);

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error
  } = useChat({
    id: threadId,
    api: '/api/chat',
    body: {
      threadId: threadId,
    },
    onFinish: (message) => {
      console.log('Messaggio completato:', message);
    },
    onError: (error) => {
      console.error('Errore nella chat:', error);
    },
  });

  // Carica i messaggi esistenti per questo thread
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/threads?id=${threadId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.thread && data.thread.messages) {
            const uiMessages = data.thread.messages.map((msg: any) => {
              // Se il messaggio ha parts, usali direttamente
              if (msg.parts && Array.isArray(msg.parts)) {
                return {
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  parts: msg.parts,
                  metadata: msg.metadata,
                  timestamp: new Date(msg.timestamp)
                };
              }
              
              // Altrimenti, crea un part di testo semplice
              return {
                id: msg.id,
                role: msg.role,
                content: msg.content,
                parts: [{ type: 'text', text: msg.content }],
                metadata: msg.metadata,
                timestamp: new Date(msg.timestamp)
              };
            });
            setMessages(uiMessages);
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [threadId, setMessages]);

  const handleSendMessage = async (content: string, options?: { agent_id?: string; model_name?: string }) => {
    try {
      // Use sendMessage from useChat
      await sendMessage({
        text: content
      }, {
        body: {
          agent_id: options?.agent_id,
          model_name: options?.model_name,
          threadId
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };



  const isLoading = status === 'submitted' || status === 'streaming';

  // Determina il titolo del thread
  const getThreadTitle = () => {
    if (messages.length === 0) {
      return "Nuova conversazione";
    }
    // Usa il primo messaggio dell'utente come titolo, troncato
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');
      return content.length > 50 
        ? content.substring(0, 50) + "..."
        : content;
    }
    return "Conversazione";
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar">
        <div className="h-screen flex flex-col">
          {/* Thread Header */}
          {messagesLoading ? (
            <ThreadHeaderSkeleton />
          ) : (
            <ThreadHeader 
              title={getThreadTitle()}
            />
          )}
          
          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
            <ChatArea 
              messages={messages.map(msg => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.parts
                  .filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join(''),
                timestamp: new Date(),
                parts: msg.parts
              }))}
              isLoading={status === 'streaming' || status === 'submitted'}
              isPageLoading={messagesLoading}
            />
          </div>
          
          {/* Chat Input */}
          <div className="p-4">
            {messagesLoading ? (
              <ChatInputSkeleton />
            ) : (
              <ChatInput 
                onSubmit={handleSendMessage}
                loading={status === 'streaming' || status === 'submitted'}
                disabled={status === 'streaming' || status === 'submitted'}
              />
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border-t border-destructive/20">
              <div className="text-sm text-destructive">
                Errore: {error.message}
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ThreadPage() {
  return (
    <AuthProvider>
      <ThreadContent />
    </AuthProvider>
  );
}