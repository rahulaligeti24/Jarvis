import '../styles/navbar.css'

function Navbar({ title, onToggleSidebar }) {
  return (
    <nav className="navbar">
      
      {/* LEFT SECTION */}
      <div className="navbar-left">
        <button
          className="global-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <h2 className="nav-title">{title}</h2>
      </div>

      {/* RIGHT SECTION */}
      <div className="navbar-right">
        <span className="status-pill">AI Assistant</span>
      </div>

    </nav>
  )
}

export default Navbar