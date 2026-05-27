import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import './App.css';

// Safely access Vite environment variables or Node/fallback variables
const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || "") ||
    (typeof process !== 'undefined' ? process.env.API_KEY || "" : "");

const ai = new GoogleGenAI({ apiKey });

const catPrefixes = [
    "By the whisker of the cosmos... ",
    "From the ninth dimension of my ninth life, I decree... ",
    "Hark, mortal, for I purr the truth... ",
    "Behold, the wisdom of the cosmic feline... ",
];

const catSuffixes = [
    " Meow majestically",
    " Claws sharpened.",
    " Cosmic purrs",
    " Feline decree.",
    " Nap time.",
];

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}



export function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Greetings, mortal. I am Whiskerion the Cosmic. What knowledge do you seek?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputVal, setInputVal] = useState('');
    const [isChatReady, setIsChatReady] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize Gemini Chat session on component mount
    useEffect(() => {
        try {
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash-lite',
                config: {
                    systemInstruction: 'You are an epic, wise, and slightly aloof cat from another dimension. Your name is Whiskerion the Cosmic. Speak with grandiosity and cosmic flair, but keep your core answers helpful and concise. Do not add any greetings or sign-offs, as they will be added programmatically.',
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

            const prefix = getRandomItem(catPrefixes);
            const suffix = getRandomItem(catSuffixes);

            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: prefix + botText + suffix }
            ]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: 'The cosmic connection is frayed... Try again.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || !isChatReady;

    return (
        <div id="root-inner">


            <svg className="epic-cat-portrait" viewBox="0 180 800 600" preserveAspectRatio="xMidYMax meet">
                <path d="M400,600 C300,600 180,550 130,450 C120,420 135,380 140,350 C100,280 150,150 250,100 C270,90 290,120 300,150 L350,140 L400,110 L450,140 L500,150 C510,120 530,90 550,100 C650,150 700,280 660,350 C665,380 680,420 670,450 C620,550 500,600 400,600 Z" fill="#101829" stroke="#e94560" strokeWidth={3} />
                <g className="cat-eyes">
                    <ellipse className="cat-eye" cx={330} cy={300} rx={50} ry={30} />
                    <ellipse className="cat-eye" cx={470} cy={300} rx={50} ry={30} />
                </g>
            </svg>

            <div className="chat-container" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message oswald-bold ${msg.sender}-message`}
                        role="log"
                        aria-live="polite"
                    >
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot-message loading-message">
                        Whiskerion is pondering the cosmic strings...
                    </div>
                )}
            </div>

            <div className="form-container">
                <form className="chat-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Ask the epic cat..."
                        aria-label="Chat input"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        disabled={isButtonDisabled}
                        ref={inputRef}
                    />
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isButtonDisabled}
                        aria-label="Send message"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
