'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main auth page
    router.replace('/auth');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}