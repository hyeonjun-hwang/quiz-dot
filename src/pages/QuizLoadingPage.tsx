import { QuizGeneratingLoader } from "@/components/QuizGeneratingLoader";

export function QuizLoadingPage() {
  return (
    <div className="min-h-screen bg-background">
      <QuizGeneratingLoader />
    </div>
  );
}
