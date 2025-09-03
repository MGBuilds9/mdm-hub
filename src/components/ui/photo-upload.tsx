import * as React from 'react';
import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

interface UploadedFile extends File {
  id: string;
  preview?: string;
  error?: string;
}

export function PhotoUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  disabled = false,
}: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const processFiles = useCallback(
    (newFiles: File[]) => {
      const validateFile = (file: File): string | null => {
        if (!acceptedTypes.includes(file.type)) {
          return 'Invalid file type. Please upload an image.';
        }
        if (file.size > maxSize * 1024 * 1024) {
          return `File size must be less than ${maxSize}MB.`;
        }
        return null;
      };

      const validFiles: UploadedFile[] = [];
      const errors: string[] = [];

      newFiles.forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          const uploadedFile = Object.assign(file, {
            id: Math.random().toString(36).substr(2, 9),
            preview: URL.createObjectURL(file),
          });
          validFiles.push(uploadedFile);
        }
      });

      if (errors.length > 0) {
        console.error('File validation errors:', errors);
      }

      setFiles(prev => {
        const updated = [...prev, ...validFiles];
        if (updated.length > maxFiles) {
          return updated.slice(0, maxFiles);
        }
        return updated;
      });

      onUpload(validFiles);
    },
    [maxFiles, maxSize, acceptedTypes, onUpload]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [disabled, processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const selectedFiles = Array.from(e.target.files || []);
      processFiles(selectedFiles);
    },
    [disabled, processFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const openFileDialog = () => {
    if (disabled) return;
    document.getElementById('photo-upload-input')?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-charcoal-300 hover:border-charcoal-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="photo-upload-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-charcoal-400">
            {dragActive ? (
              <Upload className="h-full w-full" />
            ) : (
              <Camera className="h-full w-full" />
            )}
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={disabled}
              className="mb-2"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Photos
            </Button>
            <p className="text-sm text-charcoal-500">
              or drag and drop photos here
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Up to {maxFiles} files, max {maxSize}MB each
            </p>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-charcoal-700 mb-2">
            Selected Photos ({files.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map(file => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-charcoal-100">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-charcoal-400" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-xs text-charcoal-500 mt-1 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-charcoal-400">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
