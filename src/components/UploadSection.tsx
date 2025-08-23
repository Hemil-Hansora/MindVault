'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Link, 
  Type, 
  AlertCircle,
  X,
  Loader2 
} from 'lucide-react';

// A more flexible interface for passing upload data to the parent
export interface UploadInfo {
  type: 'pdf' | 'url' | 'text';
  data: File | string;
  name: string;
}

interface UploadSectionProps {
  onUpload: (uploadInfo: UploadInfo) => Promise<void>;
  isProcessing: boolean;
}

export default function UploadSection({ onUpload, isProcessing }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState('pdf');
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      // Replace alert with a more modern notification system in a real app
      alert('Please drop a PDF file only.');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handlePdfUpload = async () => {
    if (!selectedFile) return;
    await onUpload({
      type: 'pdf',
      data: selectedFile,
      name: selectedFile.name,
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlUpload = async () => {
    if (!validateUrl(urlInput)) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setUrlError('');
    await onUpload({
      type: 'url',
      data: urlInput,
      name: new URL(urlInput).hostname,
    });
    setUrlInput('');
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) return;
    const title = textInput.split('\n')[0].substring(0, 40) + (textInput.length > 40 ? '...' : '');
    await onUpload({
      type: 'text',
      data: textInput,
      name: title || 'Text Note',
    });
    setTextInput('');
  };

  if (isProcessing) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4 h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <div className="text-center">
              <h3 className="font-medium text-gray-200">Processing your document...</h3>
              <p className="text-sm text-gray-400 mt-1">This may take a few moments.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-800 border-gray-700 text-white">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-900">
            <TabsTrigger value="pdf" className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Upload PDF</span>
              <span className="sm:hidden">PDF</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Website Link</span>
              <span className="sm:hidden">URL</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Add Text</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isProcessing} />
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${dragActive ? 'bg-blue-900/50' : 'bg-gray-700'}`}>
                  <Upload className={`h-6 w-6 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-200">Drop your PDF here, or click to browse</p>
                  <p className="text-sm text-gray-500 mt-1">Supports PDF files up to 10MB</p>
                </div>
              </div>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="truncate">
                    <p className="font-medium text-gray-200 truncate">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button onClick={handlePdfUpload} disabled={!selectedFile || isProcessing} className="w-full" size="lg">
              <Upload className="h-4 w-4 mr-2" /> Upload PDF
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Input type="url" placeholder="https://example.com/article" value={urlInput} onChange={(e) => { setUrlInput(e.target.value); if (urlError) setUrlError(''); }} className={`bg-gray-700 border-gray-600 placeholder-gray-500 ${urlError ? 'border-red-500' : ''}`} />
              {urlError && <div className="flex items-center gap-2 text-sm text-red-400"><AlertCircle className="h-4 w-4" />{urlError}</div>}
              <p className="text-sm text-gray-500">Enter a website URL to extract and analyze its content.</p>
            </div>
            <Button onClick={handleUrlUpload} disabled={!urlInput.trim() || isProcessing} className="w-full" size="lg">
              <Link className="h-4 w-4 mr-2" /> Add Website
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Textarea placeholder="Paste your text content here..." value={textInput} onChange={(e) => setTextInput(e.target.value)} className="min-h-[150px] resize-none bg-gray-700 border-gray-600 placeholder-gray-500" />
              <div className="flex justify-end text-xs text-gray-500">
                <span>{textInput.length} characters</span>
              </div>
            </div>
            <Button onClick={handleTextUpload} disabled={!textInput.trim() || isProcessing} className="w-full" size="lg">
              <Type className="h-4 w-4 mr-2" /> Add Text
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
