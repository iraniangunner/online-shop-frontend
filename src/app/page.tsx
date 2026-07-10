import { Hero } from "./_components/ui/Hero";
import { HowItWorks } from "./_components/ui/HowItWorks";
import { ServicesPreview } from "./_components/ui/ServicesPreview";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ServicesPreview />
      </main>
    </div>
  );
}
