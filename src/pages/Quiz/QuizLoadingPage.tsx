import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizGeneratingLoader } from "@/components/QuizGeneratingLoader";
import { generateQuiz } from "@/api/generateQuiz";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";

export function QuizLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserProfile } = useAuthStore();

  const quizRequest = location.state?.quizRequest; // QuizCreation에서 전달받은 퀴즈 요청 정보
  const generateSummary = location.state?.generateSummary; // 요약 생성 여부 플래그

  useEffect(() => {
    const generateAndNavigate = async () => {
      try {
        // quizRequest가 없으면 홈으로 이동
        if (!quizRequest) {
          navigate("/");
          return;
        }

        // API 호출하여 퀴즈 생성
        const quizData = await generateQuiz(quizRequest);

        // 퀴즈 생성 성공 시 사용자 프로필 갱신 (남은 퀴즈 횟수 업데이트)
        await refreshUserProfile();

        // 짧은 딜레이 후 페이지 이동 (로딩 애니메이션을 보여주기 위해)
        setTimeout(() => {
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
        }, 500);
      } catch (error) {
        console.error("Quiz generation error:", error);
        toast.error(error instanceof Error ? error.message : "퀴즈 생성에 실패했습니다");
        // 에러 발생 시 퀴즈 생성 페이지로 돌아가기
        navigate("/quiz/create");
      }
    };

    generateAndNavigate();
  }, [navigate, quizRequest, generateSummary, refreshUserProfile]);

  return (
    <div className="min-h-screen bg-background">
      <QuizGeneratingLoader />
    </div>
  );
}
