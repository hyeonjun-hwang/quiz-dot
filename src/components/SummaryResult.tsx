import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Copy, Download, Sparkles, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface SummaryResultProps {
  summary: string;
  onBack: () => void;
  onCreateQuiz?: () => void;
}

export function SummaryResult({ summary, onBack, onCreateQuiz }: SummaryResultProps) {
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [quizType, setQuizType] = useState("multiple");
  const [difficulty, setDifficulty] = useState("medium");
  const [quizCount, setQuizCount] = useState("10");

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

  const handleCreateQuiz = () => {
    toast.success(`퀴즈 생성 시작 (${quizType === "multiple" ? "객관식" : "단답형"}, ${difficulty === "easy" ? "하" : difficulty === "medium" ? "중" : "상"}, ${quizCount}개)`);
    onCreateQuiz?.();
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

      {/* 퀴즈로 만들기 버튼 */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">이 요약으로 퀴즈 만들기</p>
                  <p className="text-sm text-muted-foreground">
                    요약 내용을 기반으로 맞춤형 퀴즈를 생성하세요
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowQuizOptions(!showQuizOptions)}
                className="shrink-0"
              >
                {showQuizOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {showQuizOptions && (
              <div className="space-y-4 pt-4 border-t border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary-quiz-type" className="text-sm">퀴즈 형태</Label>
                    <Select value={quizType} onValueChange={setQuizType}>
                      <SelectTrigger id="summary-quiz-type">
                        <SelectValue placeholder="퀴즈 형태" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple">객관식 (5지선다)</SelectItem>
                        <SelectItem value="short">단답형</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary-difficulty" className="text-sm">난이도</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="summary-difficulty">
                        <SelectValue placeholder="난이도" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">하</SelectItem>
                        <SelectItem value="medium">중</SelectItem>
                        <SelectItem value="hard">상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary-quiz-count" className="text-sm">퀴즈 개수</Label>
                    <Select value={quizCount} onValueChange={setQuizCount}>
                      <SelectTrigger id="summary-quiz-count">
                        <SelectValue placeholder="개수" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5개</SelectItem>
                        <SelectItem value="10">10개</SelectItem>
                        <SelectItem value="15">15개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleCreateQuiz} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  퀴즈 생성하기
                </Button>
              </div>
            )}

            {!showQuizOptions && (
              <Button onClick={() => setShowQuizOptions(true)} className="w-full">
                퀴즈 옵션 선택하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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