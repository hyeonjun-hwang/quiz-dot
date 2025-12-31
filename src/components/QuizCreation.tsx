// React 및 라우팅 관련 라이브러리
import { useState } from "react"; // 상태 관리를 위한 React Hook
import { useNavigate } from "react-router"; // 페이지 이동을 위한 React Router Hook

// UI 컴포넌트들 (shadcn/ui 라이브러리)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"; // 카드 레이아웃
import { Button } from "./ui/button"; // 버튼 컴포넌트
import { Textarea } from "./ui/textarea"; // 텍스트 입력 영역
import { Label } from "./ui/label"; // 라벨 컴포넌트
import { Input } from "./ui/input"; // 파일 업로드 input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"; // 드롭다운 선택
import { Checkbox } from "./ui/checkbox"; // 체크박스

// 아이콘 및 알림 라이브러리
import { Upload, Sparkles } from "lucide-react"; // 아이콘 (업로드, 생성)
import { toast } from "sonner"; // 토스트 알림 (성공, 에러 메시지 표시)

// Supabase 설정 및 유틸리티
import pdfToText from "react-pdftotext"; // PDF를 텍스트로 변환하는 라이브러리

/**
 * QuizCreation 컴포넌트의 Props 타입 정의
 * @param accessToken - 사용자 인증을 위한 액세스 토큰
 * @param remainingQuizzes - 사용자가 생성할 수 있는 남은 퀴즈 개수
 * @param onUpgradeNeeded - 퀴즈 개수 제한에 도달했을 때 호출되는 콜백 (업그레이드 안내)
 */
interface QuizCreationProps {
  accessToken: string;
  remainingQuizzes: number;
  onUpgradeNeeded: () => void;
}

/**
 * QuizCreation 컴포넌트
 * 사용자가 텍스트 또는 PDF 파일을 입력하여 AI 퀴즈 또는 요약을 생성할 수 있는 메인 페이지
 */
export function QuizCreation({
  accessToken, // NOTE: 현재 미사용 - API 함수가 내부에서 supabase.auth.getSession()으로 직접 토큰을 가져옴. 추후 Props 인터페이스에서 제거 예정
  remainingQuizzes,
  onUpgradeNeeded,
}: QuizCreationProps) {
  // accessToken은 현재 사용되지 않지만 Props 호환성을 위해 유지 (추후 삭제 예정)
  void accessToken;
  // ===== 상태 관리 =====
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
  const [text, setText] = useState(""); // 사용자가 입력한 텍스트
  const [pdfFile, setPdfFile] = useState<File | null>(null); // 업로드된 PDF 파일 (File 객체 또는 null)
  const [quizType, setQuizType] = useState("multiple"); // 퀴즈 형태 ("multiple" = 객관식, "short" = 단답형)
  const [difficulty, setDifficulty] = useState("medium"); // 난이도 ("easy", "medium", "hard")
  const [quizCount, setQuizCount] = useState("10"); // 생성할 퀴즈 개수 ("5", "10", "15")
  const [generateSummary, setGenerateSummary] = useState(false); // 요약 생성 여부 (체크박스)

  /**
   * PDF 파일 업로드 핸들러
   * 사용자가 PDF 파일을 선택했을 때 호출되는 함수
   * @param e - 파일 input의 change 이벤트
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // 선택된 첫 번째 파일 가져오기
    if (file) {
      // 1. 파일 타입 검증: PDF 파일만 허용
      if (file.type !== "application/pdf") {
        toast.error("PDF 파일만 업로드 가능합니다");
        return;
      }
      // 2. 파일 크기 검증: 10MB 이하만 허용
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB 이하여야 합니다");
        return;
      }

      // 3. 검증 통과 시 파일 저장 (아직 텍스트로 변환하지 않음)
      setPdfFile(file);
      toast.success("PDF 파일이 업로드되었습니다");
    }
  };

  /**
   * 통합 생성 핸들러
   * 요약 체크박스 여부에 상관없이 QuizLoadingPage로 이동
   */
  const handleGenerate = async () => {
    // 요약 생성 여부에 상관없이 퀴즈 생성 후 QuizLoadingPage로 이동
    await handleGenerateQuiz();
  };

  /**
   * 퀴즈 생성 핸들러
   * "AI 퀴즈 생성하기" 버튼을 클릭했을 때 호출되는 함수
   * PDF 파일이 있으면 텍스트로 변환 후 QuizLoadingPage로 이동
   */
  const handleGenerateQuiz = async () => {
    // ===== 1. 입력 검증 =====
    // 텍스트와 PDF 파일이 모두 없으면 에러
    if (!text && !pdfFile) {
      toast.error("텍스트를 입력하거나 PDF 파일을 업로드해주세요");
      return;
    }

    // 텍스트 길이 제한 검증 (5,000자 초과 불가)
    if (text.length > 5000) {
      toast.error("텍스트는 5,000자 이하로 입력해주세요");
      return;
    }

    // 남은 퀴즈 생성 횟수 확인 (무료 사용자 제한)
    if (remainingQuizzes <= 0) {
      onUpgradeNeeded(); // 업그레이드 안내 모달 표시
      return;
    }

    try {
      // ===== 2. PDF 파일 텍스트 변환 =====
      let combinedText = text; // 기본값은 사용자가 입력한 텍스트
      if (pdfFile) {
        toast.info("PDF를 텍스트로 변환 중...");
        try {
          // pdfToText 라이브러리를 사용하여 PDF → 텍스트 변환
          const extractedText = await pdfToText(pdfFile);
          if (extractedText.trim()) {
            // 기존 텍스트가 있으면 "\n\n"로 구분하여 합치기
            combinedText = text ? `${text}\n\n${extractedText}` : extractedText;
            toast.success("PDF가 텍스트로 변환되었습니다");
          }
        } catch (error) {
          // PDF 변환 실패 시 에러 처리
          console.error("PDF 변환 오류:", error);
          toast.error("PDF 변환 중 오류가 발생했습니다");
          return;
        }
      }

      // ===== 3. 로딩 페이지로 즉시 이동 (API 호출 전) =====
      // QuizLoadingPage에서 API를 호출하도록 필요한 정보만 전달
      navigate("/quiz/loading", {
        state: {
          quizRequest: {
            text: combinedText,
            type: quizType === "multiple" ? "multiple_choice" : "short_answer",
            count: parseInt(quizCount),
            difficulty: difficulty,
          },
          generateSummary: generateSummary, // 요약 생성 여부 플래그
        },
      });
    } catch (err: unknown) {
      // ===== 4. 에러 처리 =====
      console.error("Quiz generation preparation error:", err);
      toast.error(
        err instanceof Error ? err.message : "퀴즈 생성 준비에 실패했습니다"
      );
    }
  };

  // ===== 유효성 검사 =====
  // 버튼 활성화 조건: (텍스트가 있거나 PDF가 있음) AND (텍스트가 5000자 이하)
  const isValid = (text.length > 0 || pdfFile !== null) && text.length <= 5000;

  // ===== JSX 렌더링 =====
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* 헤더: 제목 및 남은 횟수 표시 */}
      <div className="flex items-center justify-between">
        <div>
          <h1>학습 자료 준비</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            텍스트를 입력하거나 PDF 파일을 업로드하세요
          </p>
        </div>
        {/* 남은 퀴즈 생성 횟수 (무료 사용자 제한) */}
        <div className="flex flex-col items-end text-xs text-muted-foreground">
          <p>남은 횟수</p>
          <p className="text-primary">{remainingQuizzes}회</p>
        </div>
      </div>

      {/* 카드 1: 학습 자료 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>학습 자료 입력</CardTitle>
          <CardDescription>
            텍스트 또는 PDF 중 최소 1개 이상 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 텍스트 입력 영역 */}
          <div className="space-y-2">
            <Label htmlFor="text-input">
              텍스트 입력 ({text.length}/5,000자)
            </Label>
            <Textarea
              id="text-input"
              placeholder="학습할 내용을 입력하세요..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-50 resize-none"
              maxLength={5000}
            />
          </div>

          {/* 구분선 "또는" */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* PDF 파일 업로드 영역 */}
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

      {/* 카드 2: 퀴즈 옵션 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>퀴즈 옵션</CardTitle>
          <CardDescription>원하는 퀴즈 형태를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 퀴즈 형태 선택 (객관식 / 단답형) */}
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

          {/* 요약 생성 체크박스 */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="generate-summary"
              checked={generateSummary}
              onCheckedChange={(checked) =>
                setGenerateSummary(checked === true)
              }
            />
            <Label
              htmlFor="generate-summary"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              요약도 함께 생성하기
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* 생성 버튼 */}
      <Button
        onClick={handleGenerate}
        disabled={!isValid}
        className="w-full"
        size="lg"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        AI 퀴즈 생성하기
      </Button>
    </div>
  );
}
