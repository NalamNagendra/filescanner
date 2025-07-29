import { Request, Response } from 'express';
import File, { IFile } from '../models/File';
import { sendToQueue } from '../services/queueService';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { filename, path, size, mimetype } = req.file;

    const file = new File({
      filename,
      path,
      status: 'pending',
      result: null,
      size,
      mimetype,
    });

    const savedFile = await file.save();
    
    await sendToQueue(savedFile._id.toString());

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: savedFile._id,
        filename: savedFile.filename,
        status: savedFile.status,
        uploadedAt: savedFile.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { status, result } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (result) query.result = result;
    
    const files = await File.find(query)
      .sort({ uploadedAt: -1 })
      .select('-__v -path');
      
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFileById = async (req: Request, res: Response) => {
  try {
    const file = await File.findById(req.params.id).select('-__v -path');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
