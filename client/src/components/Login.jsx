import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client validation
    if (isLogin) {
      if (!formData.email.trim()) {
        setError('Email is required')
        setLoading(false)
        return
      }
      if (!formData.password) {
        setError('Password is required')
        setLoading(false)
        return
      }
    } else {
      if (!formData.name.trim()) {
        setError('Name is required')
        setLoading(false)
        return
      }
      if (!formData.email.trim()) {
        setError('Email is required')
        setLoading(false)
        return
      }
      if (!formData.password) {
        setError('Password is required')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email')
        setLoading(false)
        return
      }
    }

    try {
      let result
      if (isLogin) {
        result = await authService.login(formData.email, formData.password)
      } else {
        result = await authService.signup(formData.name, formData.email, formData.password)
      }

      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || (isLogin ? 'Login failed' : 'Signup failed'))
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await authService.guestSignup()
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Failed to continue as guest')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">JARVIS</h1>
          <p className="auth-subtitle">AI Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-toggle">
            <button
              type="button"
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true)
                setError('')
                setFormData({ name: '', email: '', password: '' })
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false)
                setError('')
                setFormData({ name: '', email: '', password: '' })
              }}
            >
              Signup
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          onClick={handleGuestLogin}
          className="guest-btn"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Continue as Guest'}
        </button>

        <p className="auth-footer">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setFormData({ name: '', email: '', password: '' })
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login