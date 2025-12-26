import { useNavigate } from "react-router-dom";
import { useSubscriptionStore } from "@/stores/subscription";
import { supabase } from "@/utils/supabase";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
import { toast } from "sonner";
import { AlertCircle, Check, X } from "lucide-react";

function SubscriptionCancel() {
  // 페이지 네비게이션
  const navigate = useNavigate();
  // 구독 상태 관리 스토어
  const { cancelSubscription, setLoading } = useSubscriptionStore();
  // 구독 해지 처리
  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // DB 업데이트: 다시 무료(free)로 변경
      const { error } = await supabase
        .from("users")
        .update({ subscription_plan: "free", quiz_limit_daily: 2 })
        .eq("id", user.id);

      if (error) throw error;

      // Zustand 상태 반영
      cancelSubscription();
      toast.success("구독이 성공적으로 해지되었습니다.");

      // 해지 후 다시 구독 메인 페이지로 이동
      navigate("/sub/subscription");
    } catch (err) {
      toast.error("해지 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>구독 해지</h1>
          <p className="text-muted-foreground mt-1">
            정말 구독을 해지하시겠습니까?
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <CardTitle className="text-destructive">
                구독을 해지하시면 다음 혜택을 잃게 됩니다
              </CardTitle>
              <CardDescription className="mt-2">
                해지 후에는 무료 플랜으로 전환됩니다
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-sm">무제한 퀴즈 생성 (월 10회로 제한)</span>
          </div>
          <div className="flex items-start gap-3">
            <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-sm">고급 AI 분석 기능</span>
          </div>
          <div className="flex items-start gap-3">
            <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-sm">우선 고객 지원</span>
          </div>
          <div className="flex items-start gap-3">
            <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-sm">프리미엄 퀴즈 형태 및 난이도 옵션</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계속 이용하시면 좋은 점</CardTitle>
          <CardDescription>
            QUIZ.와 함께 더 효과적인 학습을 경험하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm">언제든지 원하는 만큼 퀴즈 생성 가능</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm">
              AI가 학습 패턴을 분석하여 맞춤형 퀴즈 제공
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm">빠른 문제 해결을 위한 우선 지원</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm">
              지속적으로 추가되는 새로운 기능 우선 이용
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">할인 혜택:</span> 현재 프로 플랜을
              90% 할인된 가격에 이용 중입니다 (₩990/월)
            </p>
            <p className="text-sm text-muted-foreground">
              해지 후 재가입 시 정가 ₩9,900/월이 적용될 수 있습니다
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">구독 해지 안내</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>해지는 즉시 처리되며, 다음 결제일부터 청구되지 않습니다</li>
              <li>
                남은 구독 기간 동안은 프로 플랜 혜택을 계속 이용하실 수 있습니다
              </li>
              <li>구독 기간 종료 후 무료 플랜으로 자동 전환됩니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(-1)}
        >
          구독 유지하기
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleConfirmCancel}
        >
          해지 확정
        </Button>
      </div>
    </div>
  );
}

export default SubscriptionCancel;
