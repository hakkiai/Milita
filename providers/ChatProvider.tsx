import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTotalUnread } from '@/hooks/useChat';

interface ChatContextValue {
  totalUnread: number;
}

const ChatContext = createContext<ChatContextValue>({ totalUnread: 0 });

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const totalUnread = useTotalUnread(user?.id ?? null);

  return (
    <ChatContext.Provider value={{ totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
