import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Stats } from '@/components/home/Stats';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
    </div>
  );
}
