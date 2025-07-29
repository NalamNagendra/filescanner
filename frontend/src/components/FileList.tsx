import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FileInfo, getFiles } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaFile, 
  FaFilePdf, 
  FaFileWord, 
  FaFileImage, 
  FaFileAlt, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaSpinner,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaDownload,
  FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';

type SortField = 'filename' | 'uploadedAt' | 'status' | 'result';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const FileIcon = ({ mimetype }: { mimetype: string }) => {
  if (mimetype.includes('pdf')) {
    return <FaFilePdf className="file-icon" style={{ color: '#e74c3c' }} />;
  }
  if (mimetype.includes('word') || mimetype.includes('document')) {
    return <FaFileWord className="file-icon" style={{ color: '#2b579a' }} />;
  }
  if (mimetype.includes('image')) {
    return <FaFileImage className="file-icon" style={{ color: '#3498db' }} />;
  }
  if (mimetype.includes('text')) {
    return <FaFileAlt className="file-icon" style={{ color: '#7f8c8d' }} />;
  }
  return <FaFile className="file-icon" style={{ color: '#95a5a6' }} />;
};

const StatusBadge = ({ status, result }: { status: string; result: string | null }) => {
  if (status === 'pending' || status === 'scanning') {
    return (
      <span className="badge badge-pending">
        <FaSpinner className="spin" style={{ marginRight: 4, fontSize: '0.8em' }} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }
  if (status === 'scanned' && result === 'clean') {
    return (
      <span className="badge badge-clean">
        <FaCheck style={{ marginRight: 4, fontSize: '0.8em' }} />
        Clean
      </span>
    );
  }
  if (status === 'scanned' && result === 'infected') {
    return (
      <span className="badge badge-infected">
        <FaExclamationTriangle style={{ marginRight: 4, fontSize: '0.8em' }} />
        Infected
      </span>
    );
  }
  return (
    <span className="badge">
      <FaTimes style={{ marginRight: 4, fontSize: '0.8em' }} />
      Error
    </span>
  );
};

const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'uploadedAt', 
    direction: 'desc' 
  });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFiles();
      
      // Apply filters and sorting in the frontend
      let filteredData = [...data];
      
      // Apply status filter
      if (filter !== 'all') {
        filteredData = filteredData.filter(file => {
          if (filter === 'clean') {
            return file.status === 'scanned' && file.result === 'clean';
          } else if (filter === 'infected') {
            return file.status === 'scanned' && file.result === 'infected';
          } else if (filter === 'pending') {
            return file.status === 'pending' || file.status === 'scanning';
          }
          return true;
        });
      }
      
      // Apply search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(file => 
          file.filename.toLowerCase().includes(term) ||
          file.mimetype.toLowerCase().includes(term)
        );
      }
      
      // Apply sorting
      const sortedData = [...filteredData].sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortConfig.field) {
          case 'filename':
            aValue = a.filename.toLowerCase();
            bValue = b.filename.toLowerCase();
            break;
          case 'uploadedAt':
            aValue = new Date(a.uploadedAt).getTime();
            bValue = new Date(b.uploadedAt).getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'result':
            aValue = a.result || '';
            bValue = b.result || '';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      setFiles(sortedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm, sortConfig]);

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchFiles]);

  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <FaSort className="sort-icon" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="sort-icon active" /> 
      : <FaSortDown className="sort-icon active" />;
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      // TODO: Implement file download logic
      console.log('Downloading file:', fileId, filename);
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        // TODO: Implement file deletion logic
        console.log('Deleting file:', fileId);
        toast.success('File deleted successfully');
        await fetchFiles(); // Refresh the file list
      } catch (err) {
        console.error('Error deleting file:', err);
        toast.error('Failed to delete file');
      }
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    // Apply filters
    let result = [...files];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(file => {
        if (filter === 'clean') {
          return file.status === 'scanned' && file.result === 'clean';
        } else if (filter === 'infected') {
          return file.status === 'scanned' && file.result === 'infected';
        } else if (filter === 'pending') {
          return file.status === 'pending' || file.status === 'scanning';
        }
        return true;
      });
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(file => 
        file.filename.toLowerCase().includes(term) ||
        file.mimetype.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    return [...result].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortConfig.field) {
        case 'filename':
          aValue = a.filename.toLowerCase();
          bValue = b.filename.toLowerCase();
          break;
        case 'uploadedAt':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'result':
          aValue = a.result || '';
          bValue = b.result || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [files, filter, searchTerm, sortConfig]);

  return (
    <div className="content-box">
      <h2>Uploaded Files</h2>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px 10px 40px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'clean', 'infected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: filter === f ? '#3498db' : '#f0f0f0',
                  color: filter === f ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {filter === f && (
                  <span style={{ fontSize: '12px' }}>
                    {filteredAndSortedFiles.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="file-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('filename')}>
                  <div className="table-header">
                    Filename
                    {renderSortIcon('filename')}
                  </div>
                </th>
                <th>Type</th>
                <th onClick={() => handleSort('status')}>
                  <div className="table-header">
                    Status
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th onClick={() => handleSort('uploadedAt')}>
                  <div className="table-header">
                    Uploaded
                    {renderSortIcon('uploadedAt')}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="loading-state">
                    <FaSpinner className="spin" /> Loading files...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="error-state">
                    <FaExclamationTriangle /> {error}
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={fetchFiles}
                      style={{ marginLeft: '10px' }}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : filteredAndSortedFiles.length > 0 ? (
                filteredAndSortedFiles.map((file) => (
                  <tr key={file._id} className={selectedFile === file._id ? 'selected' : ''}>
                    <td className="filename-cell">
                      <div className="file-info">
                        <FileIcon mimetype={file.mimetype} />
                        <span className="filename" title={file.filename}>
                          {file.filename.length > 30 
                            ? `${file.filename.substring(0, 27)}...` 
                            : file.filename}
                        </span>
                      </div>
                    </td>
                    <td className="type-cell">
                      <span className="file-type">{file.mimetype.split('/')[1] || file.mimetype}</span>
                    </td>
                    <td className="status-cell">
                      <StatusBadge status={file.status} result={file.result} />
                    </td>
                    <td className="date-cell">
                      {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="Download"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file._id, file.filename);
                          }}
                          disabled={file.status !== 'scanned' || file.result === 'infected'}
                        >
                          <FaDownload />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file._id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-files">
                    {searchTerm || filter !== 'all' 
                      ? 'No files match your search criteria.'
                      : 'No files have been uploaded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileList;