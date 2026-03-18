import { useState } from 'react'
import '../styles/sidebar.css'

function Sidebar({ isOpen, chats, activeChatId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, onToggleSidebar }) {
  const [renamingChatId, setRenamingChatId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenuChatId, setContextMenuChatId] = useState(null)

  const handleRenameStart = (chatId, currentTitle) => {
    setRenamingChatId(chatId)
    setRenameValue(currentTitle)
  }

  const handleRenameSave = (chatId) => {
    if (renameValue.trim()) {
      onRenameChat(chatId, renameValue)
    }
    setRenamingChatId(null)
    setRenameValue('')
    setContextMenuChatId(null)
  }

  const handleRenameCancel = () => {
    setRenamingChatId(null)
    setRenameValue('')
    setContextMenuChatId(null)
  }

  const handleDelete = (chatId) => {
    onDeleteChat(chatId)
    setContextMenuChatId(null)
  }
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">🎤</div>
          <div className="logo-text">Friday</div>
        </div>

      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <span className="btn-icon">+</span>
        New Chat
      </button>

      <div className="history-section">
        <div className="history-label">Chats</div>
        <div className="chat-list">
          {chats.length === 0 ? (
            <div className="history-empty">No conversations yet</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="chat-item-wrapper"
              >
                {renamingChatId === chat.id ? (
                  <div className="chat-rename-field">
                    <input
                      type="text"
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameSave(chat.id)
                        } else if (e.key === 'Escape') {
                          handleRenameCancel()
                        }
                      }}
                      autoFocus
                    />
                    <button
                      className="rename-confirm"
                      onClick={() => handleRenameSave(chat.id)}
                      title="Save"
                    >
                      OK
                    </button>
                    <button
                      className="rename-cancel"
                      onClick={handleRenameCancel}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <span className="chat-icon">💬</span>
                      <span className="chat-title">{chat.title}</span>
                    </button>
                    <button
                      className="chat-menu-btn"
                      onClick={() => setContextMenuChatId(contextMenuChatId === chat.id ? null : chat.id)}
                      title="Options"
                    >
                      ⋯
                    </button>
                    {contextMenuChatId === chat.id && (
                      <div className="chat-context-menu">
                        <button
                          className="context-menu-item rename-item"
                          onClick={() => handleRenameStart(chat.id, chat.title)}
                          title="Rename chat"
                        >
                          <span className="context-icon">✏️</span>
                          Rename
                        </button>
                        <button
                          className="context-menu-item delete-item"
                          onClick={() => handleDelete(chat.id)}
                          title="Delete chat"
                        >
                          <span className="context-icon">🗑️</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="footer-btn">
          <span className="icon">⚙️</span>
          <span>Settings</span>
        </button>
        <button className="profile-btn" aria-label="User profile">
          <span className="profile-avatar">U</span>
          <span className="profile-meta">
            <span className="profile-name">User</span>
            <span className="profile-status">Signed in</span>
          </span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar