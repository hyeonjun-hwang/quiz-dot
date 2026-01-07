import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { RootLayout } from "./pages/RootLayout.tsx";
import { QuizCreationPage } from "./pages/Quiz/QuizCreationPage.tsx";
import { QuizLoadingPage } from "./pages/Quiz/QuizLoadingPage.tsx";
import { SummaryResultPage } from "./pages/Quiz/SummaryResultPage.tsx";
import { QuizSolvingPage } from "./pages/Quiz/QuizSolvingPage.tsx";
import { QuizResultPage } from "./pages/Quiz/QuizResultPage.tsx";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import SignCallback from "./pages/auth/sign-callback.tsx";
import Subscription from "./pages/sub/subscription.tsx";
import SubscriptionCancel from "./pages/sub/subscription-cancel.tsx";
import { HistoryPage } from "./pages/History/HistoryPage.tsx";
import { SharedQuizPage } from "./pages/Quiz/SharedQuizPage.tsx";
import { ContactBoardPage } from "./pages/Contact/ContactBoardPage.tsx";
import { ProtectedRoute } from "./components/auth/protect-route.tsx";
import { useAuthStore } from "./stores/auth"; // AuthStore 임포트

// 1. 초기화 컴포넌트
function AppInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // 앱이 실행되자마자 서버에서 세션 및 유저 정보 초기화
    initialize();
  }, [initialize]);

  return (
    <Routes>
      {/* 공통 레이아웃(네비게이션 바 등)이 적용되는 페이지들 */}
      {/* 로그인이 필요한 서비스  */}
      <Route
        element={
          <ProtectedRoute>
            <RootLayout />
          </ProtectedRoute>
        }
      >
        {/* 퀴즈 생성 페이지 */}
        <Route path="/quiz/create" element={<QuizCreationPage />} />

        {/* 퀴즈 관련 경로 */}
        <Route path="/quiz/loading" element={<QuizLoadingPage />} />
        <Route path="/quiz/solving" element={<QuizSolvingPage />} />
        <Route path="/quiz/result" element={<QuizResultPage />} />

        {/* 요약 관련 경로 */}
        <Route path="/summary/result" element={<SummaryResultPage />} />

        {/* 학습 기록 */}
        <Route path="/history" element={<HistoryPage />} />

        {/* 문의 게시판 */}
        <Route path="/contact" element={<ContactBoardPage />} />

        {/* 구독 페이지 */}
        <Route path="/sub/subscription" element={<Subscription />} />

        {/* 구독 취소 페이지 */}
        <Route
          path="/sub/subscriptioncancel"
          element={<SubscriptionCancel />}
        />
      </Route>

      {/* 레이아웃 없이 단독으로 보여줄 페이지 (로그인 등) */}

      {/* 로그인페이지 */}
      <Route path="/" element={<App />} />
      {/* 콜백 페이지 */}
      <Route path="/auth/callback" element={<SignCallback />} />

      {/* 퀴즈 공유 페이지 */}
      <Route path="/shared/:shared_token" element={<SharedQuizPage />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 2. Routes 대신 초기화 로직이 포함된 AppInitializer 렌더링 */}
      <AppInitializer />

      {/* 전역 알림 설정 */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        visibleToasts={1}
        expand={false}
      />
    </BrowserRouter>
  </StrictMode>
);
