import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../../components/Header";
import { QuizResult, type QuizResultData } from "../../components/QuizResult";
import { SideMenu } from "../../components/SideMenu";

const sampleQuizResult: QuizResultData = {
  quizId: "sample-quiz",
  score: 67,
  totalQuestions: 3,
  correctCount: 2,
  questions: [
    {
      id: "q-1",
      question: "대한민국의 수도는 어디인가요?",
      type: "multiple",
      userAnswer: "서울",
      correctAnswer: "서울",
      isCorrect: true,
      explanation: "서울은 대한민국의 수도이자 최대 도시입니다.",
      options: ["서울", "부산", "대구", "인천", "광주"],
    },
    {
      id: "q-2",
      question: "1 + 1은 무엇인가요?",
      type: "short",
      userAnswer: "3",
      correctAnswer: "2",
      isCorrect: false,
      explanation: "1 + 1 = 2 입니다. 기본적인 덧셈 연산입니다.",
    },
    {
      id: "q-3",
      question: "Python은 어떤 종류의 언어인가요?",
      type: "multiple",
      userAnswer: "프로그래밍 언어",
      correctAnswer: "프로그래밍 언어",
      isCorrect: true,
      explanation: "Python은 고급 프로그래밍 언어로, 배우기 쉽고 다양한 용도로 사용됩니다.",
      options: ["프로그래밍 언어", "음식", "동물", "식물", "나라"],
    },
  ],
  submittedAt: new Date().toISOString(),
};

export function QuizResultPage() {
  const navigate = useNavigate();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const handleBackToHome = () => {
    // 홈(퀴즈 생성 페이지)로 이동
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <QuizResult
        result={sampleQuizResult}
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