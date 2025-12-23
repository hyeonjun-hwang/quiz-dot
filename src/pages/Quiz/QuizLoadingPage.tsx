import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizGeneratingLoader } from "@/components/QuizGeneratingLoader";

export function QuizLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const quizData = location.state?.quizData; // QuizCreation에서 전달받은 퀴즈 데이터
  const generateSummary = location.state?.generateSummary; // 요약 생성 여부 플래그

  useEffect(() => {
    // 3초 후 페이지 이동
    const timer = setTimeout(() => {
      if (generateSummary) {
        // 요약 체크박스가 선택된 경우 -> 요약 결과 페이지로 이동
        navigate("/summary/result", {
          state: {
            summary: quizData?.summary, // AI가 생성한 요약 텍스트
            quizData: quizData, // 퀴즈 데이터도 함께 전달 (퀴즈 풀기 버튼용)
          },
        });
      } else {
        // 요약 체크박스가 선택되지 않은 경우 -> 퀴즈 풀이 페이지로 이동
        navigate("/quiz/solving", {
          state: {
            quizData: quizData,
          },
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, quizData, generateSummary]);

  return (
    <div className="min-h-screen bg-background">
      <QuizGeneratingLoader />
    </div>
  );
}
