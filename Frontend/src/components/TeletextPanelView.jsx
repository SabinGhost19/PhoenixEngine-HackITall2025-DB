import { useRef, useEffect, useState } from 'react';
import { renderTeletextPage, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/teletextRenderer';
import './TeletextPanelView.css';

function TeletextPanelView({
  bottles,
  onExit,
  currentPage,
  onPageChange,
  selectedProjectIndex,
  onSelectProject,
  viewingDetails,
  onViewDetails,
  onBackToList,
  pageData,
  onAnalyze
}) {
  const canvasRef = useRef();

  // Update canvas when pageData changes
  useEffect(() => {
    if (!canvasRef.current || !pageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    renderTeletextPage(ctx, pageData);
  }, [pageData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!viewingDetails) {
          onPageChange((currentPage + 1) % 3);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!viewingDetails) {
          onPageChange((currentPage - 1 + 3) % 3);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentPage === 0 && !viewingDetails && bottles.length > 0) {
          onSelectProject(Math.min(selectedProjectIndex + 1, bottles.length - 1));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentPage === 0 && !viewingDetails) {
          onSelectProject(Math.max(selectedProjectIndex - 1, -1));
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentPage === 0 && selectedProjectIndex >= 0 && !viewingDetails) {
          onViewDetails(true);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (viewingDetails) {
          onBackToList();
        } else {
          onExit();
        }
      } else if (e.key === 'a' || e.key === 'A') {
        // Trigger analysis when viewing details or selected in list
        if (viewingDetails && selectedProjectIndex >= 0) {
          e.preventDefault();
          onAnalyze(bottles[selectedProjectIndex]);
        } else if (currentPage === 0 && selectedProjectIndex >= 0) {
          e.preventDefault();
          onAnalyze(bottles[selectedProjectIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, selectedProjectIndex, viewingDetails, bottles, onPageChange, onSelectProject, onViewDetails, onBackToList, onExit, onAnalyze]);

  return (
    <div className="teletext-panel-view">
      {/* Header Border with Title */}
      <div className="panel-header">
        <div className="header-border">
          <div className="header-title">DevOps Control Panel</div>
          <div className="header-lights">
            <div className="light active"></div>
            <div className="light active"></div>
            <div className="light active"></div>
          </div>
        </div>
      </div>

      {/* CRT Monitor Frame */}
      <div className="crt-monitor">
        <div className="crt-screen">
          {/* Scanlines effect */}
          <div className="scanlines"></div>

          {/* Canvas display */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="teletext-canvas"
          />

          {/* CRT glow effect */}
          <div className="crt-glow"></div>
        </div>

        {/* Monitor bezel */}
        <div className="monitor-bezel">
          <div className="bezel-brand">CEEFAX TERMINAL</div>
          <div className="power-indicator"></div>
        </div>
      </div>

      {/* Control Panel UI */}
      <div className="control-ui">
        <div className="control-bar">
          <div className="page-indicator">
            PAGE {['100', '101', '102'][currentPage]}
          </div>

          <div className="navigation-hints">
            ◄► PAGES | ▲▼ SELECT | ENTER DETAILS | ESC {viewingDetails ? 'BACK' : 'EXIT'}
          </div>

          <button className="exit-button" onClick={onExit}>
            EXIT PANEL
          </button>
        </div>

        {/* Page tabs */}
        <div className="page-tabs">
          {['MIGRATION', 'PROJECTS', 'NETWORK'].map((label, idx) => (
            <button
              key={idx}
              className={`page-tab ${currentPage === idx ? 'active' : ''}`}
              onClick={() => !viewingDetails && onPageChange(idx)}
              disabled={viewingDetails}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeletextPanelView;
