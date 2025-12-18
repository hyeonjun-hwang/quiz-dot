import { useEffect } from "react";
import { useNavigate } from "react-router";
import { QuizGeneratingLoader } from "@/components/QuizGeneratingLoader";

export function QuizLoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 5초 후 퀴즈 풀이 페이지로 이동
    const timer = setTimeout(() => {
      navigate("/quiz-solving");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <QuizGeneratingLoader />
    </div>
  );
}
