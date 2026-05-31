import { TypewriterText } from './TypewriterText';

export type MessageType = {
    sender: 'user' | 'bot';
    text: string;
};

export function ChatMessage({
    msg,
    isLastMessage,
    activeAudio,
    speechCharIndex,
    hasMultipleMessages
}: {
    msg: MessageType;
    isLastMessage: boolean;
    activeAudio: HTMLAudioElement | null;
    speechCharIndex: number | null;
    hasMultipleMessages: boolean;
}) {
    return (
        <div
            className={`message oswald-bold ${msg.sender}-message`}
            role="log"
            aria-live="polite"
        >
            {msg.sender === 'bot' && isLastMessage ? (
                <TypewriterText
                    text={msg.text}
                    activeAudio={hasMultipleMessages ? activeAudio : null}
                    speechCharIndex={hasMultipleMessages ? speechCharIndex : null}
                    syncMode={hasMultipleMessages}
                />
            ) : (
                msg.text
            )}
        </div>
    );
}
