import { useState, useEffect } from 'react';

export function TypewriterText({
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
