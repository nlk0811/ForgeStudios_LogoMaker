
export interface EditedImage {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'error';
