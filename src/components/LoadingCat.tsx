export function LoadingCat() {
    return (
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
    );
}
