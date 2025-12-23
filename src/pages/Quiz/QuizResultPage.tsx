import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Header } from "../../components/common/Header";
import { QuizResult, type QuizResultData } from "../../components/QuizResult";
import { SideMenu } from "../../components/common/SideMenu";
import type { Question } from "../../components/QuizSolving";

export function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
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

  // 퀴즈 결과가 로드되지 않았으면 로딩 표시
  if (!quizResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">결과를 계산하는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <QuizResult
        result={quizResult}
        onRetryWrong={() => {}}
        onBackToHome={handleBackToHome}
      />

      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onLogout={() => {}}
        userName="디자인 데모"
        subscription={{
          tier: "FREE",
          remainingQuizzes: 5,
        }}
        onNavigate={() => {}}
      />
    </div>
  );
}