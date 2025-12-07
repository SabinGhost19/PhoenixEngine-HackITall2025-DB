import { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';
import './RealisticCRT.css';

function RealisticCRT({ onLogin, onRegister }) {
  const [activeExe, setActiveExe] = useState(null);
  const [terminalText, setTerminalText] = useState('');
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginProcessing, setLoginProcessing] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerProcessing, setRegisterProcessing] = useState(false);

  const terminalMessages = [
    "RRR's DevOps App\nModernize your legacy code!"
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

  // Show terminal after delay
  useEffect(() => {
    const timer = setTimeout(() => setTerminalVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError('ERROR: ALL FIELDS REQUIRED');
      return;
    }

    setLoginProcessing(true);

    try {
      const userData = await loginUser(loginData.username, loginData.password);
      onLogin(userData); // userData contains: { username, role, token?, email? }
    } catch (error) {
      setLoginError(`ERROR: ${error.message.toUpperCase()}`);
      setLoginProcessing(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerData.username.trim() || !registerData.email.trim() || !registerData.password.trim()) {
      setRegisterError('ERROR: ALL FIELDS REQUIRED');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('ERROR: PASSWORD TOO SHORT');
      return;
    }

    setRegisterProcessing(true);

    try {
      const userData = await registerUser(registerData.username, registerData.email, registerData.password);
      onRegister(userData); // userData contains: { username, role, email, token? }
    } catch (error) {
      setRegisterError(`ERROR: ${error.message.toUpperCase()}`);
      setRegisterProcessing(false);
    }
  };

  return (
    <div className="realistic-environment">
      {/* Photo-realistic desk environment */}
      <div className="photo-desk">
        {/* Optional: Add your own CRT monitor photo here */}
        {/* <img src="/path-to-your-crt-photo.jpg" alt="CRT Monitor" className="desk-photo" /> */}
      </div>

      {/* MIGRATION VISUAL METAPHOR */}
      
      {/* Left Side: Old Technologies Being Drawn In */}
      <div className="legacy-tech-cluster">
        {/* Old Tech Icons/Logos */}
        <div className="tech-icon legacy-icon" style={{ top: '10%', left: '5%' }}>
          <div className="icon-frame aged">
            <span className="icon-text">COBOL</span>
          </div>
        </div>
        <div className="tech-icon legacy-icon" style={{ top: '25%', left: '8%' }}>
          <div className="icon-frame aged">
            <span className="icon-text">FORTRAN</span>
          </div>
        </div>
        <div className="tech-icon legacy-icon" style={{ top: '40%', left: '3%' }}>
          <div className="icon-frame aged floppy">
            <div className="floppy-disk-old"></div>
          </div>
        </div>
        <div className="tech-icon legacy-icon" style={{ top: '55%', left: '10%' }}>
          <div className="icon-frame aged">
            <span className="icon-text">PERL</span>
          </div>
        </div>
        <div className="tech-icon legacy-icon" style={{ top: '70%', left: '6%' }}>
          <div className="icon-frame aged">
            <span className="icon-text">VB6</span>
          </div>
        </div>
        
        {/* Flowing Light Streams Into Monitor */}
        <svg className="flow-streams-left" viewBox="0 0 400 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowGradientLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#8b7355', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#d4a574', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#d4a574', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M 50 60 Q 200 100, 380 280" stroke="url(#flowGradientLeft)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M 80 150 Q 220 200, 380 300" stroke="url(#flowGradientLeft)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.5s" repeatCount="indefinite"/>
          </path>
          <path d="M 60 240 Q 200 280, 380 320" stroke="url(#flowGradientLeft)" strokeWidth="3" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.8s" repeatCount="indefinite"/>
          </path>
          <path d="M 90 330 Q 220 350, 380 340" stroke="url(#flowGradientLeft)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="3.2s" repeatCount="indefinite"/>
          </path>
          <path d="M 70 420 Q 210 400, 380 360" stroke="url(#flowGradientLeft)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.7s" repeatCount="indefinite"/>
          </path>
        </svg>
        
        {/* Motion Blur Particles */}
        <div className="particle-flow left-flow">
          <div className="particle" style={{ top: '15%', animationDelay: '0s' }}></div>
          <div className="particle" style={{ top: '30%', animationDelay: '0.5s' }}></div>
          <div className="particle" style={{ top: '45%', animationDelay: '1s' }}></div>
          <div className="particle" style={{ top: '60%', animationDelay: '1.5s' }}></div>
          <div className="particle" style={{ top: '75%', animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Right Side: Modern Technologies Emerging */}
      <div className="modern-tech-cluster">
        {/* Modern Tech Icons/Logos */}
        <div className="tech-icon modern-icon" style={{ top: '15%', right: '5%' }}>
          <div className="icon-frame modern">
            <span className="icon-text">DOCKER</span>
          </div>
        </div>
        <div className="tech-icon modern-icon" style={{ top: '30%', right: '8%' }}>
          <div className="icon-frame modern">
            <span className="icon-text">K8S</span>
          </div>
        </div>
        <div className="tech-icon modern-icon" style={{ top: '45%', right: '4%' }}>
          <div className="icon-frame modern">
            <span className="icon-text">RUST</span>
          </div>
        </div>
        <div className="tech-icon modern-icon" style={{ top: '60%', right: '9%' }}>
          <div className="icon-frame modern">
            <span className="icon-text">GO</span>
          </div>
        </div>
        <div className="tech-icon modern-icon" style={{ top: '75%', right: '6%' }}>
          <div className="icon-frame modern">
            <span className="icon-text">REACT</span>
          </div>
        </div>
        
        {/* Flowing Light Streams Out of Monitor */}
        <svg className="flow-streams-right" viewBox="0 0 400 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#00d9ff', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#4af2ff', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#00d9ff', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M 20 280 Q 200 100, 350 90" stroke="url(#flowGradientRight)" strokeWidth="3" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.5s" repeatCount="indefinite"/>
          </path>
          <path d="M 20 300 Q 180 180, 320 180" stroke="url(#flowGradientRight)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.8s" repeatCount="indefinite"/>
          </path>
          <path d="M 20 320 Q 200 270, 340 270" stroke="url(#flowGradientRight)" strokeWidth="3" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.3s" repeatCount="indefinite"/>
          </path>
          <path d="M 20 340 Q 180 360, 330 360" stroke="url(#flowGradientRight)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M 20 360 Q 200 420, 350 450" stroke="url(#flowGradientRight)" strokeWidth="2" fill="none" strokeDasharray="10,5">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.6s" repeatCount="indefinite"/>
          </path>
        </svg>
        
        {/* Modern Glow Particles */}
        <div className="particle-flow right-flow">
          <div className="particle modern" style={{ top: '20%', animationDelay: '0s' }}></div>
          <div className="particle modern" style={{ top: '35%', animationDelay: '0.6s' }}></div>
          <div className="particle modern" style={{ top: '50%', animationDelay: '1.2s' }}></div>
          <div className="particle modern" style={{ top: '65%', animationDelay: '1.8s' }}></div>
          <div className="particle modern" style={{ top: '80%', animationDelay: '2.4s' }}></div>
        </div>
      </div>

      {/* Realistic monitor container */}
      <div className="realistic-monitor">
        {/* Monitor housing with realistic texture */}
        <div className="monitor-housing">
          {/* Yellowed plastic texture overlay */}
          <div className="plastic-yellowing"></div>
          <div className="dust-layer"></div>

          {/* Corner mounting screws */}
          <div className="corner-screw" style={{ top: '15px', left: '15px' }}></div>
          <div className="corner-screw" style={{ top: '15px', right: '15px' }}></div>
          <div className="corner-screw" style={{ bottom: '15px', left: '15px' }}></div>
          <div className="corner-screw" style={{ bottom: '15px', right: '15px' }}></div>

          {/* Ventilation grills */}
          <div className="vent-grill top-vent"></div>
          <div className="vent-grill bottom-vent"></div>

          {/* Worn edges and scratches */}
          <div className="frame-wear"></div>
          <div className="scratch-marks"></div>

          {/* Sticker remnants */}
          <div className="sticker sticker-1"></div>
          <div className="sticker sticker-2"></div>
          <div className="sticker sticker-3"></div>

          {/* Enhanced brand plate with embossed effect */}
          <div className="brand-plate">
            <div className="brand-emboss">
              <span className="brand-text">COMMODORE</span>
              <span className="model-text">1084S • EST. 1985</span>
            </div>
          </div>

          {/* Control knobs */}
          <div className="control-panel">
            <div className="control-knob brightness-knob">
              <div className="knob-indicator"></div>
              <span className="knob-label">BRIGHT</span>
            </div>
            <div className="control-knob contrast-knob">
              <div className="knob-indicator"></div>
              <span className="knob-label">CONTR</span>
            </div>
          </div>

          {/* Enhanced power section */}
          <div className="power-section">
            <div className="power-button">
              <div className="button-inner"></div>
            </div>
            <div className="power-led-realistic"></div>
            <span className="power-label">POWER</span>
          </div>

          {/* The actual CRT screen area */}
          <div className="crt-screen-realistic">
            {/* Glass curvature and reflections */}
            <div className="glass-curvature">
              <div className="curved-reflection"></div>
            </div>

            {/* Screen glow/bloom effect */}
            <div className="screen-glow"></div>

            {/* Burn-in layer */}
            <div className="permanent-burnin">
              <div className="burnin-pattern"></div>
            </div>

            {/* Phosphor display layer */}
            <div className="phosphor-display">
              {/* Transformation Effect Inside Monitor */}
              <div className="transformation-effect">
                <div className="morph-layer"></div>
                <div className="conversion-glow"></div>
                <div className="pixel-morph"></div>
              </div>
              
              {/* Scanline overlay */}
              <div className="realistic-scanlines"></div>

              {/* Heavy film grain */}
              <div className="heavy-grain"></div>

              {/* CRT flicker */}
              <div className="crt-flicker"></div>

              {/* The interactive content */}
              <div className="screen-content">
                {/* Windows XP Desktop */}
                <div className="desktop-area">
                  {/* Windows XP Bliss Background */}
                  <div className="xp-bliss-background"></div>
                  {/* Floppy disk icons */}
                  <div className="icon-area">
                    <div
                      className={`disk-icon ${activeExe === 'login' ? 'selected' : ''}`}
                      onClick={() => setActiveExe(activeExe === 'login' ? null : 'login')}
                    >
                      <div className="disk-graphic">
                        <div className="disk-body"></div>
                        <div className="disk-label-area"></div>
                        <div className="disk-shutter"></div>
                        <div className="disk-hub"></div>
                      </div>
                      <div className="disk-text">LOGIN.EXE</div>
                    </div>

                    <div
                      className={`disk-icon ${activeExe === 'register' ? 'selected' : ''}`}
                      onClick={() => setActiveExe(activeExe === 'register' ? null : 'register')}
                    >
                      <div className="disk-graphic">
                        <div className="disk-body"></div>
                        <div className="disk-label-area"></div>
                        <div className="disk-shutter"></div>
                        <div className="disk-hub"></div>
                      </div>
                      <div className="disk-text">REGISTER.EXE</div>
                    </div>
                  </div>

                  {/* Login window */}
                  {activeExe === 'login' && (
                    <div className="dos-window login-win">
                      <div className="dos-titlebar">
                        <span>LOGIN.EXE</span>
                        <button onClick={() => setActiveExe(null)} className="dos-close">[X]</button>
                      </div>
                      <div className="dos-content">
                        <form onSubmit={handleLoginSubmit}>
                          <div className="dos-field">
                            <label>USERNAME:</label>
                            <input
                              type="text"
                              value={loginData.username}
                              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                              disabled={loginProcessing}
                              maxLength={20}
                              className="dos-input"
                            />
                          </div>
                          <div className="dos-field">
                            <label>PASSWORD:</label>
                            <input
                              type="password"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              disabled={loginProcessing}
                              maxLength={50}
                              className="dos-input"
                            />
                          </div>
                          {loginError && <div className="dos-error">{loginError}</div>}
                          {loginProcessing && (
                            <div className="dos-loading">
                              <div className="load-bar"></div>
                              <div className="load-text">AUTHENTICATING...</div>
                            </div>
                          )}
                          <button type="submit" disabled={loginProcessing} className="dos-btn">
                            [EXECUTE]
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Register window */}
                  {activeExe === 'register' && (
                    <div className="dos-window register-win">
                      <div className="dos-titlebar">
                        <span>REGISTER.EXE</span>
                        <button onClick={() => setActiveExe(null)} className="dos-close">[X]</button>
                      </div>
                      <div className="dos-content">
                        <form onSubmit={handleRegisterSubmit}>
                          <div className="dos-field">
                            <label>USERNAME:</label>
                            <input
                              type="text"
                              value={registerData.username}
                              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                              disabled={registerProcessing}
                              maxLength={20}
                              className="dos-input"
                            />
                          </div>
                          <div className="dos-field">
                            <label>EMAIL:</label>
                            <input
                              type="email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                              disabled={registerProcessing}
                              maxLength={50}
                              className="dos-input"
                            />
                          </div>
                          <div className="dos-field">
                            <label>PASSWORD:</label>
                            <input
                              type="password"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              disabled={registerProcessing}
                              maxLength={50}
                              className="dos-input"
                            />
                          </div>
                          {registerError && <div className="dos-error">{registerError}</div>}
                          {registerProcessing && (
                            <div className="dos-loading">
                              <div className="load-bar"></div>
                              <div className="load-text">CREATING ACCOUNT...</div>
                            </div>
                          )}
                          <button type="submit" disabled={registerProcessing} className="dos-btn">
                            [EXECUTE]
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Terminal window */}
                  {terminalVisible && (
                    <div className="cmd-terminal">
                      <div className="cmd-bar">C:\ROOT\ADMIN_GATEWAY</div>
                      <div className="cmd-body">
                        <div className="cmd-line">
                          <span className="cmd-prompt">C:\ROOT\ADMIN_GATEWAY&gt; </span>
                          <span className="cmd-text" style={{ whiteSpace: 'pre-line' }}>{terminalText}</span>
                          {isTyping && <span className="cmd-cursor">_</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Windows XP Taskbar */}
                  <div className="xp-taskbar">
                    <button className="xp-start-button">
                      <span className="start-icon">⊞</span>
                      <span className="start-text">start</span>
                    </button>
                    <div className="xp-taskbar-items">
                      {activeExe === 'login' && (
                        <div className="xp-taskbar-item active">
                          <span className="taskbar-icon">📄</span>
                          <span>LOGIN.EXE</span>
                        </div>
                      )}
                      {activeExe === 'register' && (
                        <div className="xp-taskbar-item active">
                          <span className="taskbar-icon">📄</span>
                          <span>REGISTER.EXE</span>
                        </div>
                      )}
                      {terminalVisible && (
                        <div className="xp-taskbar-item">
                          <span className="taskbar-icon">▓</span>
                          <span>Command Prompt</span>
                        </div>
                      )}
                    </div>
                    <div className="xp-system-tray">
                      <div className="tray-icons">
                        <span className="tray-icon">🔊</span>
                        <span className="tray-icon">🖧</span>
                      </div>
                      <div className="xp-clock">
                        {new Date().toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen edge darkening */}
            <div className="screen-vignette"></div>

            {/* Glass reflection layer */}
            <div className="glass-shine"></div>
          </div>

          {/* Ventilation slots */}
          <div className="vent-slots"></div>
        </div>

        {/* Monitor base/stand */}
        <div className="monitor-base">
          <div className="base-neck"></div>
          <div className="base-foot"></div>
        </div>
      </div>

      {/* Desk elements for realism */}
      <div className="desk-elements">
        <div className="keyboard-hint"></div>
        <div className="cable-mess"></div>
        <div className="ambient-light"></div>
      </div>
    </div>
  );
}

export default RealisticCRT;
