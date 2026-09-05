import type { RefObject } from 'react';
import { ChatMessage, type MessageType } from './ChatMessage';
import { Loader } from './Loader';

export function MessageList({
    messages,
    isLoading,
    activeAudio,
    speechCharIndex,
    chatContainerRef
}: {
    messages: MessageType[];
    isLoading: boolean;
    activeAudio: HTMLAudioElement | null;
    speechCharIndex: number | null;
    chatContainerRef: RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="chat-container" ref={chatContainerRef}>
            {messages.map((msg, index) => (
                <ChatMessage
                    key={index}
                    msg={msg}
                    isLastMessage={index === messages.length - 1}
                    activeAudio={activeAudio}
                    speechCharIndex={speechCharIndex}
                    hasMultipleMessages={messages.length > 1}
                />
            ))}
            {isLoading && <Loader />}
        </div>
    );
}