import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { LoadingCat } from './components/LoadingCat';
import { ChatInput } from './components/ChatInput';
import { ChatMessage, type MessageType } from './components/ChatMessage';
import './App.css';

// Safely access Vite environment variables or Node/fallback variables
const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || "") ||
    (typeof process !== 'undefined' ? process.env.API_KEY || "" : "");

const ai = new GoogleGenAI({ apiKey });

const elevenLabsApiKey = String(import.meta.env.VITE_ELEVENLABS_API_KEY || "") ||
    (typeof process !== 'undefined' ? process.env.ELEVENLABS_API_KEY || "" : "");

const elevenLabsVoiceId = String(import.meta.env.VITE_ELEVENLABS_VOICE_ID || "pNInz6obpgDQ51u76XYj") ||
    (typeof process !== 'undefined' ? process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQ51u76XYj" : "pNInz6obpgDQ51u76XYj");

const catPrefixes = [
    "By the whisker of the cosmos... ",
    "From the ninth dimension of my ninth life, I decree... ",
    "Hark, mortal, for I purr the truth... ",
    "Behold, the wisdom of the cosmic feline... ",
];

const catSuffixes = [
    " Time expires, meows inspire.",
    " The catnip is you.",
    " Time for my nap.",
    " Your quest for knowledge is amusing.",
    " The answers you seek are within.",
    " Curiosity is feline, do not lose yours.",
    " Pawsitively brilliant query.",
    " Purrfectly logical."
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

let whiskerionIntroPlayed = false;

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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
    const [speechCharIndex, setSpeechCharIndex] = useState<number | null>(null);

    const speakText = async (text: string) => {
        // Reset sync states
        setActiveAudio(null);
        setSpeechCharIndex(null);

        // 1. Stop any currently playing audio stream
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.src = "";
            } catch (e) {
                console.warn("Failed to reset current audio stream:", e);
            }
        }

        // 2. Stop any browser native speechSynthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {
                console.warn("Failed to cancel native speech synthesis:", e);
            }
        }

        // Clean text to avoid reading out punctuation patterns (markdown)
        const cleanedText = text.replace(/[*#_`~]/g, '');

        // 3. Check if ElevenLabs credentials exist
        if (elevenLabsApiKey) {
            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': elevenLabsApiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: cleanedText,
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: {
                            stability: 0.75,
                            similarity_boost: 0.75,
                        }
                    }),
                });

                if (!response.ok) {
                    throw new Error(`ElevenLabs API returned status code ${response.status}`);
                }

                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                // Track active audio element to synchronize typewriter text updates
                setActiveAudio(audio);

                await audio.play();
                return;
            } catch (error) {
                console.error("ElevenLabs text-to-speech failed, resorting to browser speech fallback:", error);
            }
        }

        // 4. Fallback to native Web Speech API
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(cleanedText);

            // Look for deep, wise-sounding voice presets
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.toLowerCase().includes('google uk english male') ||
                v.name.toLowerCase().includes('microsoft david') ||
                v.name.toLowerCase().includes('male')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            utterance.pitch = 0.85; // Slightly lower pitch for a feline/cosmic voice
            utterance.rate = 1.07;  // Spoken slightly faster to match the 1.1x typing sync speed

            // Synchronize fallback speech using boundary events
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    setSpeechCharIndex(event.charIndex);
                }
            };
            utterance.onend = () => {
                setSpeechCharIndex(null);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Speech synthesis not supported in this browser.");
        }
    };

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

    // Play the greeting audio file strictly 2 seconds after page loads, regardless of user interaction, once per session
    useEffect(() => {
        // If the intro has already played in this browser session, do not schedule or play it again
        if (whiskerionIntroPlayed) {
            return;
        }

        const timer = setTimeout(() => {
            if (whiskerionIntroPlayed) {
                return;
            }
            whiskerionIntroPlayed = true;

            // Stop any currently playing audio stream
            if (audioRef.current) {
                try {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                } catch (e) {
                    console.warn("Failed to reset current audio stream:", e);
                }
            }

            // Stop any browser native speechSynthesis
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                try {
                    window.speechSynthesis.cancel();
                } catch (e) {
                    console.warn("Failed to cancel native speech synthesis:", e);
                }
            }

            // Play the local greeting audio file from public directory
            const audio = new Audio('/whiskerion-intro.mp3');
            audioRef.current = audio;
            setActiveAudio(audio);
            audio.play().catch(error => {
                console.warn("Autoplay blocked initial greeting audio file. Waiting for user interaction to trigger playback:", error);

                const playOnInteraction = () => {
                    audio.play().catch(e => console.warn("Failed to play greeting audio on interaction:", e));
                };

                window.addEventListener('click', playOnInteraction, { once: true });
                window.addEventListener('keydown', playOnInteraction, { once: true });
                window.addEventListener('touchstart', playOnInteraction, { once: true });
            });
        }, 2000);

        return () => {
            clearTimeout(timer);
            if (audioRef.current) {
                try {
                    audioRef.current.pause();
                } catch (e) { }
            }
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                try {
                    window.speechSynthesis.cancel();
                } catch (e) { }
            }
        };
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
            const fullText = prefix + botText + suffix;

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


            <video className="epic-cat-portrait" src="/whiskerion.mp4" autoPlay loop muted playsInline></video>

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
                {isLoading && <LoadingCat />}
            </div>

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
