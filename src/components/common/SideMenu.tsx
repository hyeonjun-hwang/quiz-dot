import { CreditCard, MessageSquare, LogOut, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router";
// 전역 상태 관리를 위한 스토어
import { useAuthStore } from "@/stores/auth";
import { useSubscriptionStore } from "@/stores/subscription";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate();

  // Auth 스토어: 로그인 유저 정보 및 로그아웃 기능
  const { user, signOut } = useAuthStore();

  // Subscription 스토어: Edge Function이 업데이트한 최신 퀴즈 카운트 정보
  const { subscription } = useSubscriptionStore();

  // 페이지 이동 후 사이드바를 자동으로 닫아주는 함수
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // 로그아웃 로직: 스토어의 signOut 호출 후 메인으로 이동
  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut();
      onClose();
      navigate("/");
    }
  };

  //  잔여 횟수 계산 로직 - Edge Function이 24시간마다 quiz_count_today를 0으로 리셋
  // (전체한도 - 현재사용량)만 계산하면 서버 로직과 동기화됨

  const remainingQuizzes = subscription
    ? Math.max(0, subscription.quizLimitDaily - subscription.quizCountToday)
    : 0;

  // 탈퇴 로직
  const handleWithdrawal = async () => {
    if (
      confirm(
        "정말로 탈퇴하시겠습니까? 모든 학습 데이터가 삭제되며 복구가 불가능합니다."
      )
    ) {
      try {
        // DB에 만든 RPC 함수 호출
        const { error } = await supabase.rpc("delete_user_account");
        if (error) throw error;

        // 성공 시 로그아웃 및 세션 정리
        await signOut();
        onClose();
        navigate("/");
        toast.success("탈퇴가 완료되었습니다.");
      } catch (err: any) {
        console.error(err);
        alert("탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-75 sm:w-100 rounded-l-2xl">
        <SheetHeader className="px-2 text-left">
          <SheetTitle>마이페이지</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-6 px-2">
          {/* 유저 프로필 영역: 닉네임이 없으면 이메일 표시 */}
          <div className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">사용자</p>
            <p className="text-lg font-semibold">
              {user?.nickname || user?.email || "사용자"}
            </p>
          </div>

          <Separator />

          {/* 구독 정보 영역*/}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">구독 상태</p>
              <Badge
                variant={subscription?.plan === "pro" ? "default" : "secondary"}
                className="uppercase"
              >
                {subscription?.plan || "FREE"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">잔여 퀴즈 생성</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {/* Pro 플랜은 무제한, 그 외엔 계산된 잔여 횟수 표시 */}
                {subscription?.plan === "pro"
                  ? "무제한"
                  : `${remainingQuizzes}회`}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleNavigation("/sub/subscription")}
            >
              <CreditCard className="mr-2 h-4 w-4" /> 구독 관리
            </Button>
          </div>

          <Separator />

          {/* 하단 메뉴 리스트 */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start py-6"
              onClick={() => handleNavigation("/history")}
            >
              <Clock className="mr-2 h-4 w-4" /> 학습 기록
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start py-6"
              onClick={() => handleNavigation("/contact")}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> 문의하기
            </Button>
          </div>

          <Separator />

          {/* 로그아웃 버튼 */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 py-6"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> 로그아웃
          </Button>

          {/* 탈퇴 버튼  */}
          <button
            onClick={handleWithdrawal}
            className="w-full text-[10px] text-muted-foreground hover:text-destructive mt-2 underline"
          >
            서비스 탈퇴하기
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
