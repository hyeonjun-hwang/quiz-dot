import { StrictMode } from "react";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
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

      {/* 전역 알림 설정 */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        visibleToasts={1} // 동시에 여러 개가 쌓이지 않도록 제한
        expand={false} // 토스트가 겹쳐 보이지 않게 설정
      />
    </BrowserRouter>
  </StrictMode>
);
