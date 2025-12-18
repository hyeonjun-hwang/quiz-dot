import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../../components/Header";
import { QuizSolving, type Question } from "../../components/QuizSolving";
import { SideMenu } from "../../components/SideMenu";

const sampleQuestions: Question[] = [
  {
    id: "q-1",
    question: "대한민국의 수도는 어디인가요?",
    type: "multiple",
    options: ["서울", "부산", "대구", "인천", "광주"],
    answer: "서울",
  },
  {
    id: "q-2",
    question: "1 + 1은 무엇인가요?",
    type: "short",
    answer: "2",
  },
  {
    id: "q-3",
    question: "Python은 어떤 종류의 언어인가요?",
    type: "multiple",
    options: ["프로그래밍 언어", "음식", "동물", "식물", "나라"],
    answer: "프로그래밍 언어",
  },
];

export function QuizSolvingPage() {
  const navigate = useNavigate();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const handleSubmit = () => {
    // 퀴즈 결과 페이지로 이동
    navigate("/quiz-result");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <QuizSolving
        questions={sampleQuestions}
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