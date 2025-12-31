import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth";

interface QuizLayoutProps {
  children: ReactNode;
}

export function QuizLayout({ children }: QuizLayoutProps) {
  const navigate = useNavigate();

  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // 토스트 없이 리다이렉트만 수행
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">로딩 중...</p>
      </div>
    );
  }

  if (!user) return null;
  // 헤더와 사이드메뉴를 제거하고 내용(children)만 렌더링
  return <div className="w-full">{children}</div>;
}
