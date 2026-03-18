import { useRef, useState } from 'react'
import '../styles/dashboard.css'

const BACKEND_URL = "http://localhost:5000";

function ChatInput({ onSendMessage, category = "general" }) {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)
  const isRecordingRef = useRef(false)
  const recognitionRef = useRef(null)

  const updateHeight = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 168)}px`
  }

  const sendToBackend = async (text) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Please login first");
      return;
    }

    setIsProcessing(true)
    setError('')

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          category: category
        }),
      })

      const data = await res.json()

      if (data.success) {
        onSendMessage({
          id: data.conversationId,
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          tags: data.tags,
          relevantContext: data.relevantContext,
          topRelevance: data.topRelevance,
          timestamp: new Date().toLocaleTimeString()
        })
      } else {
        setError(data.error || "Failed to send message")
      }
    } catch (err) {
      console.error("Backend error:", err)
      setError("Could not connect to server")
    } finally {
      setIsProcessing(false)
    }
  }

  const submit = async () => {
    const text = message.trim()
    if (!text) return
    
    setMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await sendToBackend(text)
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in your browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setError('')
      isRecordingRef.current = true
    }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' '
      }
      setMessage(transcript.trim())
      updateHeight()
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError('Speech recognition error: ' + event.error)
      }
    }

    recognition.onend = () => {
      if (isRecordingRef.current) {
        recognition.start()
      } else {
        isRecordingRef.current = false
      }
    }

    recognition.start()
    recognitionRef.current = recognition
  }

  const stopVoiceInput = () => {
    isRecordingRef.current = false
    recognitionRef.current?.stop()
  }

  return (
    <div className="chat-input-container">
      {error && (
        <div style={{
          color: '#ff6b6b',
          fontSize: '12px',
          padding: '8px',
          background: 'rgba(255,50,50,0.1)',
          borderRadius: '4px',
          marginBottom: '8px',
          fontFamily: "'Share Tech Mono', monospace"
        }}>
          {error}
        </div>
      )}
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={isRecordingRef.current ? "Listening... speak now" : "Message JARVIS"}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            updateHeight()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows="1"
          disabled={isProcessing}
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={!message.trim() || isProcessing}
          title="Send message"
        >
          <span className="send-icon">{isProcessing ? "..." : ">"}</span>
        </button>
        <button
          className="voice-btn"
          onClick={isRecordingRef.current ? stopVoiceInput : handleVoiceInput}
          title={isRecordingRef.current ? "Stop recording" : "Voice input"}
          style={isRecordingRef.current ? { opacity: 0.6, background: 'rgba(255,77,77,0.2)' } : {}}
        >
          <span className="voice-icon">{isRecordingRef.current ? "🔴" : "🎤"}</span>
        </button>
      </div>
    </div>
  )
}

export default ChatInput