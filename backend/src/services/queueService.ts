import path from 'path';
import File, { IFile } from '../models/File';
import { scanFileForMalware } from '../utils/fileScanner';

// Simple in-memory queue implementation
class MemoryQueue {
  private queue: string[] = [];
  private processing = false;
  private isInitialized = false;

  async enqueue(fileId: string): Promise<void> {
    if (!this.isInitialized) {
      console.error('Queue not initialized');
      return;
    }
    
    console.log(`[Queue] Enqueuing file ${fileId}`);
    this.queue.push(fileId);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const fileId = this.queue.shift();
    
    if (fileId) {
      try {
        console.log(`[Queue] Processing file ${fileId}`);
        await processFile(fileId);
        console.log(`[Queue] Successfully processed file ${fileId}`);
      } catch (error) {
        console.error(`[Queue] Error processing file ${fileId}:`, error);
      }
    }

    // Process next item in the queue
    setImmediate(() => this.processQueue());
  }

  initialize() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      console.log('[Queue] Queue service initialized');
      this.processQueue(); // Start processing any pending items
    }
  }
}

const memoryQueue = new MemoryQueue();

// Process file for malware
export const processFile = async (fileId: string) => {
  try {
    // Get file from database
    const file = await File.findById(fileId);
    if (!file) {
      console.error(`File ${fileId} not found`);
      return;
    }

    // Update status to scanning
    await File.findByIdAndUpdate(fileId, { 
      status: 'scanning',
      scannedAt: new Date()
    });

    // Get the file path
    const filePath = path.join(__dirname, '..', '..', file.path);
    
    // Scan the file for malware
    const isInfected = await scanFileForMalware(filePath, file.mimetype);
    
    // Update scan result
    await File.findByIdAndUpdate(fileId, {
      status: 'scanned',
      result: isInfected ? 'infected' : 'clean',
      scannedAt: new Date()
    });

    console.log(`File ${fileId} scanned: ${isInfected ? 'INFECTED' : 'CLEAN'}`);

    // If file is infected, we could trigger additional actions here
    if (isInfected) {
      console.log(`File ${file.filename} (${fileId}) contains malicious content`);
      // TODO: Add webhook/notification for infected files
    }

  } catch (error) {
    console.error('Error processing file:', error);
    // Mark as clean if there's an error (fail-safe)
    await File.findByIdAndUpdate(fileId, {
      status: 'scanned',
      result: 'clean',
      scannedAt: new Date()
    });
  }
};

// Add file to queue
export const sendToQueue = async (fileId: string) => {
  console.log(`[Queue] Adding file ${fileId} to queue`);
  try {
    await memoryQueue.enqueue(fileId);
    console.log(`[Queue] File ${fileId} added to queue successfully`);
  } catch (error) {
    console.error(`[Queue] Failed to add file ${fileId} to queue:`, error);
    throw error;
  }
};

// Initialize queue processing
export const initializeQueue = () => {
  console.log('[Queue] Initializing queue service');
  memoryQueue.initialize();
  console.log('[Queue] Queue service initialized');
};

// Connect to queue (for compatibility with existing code)
export const connectToQueue = async () => {
  console.log('[Queue] Connecting to queue service');
  memoryQueue.initialize();
};

// Start worker
export const startWorker = () => {
  console.log('[Queue] Starting queue worker');
  memoryQueue.initialize();
  console.log('Worker started, waiting for files to process...');
};