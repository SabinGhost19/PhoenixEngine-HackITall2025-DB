'use client';

import { useRouter, useParams } from 'next/navigation';
import LanguageSelector from '@/components/generator/LanguageSelector';

export default function SelectLanguagePage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;

  const handleLanguageSelect = (language: 'go' | 'python' | 'node-ts') => {
    sessionStorage.setItem('selectedLanguage', language);
    router.push(`/generate/${endpointId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <LanguageSelector onSelect={handleLanguageSelect} />
    </div>
  );
}
