// src/components/auth/ProtectedRoute.tsx
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // 로딩이 끝났는데 유저가 없으면 홈으로 리다이렉트
    if (!isLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        보안 확인 중...
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
