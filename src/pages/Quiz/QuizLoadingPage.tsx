import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizGeneratingLoader } from "@/components/QuizGeneratingLoader";

export function QuizLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const quizData = location.state?.quizData; // QuizCreation에서 전달받은 퀴즈 데이터

  useEffect(() => {
    // 5초 후 퀴즈 풀이 페이지로 이동 (퀴즈 데이터를 함께 전달)
    const timer = setTimeout(() => {
      navigate("/quiz-solving", {
        state: {
          quizData: quizData,
        },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, quizData]);

  return (
    <div className="min-h-screen bg-background">
      <QuizGeneratingLoader />
    </div>
  );
}
