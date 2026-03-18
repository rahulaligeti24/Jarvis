import { useState, useEffect } from 'react'
import ChatInput from './components/ChatInput'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { authService } from '../src/services/authService'

const BACKEND_URL = "http://localhost:5000"

function App() {
  const [conversations, setConversations] = useState([])
  const [learnings, setLearnings] = useState([])
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isLogged = authService.isLoggedIn();
        
        if (!isLogged) {
          // Create guest user
          const result = await authService.guestSignup();
          if (result.success) {
            setIsLoggedIn(true);
          }
        } else {
          setIsLoggedIn(true);
        }

        // Fetch user learnings
        fetchLearnings();
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [])

  const fetchLearnings = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${BACKEND_URL}/api/learnings`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLearnings(data.learnings || []);
      }
    } catch (err) {
      console.error("Failed to fetch learnings:", err);
    }
  };

  const handleSendMessage = (conversationData) => {
    setConversations((prev) => [conversationData, ...prev]);
    // Refresh learnings after new conversation
    setTimeout(fetchLearnings, 1000);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setConversations([]);
    setLearnings([]);
  };

  if (loading) {
    return <div style={{ color: "#00e5ff", padding: "20px" }}>Initializing...</div>;
  }

  if (!isLoggedIn) {
    return <div style={{ color: "#ff6b6b", padding: "20px" }}>Authentication failed</div>;
  }

  return (
    <div className="app-container">
      <Navbar onLogout={handleLogout} />
      <div className="main-content">
        <Sidebar conversations={conversations} learnings={learnings} />
        <div className="chat-area">
          <div className="conversation-history">
            {conversations.length === 0 ? (
              <div style={{ color: "rgba(0,229,255,0.5)", textAlign: "center", padding: "40px" }}>
                Start a conversation with JARVIS
              </div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id} className="message-pair">
                  <div className="user-msg">
                    <strong>You:</strong> {conv.userMessage}
                  </div>
                  <div className="ai-msg">
                    <strong>JARVIS:</strong> {conv.aiResponse}
                  </div>
                  {conv.tags && conv.tags.length > 0 && (
                    <div className="tags-container">
                      {conv.tags.map((tag) => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="msg-metadata">
                    Relevance: {conv.topRelevance} | Context: {conv.relevantContext}
                  </div>
                </div>
              ))
            )}
          </div>
          <ChatInput 
            onSendMessage={handleSendMessage}
            category={category}
          />
        </div>
      </div>
    </div>
  )
}

export default App