const BACKEND_URL = "http://localhost:5000";

export const authService = {
  // Signup
  signup: async (name, email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
    }
    return data;
  },

  // Login
  login: async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
    }
    return data;
  },

  // Guest signup
  guestSignup: async () => {
    const res = await fetch(`${BACKEND_URL}/api/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Guest User",
        email: `guest-${Date.now()}@jarvis.local`
      })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
    }
    return data;
  },

  // Get token
  getToken: () => localStorage.getItem("token"),

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  },

  // Check if logged in
  isLoggedIn: () => !!localStorage.getItem("token")
};