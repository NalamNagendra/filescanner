import axios from 'axios';

const API_URL = '/api';

export interface FileInfo {
  _id: string;
  filename: string;
  status: 'pending' | 'scanning' | 'scanned';
  result: 'clean' | 'infected' | null;
  uploadedAt: string;
  scannedAt: string | null;
  size: number;
  mimetype: string;
}

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Sending file upload request to:', `${API_URL}/upload`);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request was made but no response received' : 'No request was made'
      });
    } else {
      console.error('Unexpected error:', error);
    }
    throw error; // Re-throw to be handled by the component
  }
};

export const getFiles = async (status?: string, result?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (result) params.append('result', result);

  const response = await axios.get<FileInfo[]>(`${API_URL}/files?${params.toString()}`);
  return response.data;
};

export const getFileById = async (id: string) => {
  const response = await axios.get<FileInfo>(`${API_URL}/files/${id}`);
  return response.data;
};
