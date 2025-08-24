'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageCircle, Bot, AlertTriangle } from 'lucide-react';
import UploadSection, { UploadInfo } from '@/components/UploadSection';
import ChatSection from '@/components/ChatSection';

export interface DocumentSource {
  id: string;
  type: 'pdf' | 'url' | 'text';
  name: string;
  uploadedAt: Date;
}

export default function NotebookApp() {
  const [sources, setSources] = useState<DocumentSource[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentUpload = async (uploadInfo: UploadInfo) => {
    setIsProcessing(true);
    setError(null);

    let response: Response;

    try {
      // Determine the endpoint and prepare the request body based on the upload type
      if (uploadInfo.type === 'pdf') {
        const formData = new FormData();
        formData.append('pdfFile', uploadInfo.data as File);
        response = await fetch('/api/indexing/pdf', {
          method: 'POST',
          body: formData,
        });
      } else if (uploadInfo.type === 'url') {
        response = await fetch('/api/indexing/website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: uploadInfo.data }),
        });
      } else { // 'text'
        response = await fetch('/api/indexing/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: uploadInfo.data }),
        });
      }

      if (!response.ok) {
        // Try to parse the error message from the API response
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to process ${uploadInfo.name}.`);
      }
      
      // If successful, create the new source object to display in the UI
      const newSource: DocumentSource = {
        id: Math.random().toString(36).substr(2, 9),
        type: uploadInfo.type,
        name: uploadInfo.name,
        uploadedAt: new Date(),
      };
      setSources(prev => [...prev, newSource]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Upload failed:", errorMessage);
      setError(`Failed to process ${uploadInfo.name}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    
    {/* Error Card */}
    {error && (
      <Card className="mb-8 p-4 bg-destructive/20 border border-destructive text-destructive-foreground">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5"/>
          <span className="text-sm font-medium">{error}</span>
        </div>
      </Card>
    )}

    {/* Document Status Bar */}
    {sources.length > 0 && (
      <Card className="mb-5 p-4 bg-card border border-secondary/40">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-secondary">
              {sources.length} document{sources.length !== 1 ? 's' : ''} ready
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sources.map((doc) => (
              <Badge 
                key={doc.id} 
                variant="secondary" 
                className="text-xs bg-muted text-muted-foreground border border-border"
              >
                {doc.name}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    )}

    <div className="grid lg:grid-cols-2 gap-8 items-start">
      
      {/* Left Column: Upload Section */}
      <div className="order-1">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Add Sources</h2>
        </div>
        <UploadSection 
          onUpload={handleDocumentUpload} 
          isProcessing={isProcessing}
        />
      </div>

      {/* Right Column: Chat Section */}
      <div className="order-2">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Chat With Your Documents</h2>
        </div>
        <ChatSection
          disabled={sources.length === 0 || isProcessing}
        />
      </div>
    </div>
  </div>
</div>
  );
}
