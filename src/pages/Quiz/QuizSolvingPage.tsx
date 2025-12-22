import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Header } from "../../components/Header";
import { QuizSolving, type Question } from "../../components/QuizSolving";
import { SideMenu } from "../../components/SideMenu";

export function QuizSolvingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // QuizLoadingPage에서 전달받은 퀴즈 데이터
    const quizData = location.state?.quizData;

    if (quizData && quizData.quizzes) {
      // API 응답 데이터를 Question 타입으로 변환
      const convertedQuestions: Question[] = quizData.quizzes.map((quiz: any, index: number) => ({
        id: `q-${quiz.id || index + 1}`,
        question: quiz.question,
        type: quiz.options && quiz.options.length > 0 ? "multiple" : "short",
        options: quiz.options || undefined,
        answer: quiz.answer,
        explanation: quiz.explanation,
      }));

      setQuestions(convertedQuestions);
    } else {
      // 퀴즈 데이터가 없으면 홈으로 이동
      navigate("/");
    }
  }, [location.state, navigate]);

  const handleSubmit = (userAnswers: Record<string, { answer: string; dontKnow: boolean }>) => {
    // 사용자 답안과 퀴즈 데이터를 QuizResultPage로 전달
    navigate("/quiz/result", {
      state: {
        questions: questions,
        userAnswers: userAnswers,
        quizData: location.state?.quizData,
      },
    });
  };

  // 퀴즈 데이터가 로드되지 않았으면 로딩 표시
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <QuizSolving
        questions={questions}
        onSubmit={handleSubmit}
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