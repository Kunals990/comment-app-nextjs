'use client';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';

const CommentThread = dynamic(() => import('@/components/CommentThread'));

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <Navbar/>
      <CommentThread />
    </main>
  );
}
