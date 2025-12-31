import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, Share2, AlertCircle } from "lucide-react";
import { getHistory, type HistoryItem } from "@/api/getHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareDialog } from "@/components/ShareDialog";
import { useShareQuiz } from "@/hooks/use-share-quiz";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 1. 리팩토링된 훅 호출
  const { sharingQuiz, openShareDialog, closeShareDialog } = useShareQuiz();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const historyData = await getHistory();
        setHistory(historyData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // sharingQuiz 상태가 변경될 때마다 history 배열을 업데이트하여
  // UI가 공유 상태(is_shared, shared_token) 변경을 즉시 반영하도록 함
  const handleQuizSharingUpdate = (
    quizId: string,
    isShared: boolean,
    sharedToken: string | null
  ) => {
    setHistory((prevHistory) =>
      prevHistory.map((item) => {
        if (item.quiz_id === quizId && item.quizzes) {
          return {
            ...item,
            quizzes: {
              ...item.quizzes,
              is_shared: isShared,
              shared_token: sharedToken,
            },
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Header onMenuClick={() => setSideMenuOpen(true)} /> */}
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <div>
          <h1>학습 기록</h1>
          <p className="text-muted-foreground mt-1">
            지금까지의 학습 결과를 확인하세요
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">
                  오류가 발생했습니다
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive/80">{error}</p>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">아직 학습 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {item.quizzes?.title || "퀴즈 제목 없음"}
                      </CardTitle>
                    </div>
                    <Badge variant={item.score >= 80 ? "default" : "secondary"}>
                      {item.score}점
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          {item.correct_count} / {item.total_count} 정답
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          {new Date(item.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                    </div>
                    {/* 2. 훅에서 반환된 함수 사용 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShareDialog(item)}
                      className="flex gap-0"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      <p>공유하기</p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. 부모 컴포넌트가 직접 렌더링하고, 훅의 상태와 핸들러를 전달 */}
      <ShareDialog
        open={!!sharingQuiz}
        onClose={closeShareDialog}
        quiz={sharingQuiz}
        onStateChange={handleQuizSharingUpdate}
      />
    </div>
  );
}
