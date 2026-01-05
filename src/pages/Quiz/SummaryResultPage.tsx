import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { SummaryResult } from "../../components/SummaryResult";
import { toast } from "sonner";

export function SummaryResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // QuizLoadingPage에서 전달받은 요약 데이터를 state에 저장하여 불변성 유지
  const [summary] = useState(location.state?.summary || "");
  const [quizData] = useState(location.state?.quizData);
  const [originalQuizRequest] = useState(location.state?.originalQuizRequest);

  // 요약 데이터가 없으면 홈으로 리다이렉트 (최초 마운트 시에만 체크)
  useEffect(() => {
    if (!summary) {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleNewSummary = () => {
    // 퀴즈 생성 페이지로 이동하고, 히스토리 교체하여 뒤로가기 시 현재 요약 결과 페이지로 돌아오지 않도록 함
    navigate("/quiz/create", { replace: true });
  };

  const handleRegenerateSummary = () => {
    // 원본 퀴즈 요청 데이터가 있으면 동일한 설정으로 요약 재생성
    if (originalQuizRequest) {
      toast.info("요약을 다시 생성하고 있습니다...");
      navigate("/quiz/loading", {
        state: {
          quizRequest: originalQuizRequest,
          generateSummary: true, // 요약 생성 플래그
        },
        replace: true,
      });
    } else {
      // 원본 데이터가 없으면 퀴즈 생성 페이지로 이동
      toast.error("원본 학습 자료 정보를 찾을 수 없습니다.");
      navigate("/quiz/create", { replace: true });
    }
  };

  return (
    <QuizLayout>
      <SummaryResult
        summary={summary}
        onBack={handleNewSummary}
        onRegenerateSummary={handleRegenerateSummary}
        quizData={quizData}
      />
    </QuizLayout>
  );
}
