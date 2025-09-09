import Hero from '@/components/Hero';
import Features from '@/components/Features';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
    </div>
  );
}
