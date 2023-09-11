"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { Character } from "@prisma/client";

import { ChatMessage, ChatMessageProps } from "@/components/chat-message";

interface ChatMessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  character: Character;
}

export const ChatMessages = ({
  messages = [],
  isLoading,
  character,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);

  const [fakeLoading, setFakeLoading] = useState(
    messages.length === 0 ? true : false
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={fakeLoading}
        src={character.src}
        role="system"
        content={`Hello, I am ${character.name}, ${character.description}`}
      />
      {messages.map((message) => (
        <ChatMessage
          key={message.content}
          src={character.src}
          content={message.content}
          role={message.role}
        />
      ))}
      {isLoading && <ChatMessage src={character.src} role="system" isLoading />}
      <div ref={scrollRef} />
    </div>
  );
};
