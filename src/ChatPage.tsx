import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
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

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}


function TypewriterText({
    text,
    activeAudio,
    speechCharIndex,
    syncMode
}: {
    text: string;
    activeAudio: HTMLAudioElement | null;
    speechCharIndex: number | null;
    syncMode: boolean;
}) {
    const [displayedText, setDisplayedText] = useState('');
    const [isDone, setIsDone] = useState(false);

    // Effect for ElevenLabs / HTML5 Audio element sync
    useEffect(() => {
        if (!activeAudio) return;

        setIsDone(false);

        const updateProgress = () => {
            const duration = activeAudio.duration;
            const currentTime = activeAudio.currentTime;

            if (duration && duration > 0) {
                // Map current time fraction to string index with 1.1x speed multiplier
                const ratio = Math.min(1, (currentTime / duration) * 1.4);
                const charIndex = Math.floor(ratio * text.length);
                setDisplayedText(text.slice(0, charIndex));
            } else {
                setDisplayedText('');
            }
        };

        const handleEnded = () => {
            setDisplayedText(text);
            setIsDone(true);
        };

        // Listen for timeupdate and metadata loading events to synchronize typing
        activeAudio.addEventListener('timeupdate', updateProgress);
        activeAudio.addEventListener('loadedmetadata', updateProgress);
        activeAudio.addEventListener('durationchange', updateProgress);
        activeAudio.addEventListener('ended', handleEnded);

        // Also call once initially
        updateProgress();

        return () => {
            activeAudio.removeEventListener('timeupdate', updateProgress);
            activeAudio.removeEventListener('loadedmetadata', updateProgress);
            activeAudio.removeEventListener('durationchange', updateProgress);
            activeAudio.removeEventListener('ended', handleEnded);
        };
    }, [text, activeAudio]);

    // Effect for Web Speech synthesis fallback index sync
    useEffect(() => {
        if (activeAudio || speechCharIndex === null) return;

        setIsDone(false);
        // Find the next word boundary or space to display up to
        const nextSpace = text.indexOf(' ', speechCharIndex);
        const endChar = nextSpace === -1 ? text.length : nextSpace;

        setDisplayedText(text.slice(0, endChar));

        if (endChar >= text.length) {
            setIsDone(true);
        }
    }, [text, activeAudio, speechCharIndex]);

    // Fallback typing effect if no audio/speech synthesis active (only when not in syncMode)
    useEffect(() => {
        if (syncMode || activeAudio || speechCharIndex !== null) return;

        let index = 0;
        setIsDone(false);
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, index + 1));
            index++;
            if (index >= text.length) {
                clearInterval(interval);
                setIsDone(true);
            }
        }, 12);

        return () => clearInterval(interval);
    }, [text, activeAudio, speechCharIndex, syncMode]);

    return (
        <span>
            {displayedText}
            {!isDone && (displayedText.length > 0 || !syncMode) && <span className="typewriter-cursor">|</span>}
        </span>
    );
}

let whiskerionIntroPlayed = false;

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
                    <div
                        key={index}
                        className={`message oswald-bold ${msg.sender}-message`}
                        role="log"
                        aria-live="polite"
                    >
                        {msg.sender === 'bot' && index === messages.length - 1 ? (
                            <TypewriterText
                                text={msg.text}
                                activeAudio={messages.length > 1 ? activeAudio : null}
                                speechCharIndex={messages.length > 1 ? speechCharIndex : null}
                                syncMode={messages.length > 1}
                            />
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot-message loading-message-container">
                        <div className="running-cat-wrapper">
                            <svg className="running-cat" viewBox="0 0 100 40" aria-hidden="true">
                                <path d="M 33,20 C 33,26 31,30 27,33" className="cat-leg leg-bl" />
                                <path d="M 58,20 C 58,26 56,30 52,33" className="cat-leg leg-fl" />
                                <path d="M 30,16 C 22,12 16,24 10,14" className="cat-tail" />
                                <path d="M 30,15 Q 47,12 64,15 L 61,23 Q 47,25 32,23 Z" className="cat-torso" />
                                <g className="cat-head-group">
                                    <ellipse cx="68" cy="14" rx="7" ry="6" className="cat-face" />
                                    <polygon points="63,9 65,3 69,9" className="cat-ear" />
                                    <polygon points="71,9 73,3 77,9" className="cat-ear" />
                                    <circle cx="67" cy="13" r="1.2" fill="#ffea00" />
                                    <circle cx="71" cy="13" r="1.2" fill="#ffea00" />
                                </g>
                                <path d="M 37,20 C 37,26 39,30 43,33" className="cat-leg leg-br" />
                                <path d="M 62,20 C 62,26 64,30 68,33" className="cat-leg leg-fr" />
                            </svg>
                        </div>
                        <span className="loading-text">Whiskerion is pondering the cosmic strings...</span>
                    </div>
                )}
            </div>

            <div className="form-container">
                <form className="chat-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Seek, and find..."
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
