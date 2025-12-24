import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSharedQuiz, type SharedQuizData } from "@/api/getSharedQuiz";
import { scoreQuiz } from "@/api/submitQuiz";
import type { UserAnswers } from "@/types/quiz";
import type { QuizResultData } from "@/components/QuizResult";
import { QuizSolving, type Question } from "@/components/QuizSolving";
import { QuizResult } from "@/components/QuizResult";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type PageStatus = "loading" | "error" | "solving" | "result";

export function SharedQuizPage() {
  const { shared_token } = useParams<{ shared_token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PageStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<SharedQuizData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);

  useEffect(() => {
    if (!shared_token) {
      setError("유효하지 않은 공유 링크입니다.");
      setStatus("error");
      return;
    }

    const fetchQuiz = async () => {
      try {
        setStatus("loading");
        const data = await getSharedQuiz(shared_token);
        setQuizData(data);
        setStatus("solving");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "퀴즈를 불러오는 데 실패했습니다."
        );
        setStatus("error");
      }
    };

    fetchQuiz();
  }, [shared_token]);

  // 퀴즈 제출 및 채점 핸들러
  const handleSubmit = (
    answers: Record<string, { answer: string; dontKnow: boolean }>
  ) => {
    if (!quizData) return;

    // `scoreQuiz`가 요구하는 `UserAnswers` (Record<number, string>) 형태로 변환
    const formattedAnswers: UserAnswers = {};
    for (const questionId in answers) {
      const numericId = Number(questionId);
      const answerData = answers[questionId];
      if (answerData.dontKnow) {
        formattedAnswers[numericId] = "잘모르겠음";
      } else {
        formattedAnswers[numericId] = answerData.answer;
      }
    }

    // `scoreQuiz` 함수를 재사용하여 클라이언트 측에서 채점
    const scoringResult = scoreQuiz(formattedAnswers, quizData.quiz_content);

    // `QuizResult` 컴포넌트에 필요한 형태로 데이터 가공
    const resultData: QuizResultData = {
      quizId: quizData.id,
      score: scoringResult.score,
      totalQuestions: scoringResult.total_count,
      correctCount: scoringResult.correct_count,
      questions: scoringResult.results.map((res) => {
        // `scoringResult.results`의 각 항목에 해당하는 원본 퀴즈 질문을 `quizData.quiz_content.quizzes`에서 찾습니다.
        // `id`는 number일 수 있으므로 `String()`으로 통일하여 비교합니다.
        const originalQuestion = quizData.quiz_content.quizzes.find(
          (q) => String(q.id) === String(res.questionId)
        );

        // 원본 질문을 찾지 못했을 경우 (비정상적인 상황), 기본값으로 처리하거나 오류를 던질 수 있습니다.
        // 여기서는 안전하게 기본값을 반환합니다.
        if (!originalQuestion) {
          console.error("원본 질문을 찾을 수 없습니다. 결과 항목:", res);
          return {
            id: String(res.questionId),
            question: res.question,
            userAnswer: res.user_answer,
            correctAnswer: res.correct_answer,
            isCorrect: res.is_correct,
            explanation: res.explanation || "해설 없음",
            type: "short", // 기본 타입
            options: undefined,
          };
        }

        return {
          id: String(res.questionId),
          question: res.question,
          userAnswer: res.user_answer,
          correctAnswer: res.correct_answer,
          isCorrect: res.is_correct,
          explanation: originalQuestion.explanation,
          type:
            originalQuestion.options && originalQuestion.options.length > 0
              ? "multiple"
              : "short",
          options: originalQuestion.options,
        };
      }),
    };

    setQuizResult(resultData);
    setStatus("result");
    window.scrollTo(0, 0); // 결과 화면으로 전환 시 맨 위로 스크롤
  };

  // 문제 형식 변환
  const questions: Question[] =
    quizData?.quiz_content.quizzes.map((q) => ({
      id: String(q.id),
      question: q.question,
      type: q.options && q.options.length > 0 ? "multiple" : "short",
      options: q.options,
      answer: q.answer, // 채점을 위해 정답 정보도 포함
    })) || [];

  // --- 렌더링 로직 ---

  if (status === "loading") {
    return (
      <div className="container max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">퀴즈 불러오는 중...</h1>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">오류 발생</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/80">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 공유 페이지에서는 메뉴 버튼이 없는 간단한 헤더를 사용 */}

      <div className="pt-4">
        {quizData && status === "solving" && (
          <>
            <h1 className="text-2xl font-bold text-center mb-4">
              {quizData.title || "공유된 퀴즈"}
            </h1>
            <QuizSolving questions={questions} onSubmit={handleSubmit} />
          </>
        )}
        {quizResult && status === "result" && (
          <QuizResult
            result={quizResult}
            onRetryWrong={() => setStatus("solving")} // 오답 다시 풀기는 solving 상태로 전환
            onBackToHome={() => navigate("/")} // 홈으로 이동
          />
        )}
      </div>
    </div>
  );
}
