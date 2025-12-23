import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Header } from "../../components/Header";
import { SummaryResult } from "../../components/SummaryResult";
import { SideMenu } from "../../components/SideMenu";

export function SummaryResultPage() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // QuizLoadingPage에서 전달받은 요약 데이터
  const summary = location.state?.summary || "";
  const quizData = location.state?.quizData;

  // 요약 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!summary) {
      navigate("/");
    }
  }, [summary, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <SummaryResult
        summary={summary}
        onBack={() => navigate("/quiz/create")}
        quizData={quizData}
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
