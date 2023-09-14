"use client";

import { ChatHeader } from "@/components/chat-header";
import { Character, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCompletion } from "ai/react";
import { ChatForm } from "@/components/chat-form";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";
import { useToast } from "@/components/ui/use-toast";

interface ChatClientProps {
  character: Character & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatClient = ({ character }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(
    character.messages
  );

  const { toast } = useToast();

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${character.id}`,
      onFinish(_prompt, completion) {
        const systemMessage: ChatMessageProps = {
          role: "system",
          content: completion,
        };

        setMessages((current) => [...current, systemMessage]);
        setInput("");

        router.refresh();
      },
    });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent the default form submission

    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    };

    setMessages((current) => [...current, userMessage]);

    // adding a timeout to the fetch request
    const timeoutDuration = 20000;
    const fetchTimeout = setTimeout(() => {
      toast({
        description: "Character response timed out. Please try again later.",
        duration: 19000,
        variant: "destructive",
      });
    }, timeoutDuration);

    try {
      // Send the request
      await handleSubmit(e);
      // Clear the timeout if the request succeeds
      clearTimeout(fetchTimeout);
    } catch (error) {
      console.error("Error:", error);

      toast({
        description:
          "An error occurred while processing your request. Please try again later.",
        duration: 20000,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader character={character} />
      <ChatMessages
        character={character}
        isLoading={isLoading}
        messages={messages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
