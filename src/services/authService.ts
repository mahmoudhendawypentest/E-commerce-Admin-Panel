// Enhanced Authentication & Security Service

// Valid admin credentials (in production, this would be on a secure backend)
const VALID_USERS_KEY = 'registered_users';
const getValidUsers = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return [
      { email: 'admin@example.com', passwordHash: 'admin123' },
      { email: 'manager@example.com', passwordHash: 'manager123' },
    ];
  }

  const stored = localStorage.getItem(VALID_USERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [
        { email: 'admin@example.com', passwordHash: 'admin123' },
        { email: 'manager@example.com', passwordHash: 'manager123' },
      ];
    }
  }
  return [
    { email: 'admin@example.com', passwordHash: 'admin123' },
    { email: 'manager@example.com', passwordHash: 'manager123' },
  ];
};

const saveValidUsers = (users: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(VALID_USERS_KEY, JSON.stringify(users));
  }
};

// Rate limiting
const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface LoginAttempt {
  timestamp: number;
  count: number;
}

// Simple password hashing (NOT suitable for production - use bcrypt on backend)
export const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

// Check if user is rate limited
export const isRateLimited = (email: string): boolean => {
  const key = `${LOGIN_ATTEMPTS_KEY}_${email}`;
  const attemptsStr = localStorage.getItem(key);

  if (!attemptsStr) {
    return false;
  }

  try {
    const attempts: LoginAttempt = JSON.parse(attemptsStr);
    const now = Date.now();
    const timePassed = now - attempts.timestamp;

    if (timePassed > RATE_LIMIT_WINDOW) {
      // Window expired, reset attempts
      localStorage.removeItem(key);
      return false;
    }

    return attempts.count >= MAX_ATTEMPTS;
  } catch {
    return false;
  }
};

// Record login attempt
export const recordLoginAttempt = (email: string, success: boolean): void => {
  if (success) {
    // Clear attempts on successful login
    localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    return;
  }

  const key = `${LOGIN_ATTEMPTS_KEY}_${email}`;
  const attemptsStr = localStorage.getItem(key);
  const now = Date.now();

  try {
    let attempts: LoginAttempt = { timestamp: now, count: 1 };

    if (attemptsStr) {
      const parsed = JSON.parse(attemptsStr);
      if (now - parsed.timestamp < RATE_LIMIT_WINDOW) {
        attempts.count = parsed.count + 1;
        attempts.timestamp = parsed.timestamp;
      }
    }

    localStorage.setItem(key, JSON.stringify(attempts));
  } catch (e) {
    console.error('Error recording login attempt', e);
  }
};

// Get remaining attempts
export const getRemainingAttempts = (email: string): number => {
  const key = `${LOGIN_ATTEMPTS_KEY}_${email}`;
  const attemptsStr = localStorage.getItem(key);

  if (!attemptsStr) {
    return MAX_ATTEMPTS;
  }

  try {
    const attempts: LoginAttempt = JSON.parse(attemptsStr);
    const now = Date.now();
    const timePassed = now - attempts.timestamp;

    if (timePassed > RATE_LIMIT_WINDOW) {
      return MAX_ATTEMPTS;
    }

    return Math.max(0, MAX_ATTEMPTS - attempts.count);
  } catch {
    return MAX_ATTEMPTS;
  }
};

// Register a new user
export const registerUser = (email: string, password: string): { success: boolean; message: string } => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  if (typeof window !== 'undefined') {
    const users = getValidUsers();

    // Check if user already exists
    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Add new user
    users.push({ email: email.toLowerCase(), passwordHash: password });
    saveValidUsers(users);
  }

  return { success: true, message: 'Account created successfully' };
};

// Enhanced authentication with proper validation
export const authenticateUser = (email: string, password: string): boolean => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check if user exists and password matches
  const users = getValidUsers();
  const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return false;
  }

  // Simple password check (in production, use bcrypt comparison)
  return user.passwordHash === password;
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  const token = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  localStorage.setItem('csrf_token', token);
  return token;
};

// Verify CSRF token
export const verifyCSRFToken = (token: string): boolean => {
  const stored = localStorage.getItem('csrf_token');
  return stored === token;
};

// Session management
export const createSession = (email: string): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const sessionData = {
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };

  localStorage.setItem(sessionId, JSON.stringify(sessionData));
  localStorage.setItem('currentSession', sessionId);
  return sessionId;
};

// Check if session is still valid
export const isSessionValid = (): boolean => {
  const sessionId = localStorage.getItem('currentSession');
  if (!sessionId) return false;

  try {
    const sessionData = localStorage.getItem(sessionId);
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    const now = Date.now();

    return now < session.expiresAt;
  } catch {
    return false;
  }
};

// Clear session
export const clearSession = (): void => {
  const sessionId = localStorage.getItem('currentSession');
  if (sessionId) {
    localStorage.removeItem(sessionId);
  }
  localStorage.removeItem('currentSession');
};

// Get session email
export const getSessionEmail = (): string | null => {
  const sessionId = localStorage.getItem('currentSession');
  if (!sessionId) return null;

  try {
    const sessionData = localStorage.getItem(sessionId);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session.email;
  } catch {
    return null;
  }
};