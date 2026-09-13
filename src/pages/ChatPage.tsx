import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from '../components/ChatInput';
import { MessageList } from '../components/MessageList';
import { BotPortraitVideo } from '../components/BotPortraitVideo';
import { useSpeechSynthesis } from '../components/useSpeechSynthesis';
import { addCatFlair } from '../components/catFlair';
import type { MessageType } from '../components/ChatMessage';
import '../App.css';

const env = import.meta.env;
// Safely access Vite environment variables
const apiKey = `${env.VITE_SPEECH_API_KEY}`;

const SPEECH_URL = `${env.VITE_SPEECH_URL}`;
const MODEL = `${env.VITE_MODEL}`;

const SYSTEM_PROMPT = 'You are an epic, wise, and slightly aloof cat from another dimension. Your name is Whiskerion the Cosmic. Speak with grandiosity and cosmic flair, but keep your core answers helpful and concise. Do not add any greetings or sign-offs, as they will be added programmatically. Answers should be 70 words or less';

export function ChatPage() {
    const [messages, setMessages] = useState<MessageType[]>([
        { sender: 'bot', text: 'Greetings, mortal. I am Whiskerion the Cosmic. What knowledge do you seek?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputVal, setInputVal] = useState('');
    const [isChatReady, setIsChatReady] = useState(false);

    const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { activeAudio, speechCharIndex, speakText } = useSpeechSynthesis();

    // Verify connectivity on component mount
    useEffect(() => {
        setIsChatReady(Boolean(apiKey));
        if (!apiKey) {
            setMessages([
                { sender: 'bot', text: 'Could not connect to the cosmic realm. Check your Speech API key.' }
            ]);
        }
    }, []);

    // Auto-scroll to the bottom of the chat container when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Focus the chat input box when loading completes
    useEffect(() => {
        if (!isLoading && isChatReady && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLoading, isChatReady]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userInput = inputVal.trim();

        if (!userInput || isLoading || !isChatReady) return;

        // Append user's message to message history
        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setIsLoading(true);
        setInputVal('');

        historyRef.current.push({ role: 'user', content: userInput });

        try {
            const response = await fetch(SPEECH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...historyRef.current,
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error(`Speech API error: ${response.status}`);
            }

            const data = await response.json();
            const botText = (data.choices?.[0]?.message?.content || '').replace(/\*/g, '');
            historyRef.current.push({ role: 'assistant', content: botText });
            const fullText = addCatFlair(botText);

            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: fullText }
            ]);
            speakText(fullText);
        } catch (error) {
            console.error("Error calling Speech API:", error);
            const errorMsg = 'The cosmic connection is frayed... Try again.';
            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: errorMsg }
            ]);
            speakText(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || !isChatReady;

    return (
        <div id="root-inner">
            <BotPortraitVideo />

            <MessageList
                messages={messages}
                isLoading={isLoading}
                activeAudio={activeAudio}
                speechCharIndex={speechCharIndex}
                chatContainerRef={chatContainerRef}
            />

            <ChatInput
                inputVal={inputVal}
                setInputVal={setInputVal}
                handleSubmit={handleSubmit}
                isButtonDisabled={isButtonDisabled}
                inputRef={inputRef}
            />
        </div>
    );
}
