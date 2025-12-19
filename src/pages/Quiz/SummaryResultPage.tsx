import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../../components/Header";
import { SummaryResult } from "../../components/SummaryResult";
import { SideMenu } from "../../components/SideMenu";

const sampleSummary = `이 자료는 인공지능과 머신러닝의 기초 개념을 다룹니다.

주요 내용:
1. 인공지능(AI)의 정의와 역사
2. 머신러닝의 기본 원리와 알고리즘
3. 딥러닝과 신경망의 구조
4. 실제 응용 사례 및 미래 전망

머신러닝은 데이터로부터 패턴을 학습하여 예측하는 기술이며, 
지도 학습, 비지도 학습, 강화 학습의 세 가지 주요 카테고리로 나뉩니다.
딥러닝은 인공신경망을 활용한 머신러닝의 한 분야로, 
이미지 인식, 자연어 처리 등 다양한 분야에서 혁신적인 성과를 보이고 있습니다.`;

export function SummaryResultPage() {
  const navigate = useNavigate();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const handleCreateQuiz = () => {
    // 퀴즈 풀이 페이지로 이동
    navigate("/quiz-solving");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />
      <SummaryResult
        summary={sampleSummary}
        onBack={() => {}}
        onCreateQuiz={handleCreateQuiz}
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
