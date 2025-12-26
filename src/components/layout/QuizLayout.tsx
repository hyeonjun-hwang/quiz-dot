import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/components/common/Header";
import { SideMenu } from "@/components/common/SideMenu";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";

interface QuizLayoutProps {
  children: ReactNode;
}

export function QuizLayout({ children }: QuizLayoutProps) {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    toast.success("로그아웃되었습니다");
    navigate("/sign-in");
  };

  const handleNavigate = (page: string) => {
    switch (page) {
      case "contact":
        navigate("/contact");
        break;
      case "history":
        navigate("/history");
        break;
      case "subscription":
        toast.info("구독 관리 페이지로 이동합니다.");
        break;
      default:
        toast.info(`${page} 페이지로 이동합니다.`);
    }
  };

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // 사용자 정보가 없으면 로딩 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const remainingQuizzes = user.quiz_limit_daily - user.quiz_count_today;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      {children}

      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onLogout={handleLogout}
        userName={user.nickname || user.email}
        subscription={{
          tier: user.subscription_plan.toUpperCase() as "FREE" | "PRO",
          remainingQuizzes: remainingQuizzes,
        }}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
