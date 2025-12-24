import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { QuizResult, type QuizResultData } from "../../components/QuizResult";
import type { Question } from "../../components/QuizSolving";

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

  const handleRetryWrong = () => {
    // 오답 문제만 필터링
    const { questions, quizData } = location.state || {};

    if (!questions || !quizResult) {
      return;
    }

    // isCorrect가 false인 문제들만 추출
    const wrongQuestionIds = quizResult.questions
      .filter((q) => !q.isCorrect)
      .map((q) => q.id);

    const wrongQuestions = questions.filter((q: Question) =>
      wrongQuestionIds.includes(q.id)
    );

    // QuizSolvingPage가 기대하는 형식으로 변환 (Question -> API quiz 형식)
    const wrongQuizzesInApiFormat = wrongQuestions.map((q: Question) => ({
      id: q.id.replace('q-', ''), // "q-1" -> "1"
      question: q.question,
      type: q.type,
      options: q.options || [],
      answer: q.answer,
      explanation: (q as any).explanation || "해설이 제공되지 않았습니다.",
    }));

    // 오답 문제들로 다시 퀴즈 풀기 페이지로 이동
    navigate("/quiz/solving", {
      state: {
        quizData: {
          ...quizData,
          quizzes: wrongQuizzesInApiFormat, // quizzes 속성으로 전달
        },
      },
    });
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