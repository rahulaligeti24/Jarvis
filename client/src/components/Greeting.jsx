import '../styles/dashboard.css'

function Greeting() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="greeting-section">
      <h1 className="greeting-title">{getGreeting()}</h1>
      <p className="greeting-subtitle">What would you like to explore today?</p>
    </div>
  )
}

export default Greeting