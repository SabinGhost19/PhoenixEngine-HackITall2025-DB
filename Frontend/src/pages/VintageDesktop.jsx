import { useState, useEffect, useRef } from 'react';
import './VintageDesktop.css';

function VintageDesktop({ onLogin, onRegister }) {
  const [activeExe, setActiveExe] = useState(null); // 'login' or 'register'
  const [terminalText, setTerminalText] = useState('');
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginProcessing, setLoginProcessing] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    alias: '',
    comms: '',
    passcode: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerProcessing, setRegisterProcessing] = useState(false);

  const terminalMessages = [
    'OVERRIDE_SEQUENCE_ALPHA',
    'ACCESS_GRANTED_LEVEL_7',
    'SYSTEM_CHECK_COMPLETE',
    'FIREWALL_BYPASSED',
    'ENCRYPTION_KEYS_LOADED'
  ];

  // Terminal typing animation
  useEffect(() => {
    if (!terminalVisible) return;

    const message = terminalMessages[Math.floor(Math.random() * terminalMessages.length)];
    let currentIndex = 0;
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (currentIndex <= message.length) {
        setTerminalText(message.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [terminalVisible]);

  // Show terminal after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginData.userId.trim() || !loginData.password.trim()) {
      setLoginError('ERROR: ALL FIELDS REQUIRED');
      return;
    }

    setLoginProcessing(true);
    setTimeout(() => {
      onLogin({ username: loginData.userId });
    }, 1500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerData.alias.trim() || !registerData.comms.trim() || !registerData.passcode.trim()) {
      setRegisterError('ERROR: ALL FIELDS REQUIRED');
      return;
    }

    if (registerData.passcode.length < 6) {
      setRegisterError('ERROR: PASSCODE TOO SHORT');
      return;
    }

    setRegisterProcessing(true);
    setTimeout(() => {
      onRegister({ username: registerData.alias, email: registerData.comms });
    }, 2000);
  };

  return (
    <div className="vintage-environment">
      {/* Physical desk/environment background */}
      <div className="desk-surface"></div>

      {/* CRT Monitor physical casing */}
      <div className="crt-monitor-casing">
        {/* Monitor bezel (front plastic frame) */}
        <div className="monitor-bezel">
          <div className="bezel-corner tl"></div>
          <div className="bezel-corner tr"></div>
          <div className="bezel-corner bl"></div>
          <div className="bezel-corner br"></div>

          {/* Brand label on bezel */}
          <div className="monitor-brand">DATASYS 2000</div>

          {/* The actual glass screen */}
          <div className="crt-glass-screen">
            {/* CRT curvature effect */}
            <div className="glass-curve"></div>

            {/* Screen burn-in permanent marks */}
            <div className="screen-burnin"></div>

            {/* Amber phosphor glow layer */}
            <div className="phosphor-layer">
              {/* Scanlines */}
              <div className="scanlines-amber"></div>

              {/* Film grain */}
              <div className="film-grain"></div>

              {/* The actual desktop interface */}
              <div className="desktop-interface">
                {/* Desktop background */}
                <div className="desktop-bg"></div>

                {/* Left side: Executable icons */}
                <div className="desktop-icons">
                  {/* LOGIN.EXE */}
                  <div
                    className={`exe-icon ${activeExe === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveExe(activeExe === 'login' ? null : 'login')}
                  >
                    <div className="floppy-disk-icon">
                      <div className="disk-label"></div>
                      <div className="disk-metal"></div>
                      <div className="disk-window"></div>
                    </div>
                    <div className="icon-label">LOGIN.EXE</div>
                  </div>

                  {/* REGISTER.EXE */}
                  <div
                    className={`exe-icon ${activeExe === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveExe(activeExe === 'register' ? null : 'register')}
                  >
                    <div className="floppy-disk-icon">
                      <div className="disk-label"></div>
                      <div className="disk-metal"></div>
                      <div className="disk-window"></div>
                    </div>
                    <div className="icon-label">REGISTER.EXE</div>
                  </div>
                </div>

                {/* Login form window */}
                {activeExe === 'login' && (
                  <div className="gui-window login-window">
                    <div className="window-titlebar">
                      <span className="window-title">LOGIN.EXE</span>
                      <button className="window-close" onClick={() => setActiveExe(null)}>
                        [X]
                      </button>
                    </div>
                    <div className="window-content">
                      <form onSubmit={handleLoginSubmit}>
                        <div className="gui-field">
                          <label className="gui-label">USER ID:</label>
                          <input
                            type="text"
                            className="gui-input"
                            value={loginData.userId}
                            onChange={(e) =>
                              setLoginData({ ...loginData, userId: e.target.value })
                            }
                            disabled={loginProcessing}
                            maxLength={16}
                          />
                        </div>

                        <div className="gui-field">
                          <label className="gui-label">PASSWORD:</label>
                          <input
                            type="password"
                            className="gui-input"
                            value={loginData.password}
                            onChange={(e) =>
                              setLoginData({ ...loginData, password: e.target.value })
                            }
                            disabled={loginProcessing}
                            maxLength={16}
                          />
                        </div>

                        {loginError && <div className="gui-error">{loginError}</div>}

                        {loginProcessing && (
                          <div className="gui-processing">
                            <div className="processing-bar"></div>
                            <div className="processing-text">AUTHENTICATING...</div>
                          </div>
                        )}

                        <button type="submit" className="gui-button" disabled={loginProcessing}>
                          [EXECUTE]
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Register form window */}
                {activeExe === 'register' && (
                  <div className="gui-window register-window">
                    <div className="window-titlebar">
                      <span className="window-title">REGISTER.EXE</span>
                      <button className="window-close" onClick={() => setActiveExe(null)}>
                        [X]
                      </button>
                    </div>
                    <div className="window-content">
                      <form onSubmit={handleRegisterSubmit}>
                        <div className="gui-field">
                          <label className="gui-label">NEW ALIAS:</label>
                          <input
                            type="text"
                            className="gui-input"
                            value={registerData.alias}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, alias: e.target.value })
                            }
                            disabled={registerProcessing}
                            maxLength={16}
                          />
                        </div>

                        <div className="gui-field">
                          <label className="gui-label">CONTACT COMMS:</label>
                          <input
                            type="text"
                            className="gui-input"
                            value={registerData.comms}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, comms: e.target.value })
                            }
                            disabled={registerProcessing}
                            maxLength={32}
                          />
                        </div>

                        <div className="gui-field">
                          <label className="gui-label">SET PASSCODE:</label>
                          <input
                            type="password"
                            className="gui-input"
                            value={registerData.passcode}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, passcode: e.target.value })
                            }
                            disabled={registerProcessing}
                            maxLength={16}
                          />
                        </div>

                        {registerError && <div className="gui-error">{registerError}</div>}

                        {registerProcessing && (
                          <div className="gui-processing">
                            <div className="processing-bar"></div>
                            <div className="processing-text">CREATING ACCOUNT...</div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="gui-button"
                          disabled={registerProcessing}
                        >
                          [EXECUTE]
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Terminal window (bottom right) */}
                {terminalVisible && (
                  <div className="terminal-window">
                    <div className="terminal-titlebar">C:\ROOT\ADMIN_GATEWAY</div>
                    <div className="terminal-content">
                      <div className="terminal-line">
                        <span className="terminal-prompt">C:\ROOT\ADMIN_GATEWAY&gt; </span>
                        <span className="terminal-command">{terminalText}</span>
                        {isTyping && <span className="terminal-cursor">_</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Glass reflection overlay */}
            <div className="glass-reflection"></div>
          </div>

          {/* Power LED indicator */}
          <div className="power-led"></div>
        </div>

        {/* Monitor stand */}
        <div className="monitor-stand"></div>
      </div>

      {/* Desk clutter hints */}
      <div className="desk-clutter">
        <div className="keyboard-shadow"></div>
        <div className="cable-tangle"></div>
      </div>
    </div>
  );
}

export default VintageDesktop;
