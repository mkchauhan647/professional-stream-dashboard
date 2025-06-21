// src/pages/HomePage.tsx
import { Header } from '../components/StreamingDashboard/Header';
import { PreviewCard } from '../features/PreviewCard';
import { ControlsCard } from '../features/ControlsCard';
import { PlatformsCard } from '../features/PlatformsCard';
import { QualityCard } from '../features/QualityCard';
import { AudioControlCard } from '../features/AudioControlCard';

export function HomePage() {
  return (
    <div className="min-h-screen p-2 sm:p-5">
      <div className="container mx-auto max-w-7xl">
        <Header />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <PreviewCard />
            <QualityCard />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-5">
                      <ControlsCard />
                      <AudioControlCard />
            <PlatformsCard />
          </div>
        </main>
      </div>
    </div>
  );
}
