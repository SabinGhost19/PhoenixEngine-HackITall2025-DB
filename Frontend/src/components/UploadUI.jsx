import { useRef, useState } from 'react';
import './UploadUI.css';

function UploadUI({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = e.dataTransfer.items;
    if (items && items[0].webkitGetAsEntry) {
      const entry = items[0].webkitGetAsEntry();
      if (entry && entry.isDirectory) {
        handleFolderUpload(entry);
      }
    }
  };

  const handleFolderUpload = async (entry) => {
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      onUpload({
        name: entry.name,
        timestamp: Date.now()
      });
      setIsUploading(false);
    }, 1000);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        onUpload({
          name: files[0].webkitRelativePath.split('/')[0] || 'Project',
          timestamp: Date.now()
        });
        setIsUploading(false);
      }, 1000);
    }
  };

  return (
    <div className="upload-ui">
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="upload-status">
            <div className="pixel-spinner"></div>
            <p>PACKING PROJECT INTO BOTTLE...</p>
          </div>
        ) : (
          <>
            <div className="drop-icon">📦</div>
            <p className="drop-text">DROP FOLDER HERE</p>
            <p className="drop-subtext">or</p>
            <button className="browse-btn" onClick={handleButtonClick}>
              BROWSE FILES
            </button>
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default UploadUI;
