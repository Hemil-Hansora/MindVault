'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageSquare } from 'lucide-react';

// Import the new AI Elements components
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { Loader } from '@/components/ai-elements/loader';

interface ChatSectionProps {
  disabled?: boolean;
}

export default function ChatSection({ disabled = false }: ChatSectionProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const [input, setInput] = useState('');

  const sampleQuestions = [
    'What are the main topics covered in this document?',
    'Can you summarize the key points?',
    'What are the most important findings?',
    'Are there any specific recommendations mentioned?',
  ];

  // Handler to set the input field with a sample question
  const handleSampleQuestion = (question: string) => {
    if (!disabled) {
      setInput(question);
    }
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }],
    });
    setInput('');
  };

  return (
  <div className="w-full h-[650px] flex flex-col border rounded-3xl   text-foreground bg-background">
  <Conversation className="h-full">
    <ConversationContent className="p-6">
      {/* Render different states based on messages and disabled prop */}
      {messages.length === 0 ? (
        // If disabled, show "Upload a Document" message
        disabled ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-muted-foreground">
                Upload a Document First
              </h3>
              <p className="text-sm text-muted-foreground">
                Add a PDF, website link, or text note to start chatting.
              </p>
            </div>
          </div>
        ) : (
          // If enabled and no messages, show "Ready to Chat" with samples
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Ready to Chat!</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your documents are ready. Ask me anything about their content.
              </p>
            </div>
            <div className="space-y-3 w-full max-w-md pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Try Asking
              </p>
              <div className="grid gap-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuestion(question)}
                    className="p-3 text-left text-sm bg-card hover:bg-muted border border-border rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        // Render the list of messages
        messages.map((message) => (
          <Message from={message.role} key={message.id}>
            <MessageContent>
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <Response  className=" text-black " key={`${message.id}-${i}`}>{part.text}</Response>
                  );
                }
                return null;
              })}
            </MessageContent>
          </Message>
        ))
      )}
      {/* Show a loader when the AI is thinking */}
      {status === "submitted" && <Loader />}
    </ConversationContent>
    <ConversationScrollButton />
  </Conversation>

  {/* Input Area */}
  <div className="border-t  rounded-b-lg p-2  ">
    <PromptInput
      onSubmit={handleSubmit}
      className="flex items-center px-3 bg-card rounded-lg border border-border"
    >
      <PromptInputTextarea
        onChange={(e) => setInput(e.target.value)}
        value={input}
        placeholder={
          disabled
            ? "Upload a document to start chatting..."
            : "Ask anything about your documents..."
        }
        disabled={disabled || status === "submitted"}
        className="placeholder-muted-foreground text-foreground bg-card"
      />
      <PromptInputSubmit
        size={"icon"}
        status={status}
        disabled={!input.trim() || disabled}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
      />
    </PromptInput>
  </div>
</div>
  )
}