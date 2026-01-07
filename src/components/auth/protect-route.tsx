import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>인증 확인 중...</p>
      </div>
    );
  }

  // 확인이 끝났는데 유저가 없으면 홈으로 리다이렉트
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. 로그인된 유저라면 통과
  return <>{children}</>;
}
