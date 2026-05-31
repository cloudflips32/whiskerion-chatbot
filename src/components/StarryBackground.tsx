// Generate static list of 100 stars for the entire viewport background
const stars = Array.from({ length: 100 }).map((_, index) => {
    const size = Math.random() * 2.5 + 1; // 1px to 3.5px
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const duration = Math.random() * 3 + 2; // 2s to 5s
    const delay = Math.random() * 5; // 0s to 5s
    return {
        id: index,
        style: {
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
        }
    };
});

// Generate static list of 5 meteors for the entire viewport background
const meteors = Array.from({ length: 5 }).map((_, index) => {
    const top = Math.random() * 50; // 0% to 50% from top
    const duration = Math.random() * 2 + 3; // 3s to 5s travel time
    const delay = Math.random() * 15; // 0s to 15s delay
    return {
        id: index,
        style: {
            top: `${top}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
        }
    };
});

export function StarryBackground() {
    return (
        <div className="space-background">
            {stars.map(star => (
                <div key={star.id} className="star" style={star.style} />
            ))}
            {meteors.map(meteor => (
                <div key={meteor.id} className="meteor" style={meteor.style} />
            ))}
        </div>
    );
}
