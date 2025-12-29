import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";

interface QuizLayoutProps {
  children: ReactNode;
}

export function QuizLayout({ children }: QuizLayoutProps) {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  // 로그인 체크 로직만 유지
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("로그인이 필요합니다.");
      navigate("/");
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
