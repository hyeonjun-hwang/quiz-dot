import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  RotateCcw,
  Home,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export interface QuizResultData {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  questions: {
    id: string;
    question: string;
    type: "multiple" | "short";
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    options?: string[];
  }[];
  submittedAt?: string;
  // 새로 추가
  submissionId: string;
}

interface QuizResultProps {
  result: QuizResultData;
  onRetryWrong: () => void;
  onBackToHome: () => void;
  onShare: () => void;
}

export function QuizResult({
  result,
  onRetryWrong,
  onBackToHome,
  onShare,
}: QuizResultProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  // const handleShare = async () => {
  //   const shareText = `QUIZ. 학습 결과\n점수: ${result.score}점 (${result.correctCount}/${result.totalQuestions})\n\n지금 바로 퀴즈를 만들어보세요!`;

  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: "QUIZ. 학습 결과",
  //         text: shareText,
  //       });
  //     } catch (err) {
  //       console.log("Share cancelled or failed", err);
  //     }
  //   } else {
  //     // Fallback: copy to clipboard
  //     await navigator.clipboard.writeText(shareText);
  //     alert("결과가 클립보드에 복사되었습니다!");
  //   }
  // };

  const wrongQuestions = result.questions.filter((q) => !q.isCorrect);
  const percentage = Math.round(
    (result.correctCount / result.totalQuestions) * 100
  );

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center space-y-4">
          <CardTitle>학습 완료!</CardTitle>
          <div className="flex flex-col items-center space-y-4">
            {/* 원형 프로그레스 바 */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                {/* 배경 원 */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                {/* 진행률 원 */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 56 * (1 - percentage / 100)
                  }`}
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              {/* 중앙 텍스트 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl text-primary">{percentage}%</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              {result.correctCount} / {result.totalQuestions} 문제 정답
            </div>
            <div className="text-2xl">{result.score}점</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 mb-2 text-blue-600 " />
              <div className="text-2xl font-medium">{result.correctCount}</div>
              <div className="text-sm text-muted-foreground">정답</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-destructive/10 rounded-lg">
              <XCircle className="h-8 w-8 text-destructive mb-2" />
              <div className="text-2xl">
                {result.totalQuestions - result.correctCount}
              </div>
              <div className="text-sm text-muted-foreground">오답</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              공유하기
            </Button>
            {wrongQuestions.length > 0 && (
              <Button className="flex-1" onClick={onRetryWrong}>
                <RotateCcw className="h-4 w-4 mr-2" />
                오답 다시 풀기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2>문제 상세 보기</h2>
        {result.questions.map((question, idx) => {
          const isExpanded = expandedQuestions.has(question.id);
          const isCorrect = question.isCorrect;

          return (
            <Collapsible
              key={question.id}
              open={isExpanded}
              onOpenChange={() => toggleQuestion(question.id)}
            >
              <Card
                className={
                  isCorrect ? "border-success/30" : "border-destructive/30"
                }
              >
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 text-left">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        )}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>Q{idx + 1}.</span>
                            <Badge
                              variant={
                                question.type === "multiple"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {question.type === "multiple"
                                ? "객관식"
                                : "단답형"}
                            </Badge>
                          </div>
                          <p>{question.question}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-5 w-5 shrink-0 mt-0.5" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">
                          내 답변
                        </p>
                        <p
                          className={
                            isCorrect
                              ? "text-blue-600 font-medium"
                              : "text-destructive"
                          }
                        >
                          {question.userAnswer || "(답변 없음)"}
                        </p>
                      </div>

                      {!isCorrect && (
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-sm text-muted-foreground mb-1">
                            정답
                          </p>
                          <p className="text-blue-600 font-medium">
                            {question.correctAnswer}
                          </p>
                        </div>
                      )}

                      {question.type === "multiple" && question.options && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            선택지
                          </p>
                          <div className="space-y-1">
                            {question.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2 rounded text-sm ${
                                  option === question.correctAnswer
                                    ? "bg-blue-50 text-blue-600 font-medium border border-blue-200"
                                    : option === question.userAnswer
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted"
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">
                            해설
                          </p>
                          <p className="text-sm">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <Button variant="outline" className="w-full" onClick={onBackToHome}>
        <Home className="h-4 w-4 mr-2" />
        홈으로 돌아가기
      </Button>
    </div>
  );
}
