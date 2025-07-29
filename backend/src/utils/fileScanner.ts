import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const readFile = promisify(fs.readFile);

// Only flag files that contain clear indicators of malicious intent
// This is a very minimal set to avoid false positives
const DANGEROUS_PATTERNS = [
  'rm -rf /',
  '| wget',
  '| curl',
  'eval(base64_decode',
  'system($',
  'shell_exec($',
  'passthru($',
  'BEGIN RSA PRIVATE KEY',
  'BEGIN OPENSSH PRIVATE KEY'
];

// File signatures for basic validation
const FILE_SIGNATURES = {
  pdf: '25504446', // %PDF
  docx: '504B0304', // PK\x03\x04
  png: '89504E47', // .PNG
  jpg: 'FFD8FF',   // Start of JPEG
  gif: '47494638', // GIF8
};

// Function to check file signature
function checkFileSignature(data: Buffer, fileType: string): boolean {
  const signature = FILE_SIGNATURES[fileType as keyof typeof FILE_SIGNATURES];
  if (!signature) return true; // Skip check if we don't know this file type
  
  const fileSignature = data.slice(0, signature.length / 2).toString('hex').toUpperCase();
  return fileSignature.startsWith(signature);
}

// Function to extract text from different file types
async function extractText(filePath: string, mimetype: string): Promise<string> {
  try {
    const data = await readFile(filePath);
    
    // For text-based files, read directly
    if (mimetype.startsWith('text/') || 
        mimetype === 'application/json' || 
        mimetype === 'application/xml') {
      return data.toString('utf8');
    }
    
    // For PDFs, just check the signature
    if (mimetype === 'application/pdf') {
      if (!checkFileSignature(data, 'pdf')) {
        console.log('Invalid PDF signature detected');
        return '';
      }
      // Skip content extraction for PDFs without external tools
      console.log('Skipping PDF content extraction (no external tools available)');
      return '';
    }

    // For DOCX, just check the signature
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      if (!checkFileSignature(data, 'docx')) {
        console.log('Invalid DOCX signature detected');
        return '';
      }
      // Skip content extraction for DOCX without external tools
      console.log('Skipping DOCX content extraction (no external tools available)');
      return '';
    }

    // For images, just check the signature
    if (mimetype.startsWith('image/')) {
      const imageType = mimetype.split('/')[1];
      if (imageType && FILE_SIGNATURES[imageType as keyof typeof FILE_SIGNATURES]) {
        if (!checkFileSignature(data, imageType)) {
          console.log(`Invalid ${imageType} signature detected`);
          return '';
        }
      }
      // Skip binary content extraction for images
      return '';
    }

    // For other file types, don't scan content
    console.log(`Skipping content extraction for ${mimetype}`);
    return '';
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
}

// Main scanning function
export async function scanFileForMalware(filePath: string, mimetype: string): Promise<boolean> {
  try {
    // Skip scanning for very large files to prevent memory issues
    const stats = await fs.promises.stat(filePath);
    if (stats.size > 10 * 1024 * 1024) { // 10MB limit for scanning
      console.log('File too large for scanning, marking as clean');
      return false;
    }

    // Extract text content from the file
    const content = await extractText(filePath, mimetype);
    
    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`Found dangerous pattern in file: ${pattern}`);
        return true; // Malicious content found
      }
    }

    return false; // No malicious content found
  } catch (error) {
    console.error('Error scanning file:', error);
    return false; // On error, assume clean to not block legitimate files
  }
}
