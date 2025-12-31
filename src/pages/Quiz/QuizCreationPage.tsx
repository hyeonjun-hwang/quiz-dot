import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { QuizCreation } from "@/components/QuizCreation";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";

export function QuizCreationPage() {
  const navigate = useNavigate();

  // 이 페이지의 인증 확인이 완료되었는지 추적하는 상태
  const [authChecked, setAuthChecked] = useState(false);
  // Auth store에서 사용자 정보 가져오기
  const { user, session, initialize } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // store에 이미 사용자 정보가 있는지 확인
      const initialState = useAuthStore.getState();
      // 이미 정보 있으면 확인 완료로 처리
      if (initialState.user) {
        setAuthChecked(true);
        return;
      }

      // 사용자 정보 없으면 initialize()를 호출하고 끝날 때까지 기다림 (await)
      await initialize();

      // initialize() 끝나고 스토어의 최신 상태를 다시 가져오기
      const finalState = useAuthStore.getState();
      if (finalState.user) {
        // 최종적으로 사용자가 있으면 확인 완료
        setAuthChecked(true);
      } else {
        // // 최종적으로 사용자가 없으면 로그인 페이지로 이동
        toast.error("로그인이 필요합니다");
        navigate("/sign-in");
      }
    };
    checkAuth();
  }, [initialize, navigate]);

  // 업그레이드 필요 시 호출
  const handleUpgradeNeeded = () => {
    toast.info(
      "일일 퀴즈 생성 한도를 초과했습니다. Pro 플랜으로 업그레이드하세요!"
    );
  };

  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  // 남은 퀴즈 생성 횟수 계산
  const remainingQuizzes = user.quiz_limit_daily - user.quiz_count_today;

  return (
    <QuizLayout>
      <QuizCreation
        accessToken={session?.access_token || ""}
        remainingQuizzes={remainingQuizzes}
        onUpgradeNeeded={handleUpgradeNeeded}
        subscriptionPlan={user.subscription_plan}
      />
    </QuizLayout>
  );
}
