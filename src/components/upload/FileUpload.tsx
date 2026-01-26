'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileArchive, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUpload: () => Promise<void>;
  accept?: string;
  maxSize?: number; // in bytes
  isUploading?: boolean;
  progress?: number;
}

export default function FileUpload({
  onFileSelect,
  onUpload,
  accept = '.zip',
  maxSize = 52428800, // 50MB
  isUploading = false,
  progress = 0,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // Check file type
      if (accept && !file.name.toLowerCase().endsWith('.zip')) {
        setError('Only ZIP files are allowed');
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return false;
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg p-8
              transition-all duration-200 cursor-pointer
              ${isDragging ? 'border-[#14B8A6] bg-[#14B8A6]/10' : 'border-[#1E293B] hover:border-[#0F766E]'}
              ${error ? 'border-red-500' : ''}
            `}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div
                animate={{ y: isDragging ? -5 : 0 }}
                className={`
                  p-4 rounded-full
                  ${isDragging ? 'bg-[#14B8A6]/20' : 'bg-[#1E293B]'}
                `}
              >
                <Upload
                  className={`w-8 h-8 ${isDragging ? 'text-[#14B8A6]' : 'text-[#6B7280]'}`}
                />
              </motion.div>
              
              <div>
                <p className="text-[#E5E7EB] font-medium">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your ZIP file'}
                </p>
                <p className="text-[#6B7280] text-sm mt-1">
                  or click to browse (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#14B8A6]/20 rounded-lg">
                  <FileArchive className="w-6 h-6 text-[#14B8A6]" />
                </div>
                <div>
                  <p className="text-[#E5E7EB] font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-[#6B7280] text-sm">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              {!isUploading && (
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-[#1E293B] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6B7280]">Uploading...</span>
                  <span className="text-[#14B8A6]">{progress}%</span>
                </div>
                <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6]"
                  />
                </div>
              </div>
            )}

            {!isUploading && (
              <button
                onClick={onUpload}
                className="btn btn-primary w-full mt-4"
              >
                <Upload className="w-4 h-4" />
                Upload Submission
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 text-red-500 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
