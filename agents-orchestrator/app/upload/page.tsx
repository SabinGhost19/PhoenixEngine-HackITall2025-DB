'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/upload/FileUploader';

export default function UploadPage() {
  const router = useRouter();
  const [uploadId, setUploadId] = useState<string | null>(null);

  const handleUploadComplete = async (id: string, files: any[]) => {
    setUploadId(id);
    
    // Automatically start architecture analysis
    router.push(`/scan?uploadId=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <FileUploader onUploadComplete={handleUploadComplete} />
    </div>
  );
}
