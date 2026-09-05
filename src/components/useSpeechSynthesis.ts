import { useCallback, useEffect, useRef, useState } from 'react';

// Safely access Vite environment variables or Node/fallback variables
const elevenLabsApiKey = String(import.meta.env.VITE_ELEVENLABS_API_KEY || "") ||
    (typeof process !== 'undefined' ? process.env.ELEVENLABS_API_KEY || "" : "");

const elevenLabsVoiceId = String(import.meta.env.VITE_ELEVENLABS_VOICE_ID || "pNInz6obpgDQ51u76XYj") ||
    (typeof process !== 'undefined' ? process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQ51u76XYj" : "pNInz6obpgDQ51u76XYj");

let whiskerionIntroPlayed = false;

export function useSpeechSynthesis() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
    const [speechCharIndex, setSpeechCharIndex] = useState<number | null>(null);

    const stopAllAudio = useCallback(() => {
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
    }, []);

    const speakText = useCallback(async (text: string) => {
        // Reset sync states
        setActiveAudio(null);
        setSpeechCharIndex(null);

        // Stop any currently playing audio / speech
        stopAllAudio();

        // Clean text to avoid reading out punctuation patterns (markdown)
        const cleanedText = text.replace(/[*#_`~]/g, '');

        // Check if ElevenLabs credentials exist
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

        // Fallback to native Web Speech API
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
    }, [stopAllAudio]);

    // Play the greeting audio file strictly 2 seconds after page loads,
    // regardless of user interaction, once per session
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

            stopAllAudio();

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
            stopAllAudio();
        };
    }, [stopAllAudio]);

    return { activeAudio, speechCharIndex, speakText };
}