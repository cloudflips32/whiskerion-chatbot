import { useState, useEffect } from 'react';
import { ChatPage } from './pages/ChatPage';
import { StarryBackground } from './components/StarryBackground';
import './App.css';

function App() {
    const [currentRoute, setCurrentRoute] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentRoute(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <>
            {/* Full-screen global animated space background */}
            <StarryBackground />

            {/* Render the chat view */}
            <ChatPage />
        </>
    );
}

export default App;