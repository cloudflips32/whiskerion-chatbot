import { useState, useEffect } from 'react';
import { ChatPage } from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
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

    const isAdmin = currentRoute === '#admin' || currentRoute === '#/admin';

    return (
        <>
            {/* Full-screen global animated space background */}
            <StarryBackground />

            {/* Render views based on route */}
            {isAdmin ? (
                <AdminPage />
            ) : (
                <ChatPage />
            )}
        </>
    );
}

export default App;