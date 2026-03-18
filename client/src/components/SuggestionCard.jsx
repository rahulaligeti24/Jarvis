import '../styles/dashboard.css'

function SuggestionCard({ icon, title, description }) {
  return (
    <button className="suggestion-card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
      <div className="card-arrow">-&gt;</div>
    </button>
  )
}

export default SuggestionCard;