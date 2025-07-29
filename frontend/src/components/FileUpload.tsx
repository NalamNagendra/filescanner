import React, { useCallback, useState } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFileAlt, FaSpinner, FaTimes, FaFileUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { uploadFile } from '../services/api';
import UploadProgress from './UploadProgress';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

interface UploadState {
  progress: number;
  fileName: string;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadState({
      progress: 0,
      fileName: file.name,
      status: 'uploading'
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Set up progress tracking
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
          setUploadState(prev => prev ? {
            ...prev,
            progress: percentCompleted
          } : null);
        },
        timeout: 30000,
      };
      
      await axios.post('/api/upload', formData, config);

      setUploadState(prev => prev ? {
        ...prev,
        progress: 100,
        status: 'completed'
      } : null);
      
      toast.success('File uploaded successfully!');
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      
      setUploadState(prev => prev ? {
        ...prev,
        status: 'error',
        error: errorMessage
      } : null);
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setProgress(0);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const error = rejectedFiles[0]?.errors?.[0]?.message || 'Invalid file type or size';
        toast.error(error);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setUploadState({
          progress: 0,
          fileName: file.name,
          status: 'uploading'
        });
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({

    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    setSelectedFile(null);
    setProgress(0);
    setIsUploading(false);
    setUploadState(null);
  };

  return (
    <div className="content-box" style={{ marginBottom: '30px' }}>
      <h2>Upload Files</h2>
      <div className="card">
        <div 
          {...getRootProps()} 
          className="upload-area"
          style={{
            borderColor: isDragActive 
              ? 'var(--primary-color)' 
              : isDragReject 
                ? 'var(--danger-color)' 
                : 'var(--border-color)',
            backgroundColor: isDragActive 
              ? 'rgba(74, 111, 165, 0.05)' 
              : 'var(--white)'
          }}
        >
          <input {...getInputProps()} />
          
          {isUploading && selectedFile ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ marginBottom: '15px' }}>
                <FaSpinner className="spin" style={{ fontSize: '40px', color: 'var(--primary-color)' }} />
              </div>
              <p style={{ marginBottom: '10px', fontWeight: 500 }}>Uploading {selectedFile.name}</p>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p style={{ marginTop: '10px', color: 'var(--text-light)' }}>{progress}% Complete</p>
            </div>
          ) : selectedFile ? (
            <div style={{ textAlign: 'center' }}>
              <FaFileUpload style={{ fontSize: '40px', color: 'var(--primary-color)', marginBottom: '15px' }} />
              <p style={{ fontWeight: 500, marginBottom: '5px' }}>{selectedFile.name}</p>
              <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
                {formatFileSize(selectedFile.size)}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload(selectedFile);
                  }}
                  className="btn btn-primary"
                  style={{ minWidth: '120px' }}
                >
                  Upload File
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="btn"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)'
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaCloudUploadAlt style={{ 
                fontSize: '48px', 
                color: isDragActive ? 'var(--primary-color)' : 'var(--text-light)',
                marginBottom: '15px',
                transition: 'all 0.3s ease'
              }} />
              <h3 style={{ marginBottom: '10px', color: 'var(--dark-bg)' }}>
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
                or <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>browse files</span>
              </p>
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--text-light)',
                backgroundColor: 'rgba(0,0,0,0.03)',
                padding: '8px 15px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (max 10MB)
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadState && (
        <div className="mt-4">
          <UploadProgress
            fileName={uploadState.fileName}
            progress={uploadState.progress}
            status={uploadState.status}
            error={uploadState.error}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
