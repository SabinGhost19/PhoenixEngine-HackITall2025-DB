import './ViewToggle.css';

function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="view-toggle">
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
  );
}

export default ViewToggle;
