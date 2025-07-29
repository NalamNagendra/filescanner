import { Router } from 'express';
import { uploadFile, getFiles, getFileById } from '../controllers/fileController';
import upload from '../middleware/upload';

const router = Router();

// Upload a file
router.post('/upload', upload.single('file'), uploadFile);

// Get all files with optional filtering
router.get('/files', getFiles);

// Get a single file by ID
router.get('/files/:id', getFileById);

export default router;
