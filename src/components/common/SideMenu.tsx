import { CreditCard, MessageSquare, LogOut, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName?: string;
  subscription: {
    tier: "FREE" | "PRO";
    remainingQuizzes: number;
  };
  onNavigate: (page: string) => void;
}

export function SideMenu({
  open,
  onClose,
  onLogout,
  userName,
  subscription,
  onNavigate,
}: SideMenuProps) {
  const navigate = useNavigate();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-75 sm:w-100 rounded-l-2xl">
        <SheetHeader className="px-2">
          <SheetTitle>마이페이지</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-6 px-2">
          <div className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground">사용자</p>
            <p className="text-lg">{userName || "사용자"}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">구독 상태</p>
              <Badge
                variant={subscription.tier === "PRO" ? "default" : "secondary"}
              >
                {subscription.tier}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">잔여 퀴즈 생성</p>
              <p>{subscription.remainingQuizzes}회</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleNavigation("subscription")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              구독 관리
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/history")}
            >
              <Clock className="mr-2 h-4 w-4" />
              학습 기록
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation("contact")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              문의하기
            </Button>
          </div>

          <Separator />

          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
