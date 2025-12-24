import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionStore } from "@/stores/subscription";
import { supabase } from "@/utils/supabase";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";

function Subscription() {
  // 1. 페이지 네비게이션
  const navigate = useNavigate();
  // 구독 상태 관리 스토어
  const { subscription, setSubscription, setLoading, isLoading } =
    useSubscriptionStore();

  // 2. 인증 체크 상태 (초기값 true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // 인증 체크
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("로그인이 필요한 서비스입니다.");
        navigate("/");
        return;
      }

      // 세션이 확인되면 체크 완료
      setIsCheckingAuth(false);
    };
    checkUser();
  }, [navigate]);
  // 3. 현재 구독 플랜 확인
  const isPro = subscription?.plan === "pro";
  // 4. 업그레이드 처리
  const handleUpgradeClick = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({ subscription_plan: "pro", quiz_limit_daily: 999 })
        .eq("id", user.id);

      if (error) throw error;

      setSubscription({
        plan: "pro",
        quizLimitDaily: 999,
        quizCountToday: subscription?.quizCountToday || 0,
      });

      toast.success("프로 플랜 업그레이드 완료!");
    } catch (err) {
      console.error(err);
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 3. 인증 확인 중이거나 스토어 로딩 중이면 UI 노출 차단
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground animate-pulse">
        보안 연결 및 사용자 정보 확인 중...
      </div>
    );
  }

  // 4. 세션 확인이 끝난 후 UI가 렌더링
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <header className="py-4">
          <h1 className="text-2xl font-bold">구독 관리</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            플랜을 관리하고 혜택을 확인하세요
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={!isPro ? "border-primary shadow-md" : "opacity-60"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>무료 플랜</CardTitle>
                {!isPro && <Badge className="bg-blue-500">현재 플랜</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>• 월 10회 퀴즈 생성</p>
                <p>• 기본 퀴즈 형태 제공</p>
              </div>
              <div className="text-xl font-bold">무료</div>
            </CardContent>
          </Card>

          <Card
            className={
              isPro ? "border-primary shadow-lg ring-1 ring-primary" : ""
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>프로 플랜</CardTitle>
                {isPro ? (
                  <Badge className="bg-blue-500">현재 플랜</Badge>
                ) : (
                  <Badge className="bg-red-500">90% 할인</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>
                  • <strong>무제한</strong> 퀴즈 생성
                </p>
                <p>• 고급 AI 분석 기능</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">₩990</span>
                <span className="text-sm text-muted-foreground line-through">
                  ₩9,900
                </span>
              </div>
              <Button
                className="w-full"
                onClick={handleUpgradeClick}
                disabled={isPro}
                variant={isPro ? "outline" : "default"}
              >
                {isPro ? "현재 이용 중" : "업그레이드"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {isPro && (
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive text-xs"
              onClick={() => navigate("/sub/subscriptioncancel")}
            >
              구독 해지 절차 진행
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscription;
