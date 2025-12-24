import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Supabase가 URL에 담긴 인증 토큰을 처리하고 세션을 설정할 때까지 대기
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await initialize(); // 이동하기 전에 DB 프로필 정보를 동기화

        toast.success("로그인 성공!", {
          description: "퀴즈 생성 페이지로 이동합니다.",
        });
        navigate("/quiz/create", { replace: true }); // 세션 확인 후 퀴즈 만들기 페이지로 이동
      }

      // 만약 에러가 발생하거나 로그아웃 이벤트가 발생하면 로그인 페이지로 콜백
      if (event === "INITIAL_SESSION" && !session) {
        // 잠시 대기 후 세션이 없으면 로그인으로 이동 (시간차 고려)
        const timeout = setTimeout(() => {
          if (!session) navigate("/sign-in");
        }, 3000);
        return () => clearTimeout(timeout);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, initialize]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* 회전하는 로딩 아이콘 */}
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">로그인 처리 중</h2>
          <p className="text-muted-foreground">
            잠시만 기다려주세요. 정보를 확인하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
