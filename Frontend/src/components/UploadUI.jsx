import { useRef, useState } from 'react';
import './UploadUI.css';

function UploadUI({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('PACKING PROJECT INTO BOTTLE...');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items && items[0].webkitGetAsEntry) {
      const entry = items[0].webkitGetAsEntry();
      if (entry && entry.isDirectory) {
        await handleFolderUpload(entry);
      }
    }
  };

  // Recursively read all files in a directory entry
  const readDirectory = async (entry, path = '') => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file(async (file) => {
          const content = await file.text();
          resolve([{
            path: path + file.name,
            content
          }]);
        });
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries = await new Promise((resolve) => {
        reader.readEntries(resolve);
      });

      const results = await Promise.all(
        entries.map(e => readDirectory(e, path + entry.name + '/'))
      );

      return results.flat();
    }
    return [];
  };

  const uploadFilesToBackend = async (files, projectName) => {
    try {
      setUploadStatus('SENDING TO AGENTS ORCHESTRATOR...');

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.uploadId;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('UPLOAD FAILED! CHECK CONSOLE.');
      // Fallback for demo if backend is down
      return `local-${Date.now()}`;
    }
  };

  const handleFolderUpload = async (entry) => {
    setIsUploading(true);
    setUploadStatus('READING FILES...');

    try {
      // 1. Read all files
      const files = await readDirectory(entry, '');
      console.log(`Read ${files.length} files from ${entry.name}`);

      // 2. Upload to backend
      const uploadId = await uploadFilesToBackend(files, entry.name);

      // 3. Notify parent
      setUploadStatus('PACKING PROJECT INTO BOTTLE...');
      setTimeout(() => {
        onUpload({
          name: entry.name,
          timestamp: Date.now(),
          uploadId: uploadId,
          fileCount: files.length
        });
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Error handling folder:', error);
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const fileList = e.target.files;
    if (fileList.length > 0) {
      setIsUploading(true);
      setUploadStatus('READING FILES...');

      try {
        const files = [];
        const projectName = fileList[0].webkitRelativePath.split('/')[0] || 'Project';

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const content = await file.text();
          files.push({
            path: file.webkitRelativePath || file.name,
            content
          });
        }

        const uploadId = await uploadFilesToBackend(files, projectName);

        setUploadStatus('PACKING PROJECT INTO BOTTLE...');
        setTimeout(() => {
          onUpload({
            name: projectName,
            timestamp: Date.now(),
            uploadId: uploadId,
            fileCount: files.length
          });
          setIsUploading(false);
        }, 1000);
      } catch (error) {
        console.error('Error handling files:', error);
        setIsUploading(false);
      }
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
            <p>{uploadStatus}</p>
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
