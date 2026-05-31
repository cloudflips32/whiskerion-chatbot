import React, { type RefObject } from 'react';

export function ChatInput({
    inputVal,
    setInputVal,
    handleSubmit,
    isButtonDisabled,
    inputRef
}: {
    inputVal: string;
    setInputVal: (val: string) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    isButtonDisabled: boolean;
    inputRef: RefObject<HTMLInputElement | null>;
}) {
    return (
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
    );
}
