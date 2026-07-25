'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  UploadCloud, FileText, X, CheckCircle2, AlertCircle, RotateCw,
  FileCheck, Trash2, ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
}

const ACCEPTED_TYPES = ['.pdf', '.docx'];
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadResumePage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) return 'Only PDF and DOCX files are supported';
    if (file.size > MAX_SIZE) return 'File size exceeds 10MB limit';
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const valid: UploadFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }
      valid.push({ id: `${file.name}-${Date.now()}-${Math.random()}`, file, progress: 0, status: 'pending' });
    });

    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
      toast.success(`${valid.length} file${valid.length > 1 ? 's' : ''} added`);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const simulateUpload = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 0 } : f)));

    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const next = Math.min(100, f.progress + Math.random() * 20);
          if (next >= 100) {
            clearInterval(interval);
            const success = Math.random() > 0.1;
            if (success) toast.success(`${f.file.name} parsed successfully`);
            else toast.error(`Failed to parse ${f.file.name}`);
            return { ...f, progress: 100, status: success ? 'success' : 'error' };
          }
          return { ...f, progress: next };
        })
      );
    }, 300);
  };

  const uploadAll = () => {
    files.filter((f) => f.status === 'pending').forEach((f) => simulateUpload(f.id));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'));
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Resume"
        description="Drag and drop PDF or DOCX files. Resumes are parsed automatically."
        icon={UploadCloud}
        actions={
          pendingCount > 0 ? (
            <Button onClick={uploadAll}>
              Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all',
            dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input ref={inputRef} type="file" multiple accept=".pdf,.docx" className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)} />
          <motion.div animate={dragging ? { scale: 1.1 } : { scale: 1 }} className="rounded-2xl bg-primary/10 p-5">
            <UploadCloud className="h-10 w-10 text-primary" />
          </motion.div>
          <p className="mt-4 text-base font-semibold">{dragging ? 'Drop files here' : 'Drag & drop resume files'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            or <span className="text-primary font-medium">browse</span> from your computer
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">PDF</Badge>
            <Badge variant="secondary">DOCX</Badge>
            <Badge variant="outline">Max 10MB</Badge>
          </div>
        </div>
      </motion.div>

      {files.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{files.length} total</Badge>
          {successCount > 0 && <Badge className="bg-success/10 text-success border-success/20">{successCount} uploaded</Badge>}
          {uploadingCount > 0 && <Badge className="bg-info/10 text-info border-info/20">{uploadingCount} uploading</Badge>}
          {errorCount > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20">{errorCount} failed</Badge>}
          {successCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCompleted} className="ml-auto">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear completed
            </Button>
          )}
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {files.map((f) => (
              <motion.div key={f.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                <Card className="overflow-hidden">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      f.status === 'success' ? 'bg-success/10' :
                      f.status === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
                    )}>
                      {f.status === 'success' ? <CheckCircle2 className="h-5 w-5 text-success" /> :
                       f.status === 'error' ? <AlertCircle className="h-5 w-5 text-destructive" /> :
                       f.status === 'uploading' ? <RotateCw className="h-5 w-5 text-primary animate-spin" /> :
                       <FileText className="h-5 w-5 text-primary" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{f.file.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatSize(f.file.size)}</span>
                      </div>
                      {f.status === 'uploading' && (
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}
                      {f.status === 'success' && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-success">
                          <FileCheck className="h-3 w-3" /> Parsed and stored successfully
                        </p>
                      )}
                      {f.status === 'error' && (
                        <p className="mt-0.5 text-xs text-destructive">Parse failed — please retry or check file format</p>
                      )}
                      {f.status === 'pending' && <p className="mt-0.5 text-xs text-muted-foreground">Ready to upload</p>}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {f.status === 'error' && (
                        <Button variant="ghost" size="icon" onClick={() => simulateUpload(f.id)} aria-label="Retry">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)} aria-label="Remove">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">No files uploaded yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Add resume files above to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
