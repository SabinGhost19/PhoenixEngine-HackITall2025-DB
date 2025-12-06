'use client';

import { useState, useCallback } from 'react';
import { Upload, File, FolderOpen } from 'lucide-react';

interface FileItem {
  path: string;
  content: string;
}

interface FileUploaderProps {
  onUploadComplete: (uploadId: string, files: FileItem[]) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const filePromises = Array.from(selectedFiles).map(async (file) => {
      const content = await file.text();
      return {
        path: file.webkitRelativePath || file.name,
        content,
      };
    });

    const loadedFiles = await Promise.all(filePromises);
    setFiles(loadedFiles);
    setError(null);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data.uploadId, files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Upload Monolith Application
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="folder-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FolderOpen className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload folder</span>
                </p>
                <p className="text-xs text-gray-500">
                  Upload your PHP monolith application files
                </p>
              </div>
              <input
                id="folder-upload"
                type="file"
                className="hidden"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFileChange}
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">
                Selected Files ({files.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-50 rounded p-3">
                {files.slice(0, 20).map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <File className="w-4 h-4" />
                    <span className="truncate">{file.path}</span>
                  </div>
                ))}
                {files.length > 20 && (
                  <p className="text-xs text-gray-500 italic">
                    ... and {files.length - 20} more files
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Analyze Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
