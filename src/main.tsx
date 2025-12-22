import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router"; // react-router-dom을 사용 중이라면 확인 필요
import { RootLayout } from "./pages/RootLayout.tsx";
import { QuizCreationPage } from "./pages/Quiz/QuizCreationPage.tsx";
import { QuizLoadingPage } from "./pages/Quiz/QuizLoadingPage.tsx";
import { SummaryResultPage } from "./pages/Quiz/SummaryResultPage.tsx";
import { QuizSolvingPage } from "./pages/Quiz/QuizSolvingPage.tsx";
import { QuizResultPage } from "./pages/Quiz/QuizResultPage.tsx";
import "./index.css";
import App from "./App.tsx";
import Signin from "./pages/auth/sign-in.tsx";
import { Toaster } from "sonner";
import SignCallback from "./pages/auth/sign-callback.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 공통 레이아웃(네비게이션 바 등)이 적용되는 페이지들 */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<App />} />

          {/* 퀴즈 생성 페이지 */}
          <Route path="/quiz/create" element={<QuizCreationPage />} />

          {/* 퀴즈 관련 경로 */}
          <Route path="/quiz/loading" element={<QuizLoadingPage />} />
          <Route path="/quiz/solving" element={<QuizSolvingPage />} />
          <Route path="/quiz/result" element={<QuizResultPage />} />

          {/* 요약 관련 경로 */}
          <Route path="/summary/result" element={<SummaryResultPage />} />
        </Route>

        {/* 레이아웃 없이 단독으로 보여줄 페이지 (로그인/회원가입 등) */}
        <Route path="/sign-in" element={<Signin />} />
        {/* 콜백 페이지 */}
        <Route path="/auth/callback" element={<SignCallback />} />
      </Routes>

      {/* 전역 알림 설정 */}
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  </StrictMode>
);
