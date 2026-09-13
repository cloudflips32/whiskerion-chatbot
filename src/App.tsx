import { useEffect } from 'react';
import { ChatPage } from './pages/ChatPage';
import { StarryBackground } from './components/StarryBackground';
import './App.css';

function App() {
    useEffect(() => {
        const handleHashChange = () => {
            // Route changes are handled by the ChatPage via the hash.
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