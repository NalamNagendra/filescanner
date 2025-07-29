import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  status,
  error,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500 text-xl mr-2" />;
      case 'error':
        return <FaTimesCircle className="text-red-500 text-xl mr-2" />;
      default:
        return <FaSpinner className="animate-spin text-blue-500 text-xl mr-2" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'completed':
        return 'Upload complete';
      case 'error':
        return error || 'Upload failed';
      default:
        return '';
    }
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-2">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </p>
          <p className="text-sm text-gray-500">{getStatusText()}</p>
        </div>
        {status === 'uploading' && (
          <span className="text-sm font-medium text-gray-500">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      {status === 'uploading' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
