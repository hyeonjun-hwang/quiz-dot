// src/components/ShareDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { updateQuizSharing } from "@/api/updateQuizSharing";
import type { HistoryItem } from "@/api/getHistory";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  quiz: HistoryItem | null;
  onStateChange: (
    quizId: string,
    isShared: boolean,
    sharedToken: string | null
  ) => void;
}

export function ShareDialog({
  open,
  onClose,
  quiz,
  onStateChange,
}: ShareDialogProps) {
  const [isShared, setIsShared] = useState(false);
  const [sharedToken, setSharedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (quiz?.quizzes) {
      setIsShared(quiz.quizzes.is_shared);
      setSharedToken(quiz.quizzes.shared_token);
    }
  }, [quiz]);

  const handleShareToggle = async (checked: boolean) => {
    if (!quiz) return;

    setIsLoading(true);
    try {
      const newSharedToken = await updateQuizSharing(quiz.quiz_id, checked);
      setIsShared(checked);
      setSharedToken(newSharedToken);
      // 부모 컴포넌트의 상태를 업데이트하기 위해 콜백 호출
      onStateChange(quiz.quiz_id, checked, newSharedToken);
      toast.success(
        `공유가 ${checked ? "활성화되었습니다." : "비활성화되었습니다."}`
      );
    } catch (error) {
      toast.error("상태 변경에 실패했습니다. 다시 시도해주세요.");
      // 실패 시 스위치를 원래 상태로 되돌립니다.
      setIsShared(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/shared/${sharedToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast.success("공유 링크가 복사되었습니다!");
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!quiz) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>퀴즈 공유 설정</DialogTitle>
          <DialogDescription>
            공유를 활성화하면 다른 사람도 링크를 통해 이 퀴즈를 풀 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="share-toggle"
              checked={isShared}
              onCheckedChange={handleShareToggle}
              disabled={isLoading}
            />
            <Label htmlFor="share-toggle" className="font-medium">
              공유 활성화
            </Label>
          </div>
          {isShared && sharedToken && (
            <div className="space-y-2">
              <Label htmlFor="share-url">공유 링크</Label>
              <div className="flex items-center space-x-2">
                <Input id="share-url" value={shareUrl} readOnly />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
