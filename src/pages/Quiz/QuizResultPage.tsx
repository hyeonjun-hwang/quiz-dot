import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { QuizResult, type QuizResultData } from "../../components/QuizResult";
import type { Question } from "../../components/QuizSolving";
import { generateQuiz } from "@/api/generateQuiz";
import { toast } from "sonner";

export function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);

  useEffect(() => {
    // QuizSolvingPage에서 전달받은 데이터
    const { questions, userAnswers, quizData } = location.state || {};

    if (!questions || !userAnswers) {
      // 데이터가 없으면 홈으로 이동
      navigate("/");
      return;
    }

    // 채점 로직: 각 문제를 채점하고 결과 데이터 생성
    let correctCount = 0;
    const gradedQuestions = questions.map((question: Question) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.answer || "";

      // "모르겠어요" 체크 여부와 답안 확인
      const userAnswerText = userAnswer?.dontKnow ? "모르겠어요" : (userAnswer?.answer || "");

      // 정답 비교 (대소문자 구분 없이, 공백 제거)
      const isCorrect = !userAnswer?.dontKnow &&
        userAnswerText.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        correctCount++;
      }

      return {
        id: question.id,
        question: question.question,
        type: question.type,
        userAnswer: userAnswerText,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        explanation: (question as any).explanation || "해설이 제공되지 않았습니다.",
        options: question.options,
      };
    });

    // 점수 계산 (0-100점)
    const score = Math.round((correctCount / questions.length) * 100);

    const result: QuizResultData = {
      quizId: quizData?.quizId || `quiz-${Date.now()}`,
      score: score,
      totalQuestions: questions.length,
      correctCount: correctCount,
      questions: gradedQuestions,
      submittedAt: new Date().toISOString(),
    };

    setQuizResult(result);
  }, [location.state, navigate]);

  const handleBackToHome = () => {
    // 퀴즈 생성 페이지로 이동
    navigate("/quiz/create");
  };

  const handleRetryWrong = async () => {
    // 오답 문제만 필터링
    const { questions, quizData } = location.state || {};

    if (!questions || !quizResult) {
      return;
    }

    // isCorrect가 false인 문제들만 추출
    const wrongQuestions = quizResult.questions
      .filter((q) => !q.isCorrect)
      .map((q) => q.question);

    if (wrongQuestions.length === 0) {
      toast.info("틀린 문제가 없습니다.");
      return;
    }

    try {
      console.log("=== 오답 다시 풀기 시작 ===");
      console.log("틀린 문제 개수:", wrongQuestions.length);
      console.log("틀린 문제들:", wrongQuestions);

      toast.loading("틀린 문제와 관련된 새로운 퀴즈를 생성하는 중...");

      // 틀린 문제들을 학습 자료 텍스트로 변환
      const wrongQuestionsText = wrongQuestions.join("\n\n");

      // quizData에서 원본 설정 가져오기 (없으면 기본값 사용)
      const quizType = quizData?.type || "multiple_choice";
      const quizDifficulty = quizData?.difficulty || "medium";
      const quizCount = wrongQuestions.length; // 틀린 문제 수만큼

      console.log("요청할 퀴즈 개수:", quizCount);

      // 틀린 문제들을 기반으로 새로운 퀴즈 생성
      const newQuizData = await generateQuiz({
        text: wrongQuestionsText,
        type: quizType,
        count: quizCount,
        difficulty: quizDifficulty,
        failedQuestions: wrongQuestions,
      });

      console.log("생성된 퀴즈 데이터:", newQuizData);
      console.log("생성된 퀴즈 개수:", newQuizData?.quizzes?.length || 0);

      // 퀴즈 개수 검증
      const generatedCount = newQuizData?.quizzes?.length || 0;
      if (generatedCount !== quizCount) {
        console.warn(`⚠️ 요청한 문제 개수(${quizCount})와 생성된 문제 개수(${generatedCount})가 다릅니다!`);
        toast.warning(`${quizCount}개 요청했으나 ${generatedCount}개만 생성되었습니다.`);
      }

      toast.dismiss();
      toast.success(`새로운 퀴즈 ${generatedCount}개가 생성되었습니다!`);

      // 생성된 퀴즈로 문제 풀이 페이지로 이동
      navigate("/quiz/solving", {
        state: {
          quizData: newQuizData,
        },
      });
    } catch (error) {
      toast.dismiss();
      console.error("퀴즈 생성 오류:", error);
      toast.error(error instanceof Error ? error.message : "퀴즈 생성에 실패했습니다.");
    }
  };

  // 퀴즈 결과가 로드되지 않았으면 로딩 표시
  if (!quizResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">결과를 계산하는 중...</p>
      </div>
    );
  }

  return (
    <QuizLayout>
      <QuizResult
        result={quizResult}
        onRetryWrong={handleRetryWrong}
        onBackToHome={handleBackToHome}
      />
    </QuizLayout>
  );
}