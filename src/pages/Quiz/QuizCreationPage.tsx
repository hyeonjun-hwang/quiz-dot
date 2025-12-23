import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/components/common/Header";
import { QuizCreation } from "@/components/QuizCreation";
import { SideMenu } from "@/components/common/SideMenu";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";

export function QuizCreationPage() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Auth store에서 사용자 정보 가져오기
  const { user, session, initialize, signOut } = useAuthStore();

  // 컴포넌트 마운트 시 세션 확인
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!session && !user) {
      toast.error("로그인이 필요합니다");
      navigate("/sign-in");
    }
  }, [session, user, navigate]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await signOut();
    toast.success("로그아웃되었습니다");
    navigate("/sign-in");
  };

  // 업그레이드 필요 시 호출
  const handleUpgradeNeeded = () => {
    toast.info("일일 퀴즈 생성 한도를 초과했습니다. Pro 플랜으로 업그레이드하세요!");
  };

  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  // 남은 퀴즈 생성 횟수 계산
  const remainingQuizzes = user.quiz_limit_daily - user.quiz_count_today;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <QuizCreation
        accessToken={session?.access_token || ""}
        remainingQuizzes={remainingQuizzes}
        onUpgradeNeeded={handleUpgradeNeeded}
      />

      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onLogout={handleLogout}
        userName={user.nickname || user.email}
        subscription={{
          tier: user.subscription_plan.toUpperCase() as "FREE" | "PRO",
          remainingQuizzes: remainingQuizzes,
        }}
        onNavigate={() => {}}
      />
    </div>
  );
}
