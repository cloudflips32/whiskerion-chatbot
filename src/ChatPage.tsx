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

function CosmicFlames({ cx, cy }: { cx: number; cy: number }) {
    return (
        <g transform={`translate(${cx}, ${cy}) scale(0.125)`} className="cosmic-flame-group">
            {/* Background glowing energy field */}
            <ellipse className="flame-glow-base" cx={0} cy={0} rx={65} ry={42} />

            {/* OUTER LAYER: Deep Red Flames (Back) */}
            <g className="fire-outer">
                {/* Tendril 1 (left) */}
                <path className="fire-tendril tendril-red-1" d="M -60,0 C -85,-30 -90,-80 -70,-110 C -55,-80 -45,-50 -35,-20 Z">
                    <animateTransform attributeName="transform" type="rotate" values="-5 0 0; 5 0 0; -5 0 0" dur="0.22s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="1 1; 0.95 1.05; 1 1" dur="0.18s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 2 (left-center) */}
                <path className="fire-tendril tendril-red-2" d="M -35,-20 C -55,-60 -50,-110 -25,-140 C -15,-100 -20,-60 -15,-25 Z">
                    <animateTransform attributeName="transform" type="rotate" values="4 0 0; -4 0 0; 4 0 0" dur="0.25s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.95 0.95; 1.05 1.1; 0.95 0.95" dur="0.2s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 3 (center) */}
                <path className="fire-tendril tendril-red-3" d="M -20,-28 C 0,-80 5,-150 15,-165 C 20,-120 5,-70 20,-28 Z">
                    <animateTransform attributeName="transform" type="rotate" values="-3 0 0; 3 0 0; -3 0 0" dur="0.19s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="1 1; 1 1.15; 1 1" dur="0.15s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 4 (right-center) */}
                <path className="fire-tendril tendril-red-4" d="M 15,-25 C 20,-60 15,-100 25,-140 C 45,-110 50,-60 30,-20 Z">
                    <animateTransform attributeName="transform" type="rotate" values="-4 0 0; 4 0 0; -4 0 0" dur="0.27s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.95 0.95; 1.05 1.08; 0.95 0.95" dur="0.21s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 5 (right) */}
                <path className="fire-tendril tendril-red-5" d="M 35,-20 C 45,-50 55,-80 70,-110 C 85,-80 80,-30 55,0 Z">
                    <animateTransform attributeName="transform" type="rotate" values="5 0 0; -5 0 0; 5 0 0" dur="0.21s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="1 1; 0.96 1.04; 1 1" dur="0.17s" additive="sum" repeatCount="indefinite" />
                </path>
            </g>

            {/* MIDDLE LAYER: Orange Flames (Middle) */}
            <g className="fire-middle">
                {/* Tendril 1 (left) */}
                <path className="fire-tendril tendril-orange-1" d="M -50,-5 C -70,-25 -75,-65 -60,-90 C -50,-65 -40,-45 -30,-15 Z">
                    <animateTransform attributeName="transform" type="rotate" values="-8 0 0; 6 0 0; -8 0 0" dur="0.17s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="1 1; 1.05 1.1; 1 1" dur="0.14s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 2 (center-left) */}
                <path className="fire-tendril tendril-orange-2" d="M -25,-15 C -40,-45 -35,-85 -15,-110 C -10,-80 -15,-45 -10,-20 Z">
                    <animateTransform attributeName="transform" type="rotate" values="6 0 0; -6 0 0; 6 0 0" dur="0.2s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.9 0.9; 1.1 1.2; 0.9 0.9" dur="0.16s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 3 (center-right) */}
                <path className="fire-tendril tendril-orange-3" d="M 10,-20 C 15,-45 10,-80 15,-110 C 30,-85 35,-45 20,-15 Z">
                    <animateTransform attributeName="transform" type="rotate" values="-6 0 0; 6 0 0; -6 0 0" dur="0.18s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.9 0.9; 1.1 1.18; 0.9 0.9" dur="0.15s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 4 (right) */}
                <path className="fire-tendril tendril-orange-4" d="M 30,-15 C 40,-45 50,-65 60,-90 C 70,-65 65,-25 45,-5 Z">
                    <animateTransform attributeName="transform" type="rotate" values="7 0 0; -7 0 0; 7 0 0" dur="0.19s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="1 1; 1.04 1.12; 1 1" dur="0.13s" additive="sum" repeatCount="indefinite" />
                </path>
            </g>

            {/* INNER LAYER: Golden Yellow Flames (Front) */}
            <g className="fire-inner">
                {/* Tendril 1 (center-left) */}
                <path className="fire-tendril tendril-yellow-1" d="M -20,-10 C -30,-30 -25,-60 -10,-80 C -5,-55 -10,-35 -5,-15 Z">
                    <animateTransform attributeName="transform" type="rotate" values="-10 0 0; 10 0 0; -10 0 0" dur="0.13s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.95 0.95; 1.1 1.25; 0.95 0.95" dur="0.11s" additive="sum" repeatCount="indefinite" />
                </path>
                {/* Tendril 2 (center-right) */}
                <path className="fire-tendril tendril-yellow-2" d="M 5,-15 C 10,-35 5,-55 10,-80 C 20,-60 25,-30 15,-10 Z">
                    <animateTransform attributeName="transform" type="rotate" values="10 0 0; -10 0 0; 10 0 0" dur="0.14s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.95 0.95; 1.1 1.22; 0.95 0.95" dur="0.12s" additive="sum" repeatCount="indefinite" />
                </path>
            </g>

            {/* Bottom smaller flames for full wrapper effect */}
            <path className="fire-tendril fire-bottom-1" d="M -45,15 C -60,25 -55,40 -40,30 C -25,20 -35,15 -45,15 Z">
                <animateTransform attributeName="transform" type="rotate" values="-5 0 0; 5 0 0; -5 0 0" dur="0.25s" repeatCount="indefinite" />
            </path>
            <path className="fire-tendril fire-bottom-2" d="M 45,15 C 60,25 55,40 40,30 C 25,20 35,15 45,15 Z">
                <animateTransform attributeName="transform" type="rotate" values="5 0 0; -5 0 0; 5 0 0" dur="0.23s" repeatCount="indefinite" />
            </path>

            {/* Spark particles */}
            <circle className="flame-spark spark-1" cx={-30} cy={-40} r={3} />
            <circle className="flame-spark spark-2" cx={10} cy={-60} r={2} />
            <circle className="flame-spark spark-3" cx={40} cy={-30} r={2.5} />
            <circle className="flame-spark spark-4" cx={-10} cy={-80} r={1.5} />
        </g>
    );
}


function InnerEars() {
    return (
        <g className="inner-ears">
            {/* Left Inner Ear Glows */}
            <polygon points="180,220 250,115 285,165" fill="url(#fire-outer-grad)" opacity={0.7} className="inner-ear-glow" />
            <polygon points="195,210 250,130 275,165" fill="url(#fire-mid-grad)" opacity={0.9} className="inner-ear-glow" />
            <polygon points="210,200 250,145 265,165" fill="url(#fire-inner-grad)" opacity={1} className="inner-ear-glow" />

            {/* Right Inner Ear Glows */}
            <polygon points="620,220 550,115 515,165" fill="url(#fire-outer-grad)" opacity={0.7} className="inner-ear-glow" />
            <polygon points="605,210 550,130 525,165" fill="url(#fire-mid-grad)" opacity={0.9} className="inner-ear-glow" />
            <polygon points="590,200 550,145 535,165" fill="url(#fire-inner-grad)" opacity={1} className="inner-ear-glow" />
        </g>
    );
}

function FieryWhiskers({ cx, cy, dir }: { cx: number; cy: number; dir: 'left' | 'right' }) {
    const isLeft = dir === 'left';
    const rotVals = isLeft ? "0 0 0; -3 0 0; 0 0 0" : "0 0 0; 3 0 0; 0 0 0";
    const dur = isLeft ? "2.6s" : "2.9s";
    return (
        <g transform={`translate(${cx}, ${cy})`} className="cat-whiskers-group">
            <g>
                <animateTransform attributeName="transform" type="rotate" values={rotVals} dur={dur} repeatCount="indefinite" />

                {/* Whisker 1 (top) */}
                <path className="cat-whisker" d={isLeft
                    ? "M 0,-8 C -50,-23 -120,-13 -180,17"
                    : "M 0,-8 C 50,-23 120,-13 180,17"
                } />

                {/* Whisker 2 (middle) */}
                <path className="cat-whisker" d={isLeft
                    ? "M -5,0 C -65,-3 -135,22 -190,57"
                    : "M 5,0 C 65,-3 135,22 190,57"
                } />

                {/* Whisker 3 (bottom) */}
                <path className="cat-whisker" d={isLeft
                    ? "M 0,9 C -60,17 -130,57 -175,102"
                    : "M 0,9 C 60,17 130,57 175,102"
                } />
            </g>
        </g>
    );
}

function GlowingNose() {
    return (
        <g className="cat-nose-group">
            {/* Glowing Nose */}
            <path className="cat-nose" d="M 390,340 L 410,340 C 410,340 405,355 400,358 C 395,355 390,340 390,340 Z" />
        </g>
    );
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
