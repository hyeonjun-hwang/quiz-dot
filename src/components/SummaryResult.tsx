import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Copy, Download, PlayCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { QuizContent } from "@/types/quiz";

interface SummaryResultProps {
  summary: string;
  onBack: () => void;
  quizData?: QuizContent;
}

export function SummaryResult({ summary, onBack, quizData }: SummaryResultProps) {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success("요약이 클립보드에 복사되었습니다");
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `요약_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("요약이 다운로드되었습니다");
  };

  const handleStartQuiz = () => {
    if (quizData) {
      // 퀴즈 데이터가 있으면 퀴즈 풀이 페이지로 이동
      navigate("/quiz/solving", {
        state: {
          quizData: quizData,
        },
      });
    } else {
      // 퀴즈 데이터가 없으면 퀴즈 생성 페이지로 이동
      toast.error("퀴즈 데이터가 없습니다. 퀴즈를 먼저 생성해주세요.");
      navigate("/quiz/create");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>AI 요약 결과</h1>
          <p className="text-muted-foreground mt-1">
            학습 자료가 핵심 내용으로 요약되었습니다
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>요약 내용</CardTitle>
          </div>
          <CardDescription>
            AI가 분석한 핵심 요약입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div className="flex-1 whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 퀴즈 풀기 버튼 */}
      <Button
        onClick={handleStartQuiz}
        className="w-full"
        size="lg"
      >
        <PlayCircle className="mr-2 h-5 w-5" />
        퀴즈 풀기
      </Button>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          복사하기
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
        <Button
          className="flex-1"
          onClick={onBack}
        >
          새 요약 만들기
        </Button>
      </div>
    </div>
  );
}