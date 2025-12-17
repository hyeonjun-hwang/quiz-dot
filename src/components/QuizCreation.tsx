import { useState } from "react";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase";

interface QuizCreationProps {
  accessToken: string;
  onQuizGenerated: (quizId: string) => void;
  remainingQuizzes: number;
  onUpgradeNeeded: () => void;
}

export function QuizCreation({
  accessToken,
  onQuizGenerated,
  remainingQuizzes,
  onUpgradeNeeded,
}: QuizCreationProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quiz");
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [quizType, setQuizType] = useState("multiple");
  const [difficulty, setDifficulty] = useState("medium");
  const [quizCount, setQuizCount] = useState("10");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("PDF 파일만 업로드 가능합니다");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB 이하여야 합니다");
        return;
      }
      setPdfFile(file);
      toast.success("파일이 선택되었습니다");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!text && !pdfFile) {
      toast.error("텍스트 또는 PDF 파일 중 하나를 입력해주세요");
      return;
    }

    if (text.length > 5000) {
      toast.error("텍스트는 5,000자 이하로 입력해주세요");
      return;
    }

    if (remainingQuizzes <= 0) {
      onUpgradeNeeded();
      return;
    }

    // 로딩 페이지로 이동
    navigate("/quiz-loading");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("quizType", quizType);
      formData.append("difficulty", difficulty);
      formData.append("quizCount", quizCount);
      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e56844d/generate-quiz`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "퀴즈 생성에 실패했습니다");
      }

      const data = await response.json();
      toast.success("퀴즈가 생성되었습니다!");
      onQuizGenerated(data.quizId);
    } catch (err: unknown) {
      console.error("Quiz generation error:", err);
      toast.error(err instanceof Error ? err.message : "퀴즈 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!text && !pdfFile) {
      toast.error("텍스트 또는 PDF 파일 중 하나를 입력해주세요");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e56844d/generate-summary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "요약 생성에 실패했습니다");
      }

      const data = await response.json();
      toast.success("요약이 생성되었습니다!");
      // 요약 결과를 표시하는 모달 등을 띄울 수 있습니다
      alert(data.summary);
    } catch (err: unknown) {
      console.error("Summary generation error:", err);
      toast.error(err instanceof Error ? err.message : "요약 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const isValid = (text.length > 0 || pdfFile !== null) && text.length <= 5000;

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>학습 자료 준비</h1>
          <p className="text-muted-foreground mt-1">
            텍스트를 입력하거나 PDF 파일을 업로드하세요
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          남은 횟수: <span className="text-primary">{remainingQuizzes}회</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quiz">퀴즈 만들기</TabsTrigger>
          <TabsTrigger value="summary">요약하기</TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>학습 자료 입력</CardTitle>
              <CardDescription>
                텍스트 또는 PDF 중 최소 1개 이상 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text-input">
                  텍스트 입력 ({text.length}/5,000자)
                </Label>
                <Textarea
                  id="text-input"
                  placeholder="학습할 내용을 입력하세요..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">또는</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf-upload">PDF 업로드 (최대 10페이지)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    {pdfFile ? (
                      <div className="space-y-1">
                        <p className="text-sm">{pdfFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(pdfFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm">클릭하여 PDF 파일 선택</p>
                        <p className="text-xs text-muted-foreground">
                          최대 10페이지, 10MB 이하
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>퀴즈 옵션</CardTitle>
              <CardDescription>원하는 퀴즈 형태를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="quiz-type">퀴즈 형태</Label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger id="quiz-type">
                    <SelectValue placeholder="퀴즈 형태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple">객관식 (5지선다)</SelectItem>
                    <SelectItem value="short">단답형</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="difficulty">난이도</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">하</SelectItem>
                    <SelectItem value="medium">중</SelectItem>
                    <SelectItem value="hard">상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="quiz-count">퀴즈 개수</Label>
                <Select value={quizCount} onValueChange={setQuizCount}>
                  <SelectTrigger id="quiz-count">
                    <SelectValue placeholder="퀴즈 개수 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5개</SelectItem>
                    <SelectItem value="10">10개</SelectItem>
                    <SelectItem value="15">15개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerateQuiz}
            disabled={!isValid || loading || remainingQuizzes <= 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI 퀴즈 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                AI 퀴즈 생성하기
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>학습 자료 입력</CardTitle>
              <CardDescription>
                요약할 텍스트 또는 PDF를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text-input-summary">
                  텍스트 입력 ({text.length}/5,000자)
                </Label>
                <Textarea
                  id="text-input-summary"
                  placeholder="요약할 내용을 입력하세요..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">또는</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf-upload-summary">PDF 업로드</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="pdf-upload-summary"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload-summary"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    {pdfFile ? (
                      <div className="space-y-1">
                        <p className="text-sm">{pdfFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(pdfFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm">클릭하여 PDF 파일 선택</p>
                        <p className="text-xs text-muted-foreground">
                          최대 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerateSummary}
            disabled={!isValid || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI 요약 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                AI 요약 생성하기
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}