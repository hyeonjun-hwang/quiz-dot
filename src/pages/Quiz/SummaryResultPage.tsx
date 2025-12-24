import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { SummaryResult } from "../../components/SummaryResult";

export function SummaryResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // QuizLoadingPage에서 전달받은 요약 데이터
  const summary = location.state?.summary || "";
  const quizData = location.state?.quizData;

  // 요약 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!summary) {
      navigate("/");
    }
  }, [summary, navigate]);

  return (
    <QuizLayout>
      <SummaryResult
        summary={summary}
        onBack={() => navigate("/quiz/create")}
        quizData={quizData}
      />
    </QuizLayout>
  );
}
