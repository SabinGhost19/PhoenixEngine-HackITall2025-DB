import { useState } from 'react';
import './AuthPages.css';

function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(0);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('USERNAME REQUIRED');
      return false;
    }
    if (formData.username.length < 3) {
      setError('USERNAME TOO SHORT (MIN 3 CHARS)');
      return false;
    }
    if (!formData.email.trim()) {
      setError('EMAIL REQUIRED');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('INVALID EMAIL FORMAT');
      return false;
    }
    if (!formData.password) {
      setError('PASSWORD REQUIRED');
      return false;
    }
    if (formData.password.length < 6) {
      setError('PASSWORD TOO SHORT (MIN 6 CHARS)');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setRegistrationStep(1);

    // Simulate registration process with retro steps
    const steps = [
      'VERIFYING USERNAME...',
      'CHECKING EMAIL...',
      'ENCRYPTING PASSWORD...',
      'CREATING ACCOUNT...',
      'FINALIZING...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setRegistrationStep(i + 2);
    }

    setTimeout(() => {
      // TODO: Implement actual registration
      console.log('Registration:', formData);
      setIsLoading(false);
      onRegister({ username: formData.username, email: formData.email, role: 'client' });
    }, 500);
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

      {/* Register terminal */}
      <div className="auth-terminal register">
        <div className="terminal-header">
          <div className="header-lights">
            <span className="light red"></span>
            <span className="light yellow"></span>
            <span className="light green blink"></span>
          </div>
          <div className="terminal-title">NEW USER REGISTRATION v2.4</div>
          <div className="system-time">{new Date().toLocaleTimeString()}</div>
        </div>

        <div className="terminal-screen">
          <div className="scanlines"></div>

          <div className="terminal-content">
            <div className="ascii-art small">
              <pre>{`
  ╔══════════════╗
  ║   REGISTER   ║
  ║    NEW       ║
  ║   ACCOUNT    ║
  ╚══════════════╝
              `}</pre>
            </div>

            <div className="terminal-text">
              <p className="prompt-line">&gt; SYSTEM: ACCOUNT CREATION PROTOCOL</p>
              <p className="prompt-line">&gt; CLEARANCE: PUBLIC</p>
              <p className="prompt-line blink-slow">&gt; ENTER CREDENTIALS...</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-prefix">&gt;&gt;</span> USERNAME:
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="retro-input"
                  autoComplete="username"
                  disabled={isLoading}
                  placeholder="CHOOSE_USERNAME"
                  maxLength={20}
                />
                <div className="input-hint">MIN 3 CHARACTERS</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-prefix">&gt;&gt;</span> EMAIL:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="retro-input"
                  autoComplete="email"
                  disabled={isLoading}
                  placeholder="YOUR@EMAIL.COM"
                  maxLength={50}
                />
                <div className="input-hint">VALID EMAIL REQUIRED</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-prefix">&gt;&gt;</span> PASSWORD:
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="retro-input"
                  autoComplete="new-password"
                  disabled={isLoading}
                  placeholder="********"
                  maxLength={50}
                />
                <div className="input-hint">MIN 6 CHARACTERS</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-prefix">&gt;&gt;</span> CONFIRM:
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="retro-input"
                  autoComplete="new-password"
                  disabled={isLoading}
                  placeholder="********"
                  maxLength={50}
                />
                <div className="input-hint">RE-ENTER PASSWORD</div>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠</span> ERROR: {error}
                </div>
              )}

              {isLoading && (
                <div className="loading-message">
                  <div className="registration-steps">
                    {['VERIFY USERNAME', 'CHECK EMAIL', 'ENCRYPT PASSWORD', 'CREATE ACCOUNT', 'FINALIZE'].map((step, idx) => (
                      <div key={idx} className={`step ${registrationStep > idx + 1 ? 'complete' : ''} ${registrationStep === idx + 1 ? 'active' : ''}`}>
                        <span className="step-number">[{idx + 1}]</span>
                        <span className="step-text">{step}</span>
                        {registrationStep > idx + 1 && <span className="step-check">✓</span>}
                        {registrationStep === idx + 1 && <span className="step-loading blink-fast">...</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="button-group">
                <button
                  type="submit"
                  className="retro-button primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'PROCESSING...' : '▶ CREATE ACCOUNT'}
                </button>
              </div>
            </form>

            <div className="terminal-footer">
              <div className="footer-line">
                <span className="prompt-char">&gt;</span> ALREADY REGISTERED?
                <button
                  onClick={onSwitchToLogin}
                  className="link-button"
                  disabled={isLoading}
                >
                  [LOGIN HERE]
                </button>
              </div>
              <div className="footer-line status-line">
                <span className="status-indicator"></span> SYSTEM STATUS: ONLINE
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

export default RegisterPage;
