import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatInput } from '../components/ChatInput';
import { MessageList } from '../components/MessageList';
import { BotPortraitVideo } from '../components/BotPortraitVideo';
import { useSpeechSynthesis } from '../components/useSpeechSynthesis';
import { addCatFlair } from '../components/catFlair';
import type { MessageType } from '../components/ChatMessage';
import '../App.css';

// Safely access Vite environment variables or Node/fallback variables
const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || "") ||
    (typeof process !== 'undefined' ? process.env.API_KEY || "" : "");

const ai = new GoogleGenAI({ apiKey });

export function ChatPage() {
    const [messages, setMessages] = useState<MessageType[]>([
        { sender: 'bot', text: 'Greetings, mortal. I am Whiskerion the Cosmic. What knowledge do you seek?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputVal, setInputVal] = useState('');
    const [isChatReady, setIsChatReady] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { activeAudio, speechCharIndex, speakText } = useSpeechSynthesis();

    // Initialize Gemini Chat session on component mount
    useEffect(() => {
        try {
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash-lite',
                config: {
                    systemInstruction: 'You are an epic, wise, and slightly aloof cat from another dimension. Your name is Whiskerion the Cosmic. Speak with grandiosity and cosmic flair, but keep your core answers helpful and concise. Do not add any greetings or sign-offs, as they will be added programmatically. Answers should be 70 words or less',
                },
            });
            chatRef.current = chatSession;
            setIsChatReady(true);
        } catch (e) {
            console.error("Could not connect to the cosmic realm:", e);
            setMessages([
                { sender: 'bot', text: 'Could not connect to the cosmic realm. Check your API key.' }
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

        if (!userInput || isLoading || !chatRef.current) return;

        // Append user's message to message history
        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setIsLoading(true);
        setInputVal('');

        try {
            const response = await chatRef.current.sendMessage({ message: userInput });
            const botText = (response.text || '').replace(/\*/g, '');
            const fullText = addCatFlair(botText);

            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: fullText }
            ]);
            speakText(fullText);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
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
