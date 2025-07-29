import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  filename: string;
  path: string;
  status: 'pending' | 'scanning' | 'scanned';
  result: 'clean' | 'infected' | null;
  uploadedAt: Date;
  scannedAt: Date | null;
  size: number;
  mimetype: string;
}

const FileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'scanning', 'scanned'], 
    default: 'pending' 
  },
  result: { 
    type: String, 
    enum: ['clean', 'infected', null], 
    default: null,
    required: false
  },
  uploadedAt: { type: Date, default: Date.now },
  scannedAt: { type: Date, default: null },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true }
});

export default mongoose.model<IFile>('File', FileSchema);
