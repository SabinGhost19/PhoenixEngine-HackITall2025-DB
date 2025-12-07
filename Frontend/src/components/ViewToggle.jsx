import './ViewToggle.css';

function ViewToggle({ currentView, onViewChange, user, onLogout }) {
  return (
    <div className="view-toggle">
      <div className="view-buttons">
        <button
          className={`toggle-btn ${currentView === 'client' ? 'active' : ''}`}
          onClick={() => onViewChange('client')}
        >
          ⛵ CLIENT VIEW
        </button>
        <button
          className={`toggle-btn ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => onViewChange('admin')}
        >
          🚢 ADMIN VIEW
        </button>
      </div>

      {user && (
        <div className="user-info">
          <span className="username">USER: {user.username.toUpperCase()}</span>
          <button className="logout-btn" onClick={onLogout}>
            ⏻ LOGOUT
          </button>
        </div>
      )}
    </div>
  );
}

export default ViewToggle;
