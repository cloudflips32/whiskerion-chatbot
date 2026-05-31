import { ChatPage } from './ChatPage';
import { StarryBackground } from './components/StarryBackground';
import './App.css';

function App() {
    return (
        <>
            {/* Full-screen global animated space background */}
            <StarryBackground />

            {/* Centered Floating Chatboard Dashboard */}
            <ChatPage />
        </>
    );
}

export default App;