import { useState } from 'react';
import './AuthPages.css';

function LoginPage({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('ALL FIELDS REQUIRED');
      return;
    }

    setIsLoading(true);

    // Simulate login delay for retro feel
    setTimeout(() => {
      // Check for admin credentials
      const isAdmin = username.toLowerCase() === 'admin' && password === 'admin123';
      
      // TODO: Implement actual authentication
      console.log('Login attempt:', { username, password, isAdmin });
      setIsLoading(false);
      onLogin({ username, role: isAdmin ? 'admin' : 'client' });
    }, 1500);
  };

  return (
    <div className="auth-page">
      {/* Animated retro background */}
      <div className="retro-bg">
        <div className="grid-lines"></div>
        <div className="floating-squares">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="square"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Login terminal */}
      <div className="auth-terminal">
        <div className="terminal-header">
          <div className="header-lights">
            <span className="light red"></span>
            <span className="light yellow"></span>
            <span className="light green blink"></span>
          </div>
          <div className="terminal-title">MARITIME NETWORK v2.4</div>
          <div className="system-time">{new Date().toLocaleTimeString()}</div>
        </div>

        <div className="terminal-screen">
          <div className="scanlines"></div>

          <div className="terminal-content">
            <div className="ascii-art">
              <pre>{`
    ___________
   /          /|
  /  SECURE  / |
 /__________/  |
 |          | /|
 |  ACCESS  |/ |
 |__________|  /
 |          | /
 |__________|/
              `}</pre>
            </div>

            <div className="terminal-text">
              <p className="prompt-line">&gt; SYSTEM: AUTHENTICATION REQUIRED</p>
              <p className="prompt-line">&gt; PROTOCOL: MARITIME-NET-SECURE</p>
              <p className="prompt-line blink-slow">&gt; AWAITING CREDENTIALS...</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-prefix">&gt;&gt;</span> USERNAME:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="retro-input"
                  autoComplete="username"
                  disabled={isLoading}
                  placeholder="ENTER_USERNAME"
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-prefix">&gt;&gt;</span> PASSWORD:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="retro-input"
                  autoComplete="current-password"
                  disabled={isLoading}
                  placeholder="********"
                  maxLength={50}
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠</span> ERROR: {error}
                </div>
              )}

              {isLoading && (
                <div className="loading-message">
                  <div className="loading-bar">
                    <div className="loading-progress"></div>
                  </div>
                  <p className="blink-fast">AUTHENTICATING...</p>
                </div>
              )}

              <div className="button-group">
                <button
                  type="submit"
                  className="retro-button primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'PROCESSING...' : '▶ LOGIN'}
                </button>
              </div>
            </form>

            <div className="terminal-footer">
              <div className="footer-line">
                <span className="prompt-char">&gt;</span> NEW USER?
                <button
                  onClick={onSwitchToRegister}
                  className="link-button"
                  disabled={isLoading}
                >
                  [REGISTER HERE]
                </button>
              </div>
              <div className="footer-line status-line">
                <span className="status-indicator"></span> SYSTEM STATUS: ONLINE
              </div>
              <div className="footer-line" style={{ fontSize: '11px', opacity: 0.6, marginTop: '10px' }}>
                <span className="prompt-char">&gt;</span> ADMIN ACCESS: admin / admin123
              </div>
            </div>
          </div>
        </div>

        <div className="terminal-base">
          <div className="base-brand">MARITIME NETWORKS INC.</div>
          <div className="base-serial">SN: MN-{Date.now().toString().slice(-8)}</div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
