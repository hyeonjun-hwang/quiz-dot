import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { RootLayout } from "./pages/RootLayout.tsx";
import { QuizLoadingPage } from "./pages/Quiz/QuizLoadingPage.tsx";
import { SummaryLoadingPage } from "./pages/Quiz/SummaryLoadingPage.tsx";
import { SummaryResultPage } from "./pages/Quiz/SummaryResultPage.tsx";
import { QuizSolvingPage } from "./pages/Quiz/QuizSolvingPage.tsx";
import { QuizResultPage } from "./pages/Quiz/QuizResultPage.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* ROOT */}
          <Route path="/" element={<App />} />
          <Route path="/quiz-loading" element={<QuizLoadingPage />} />
          <Route path="/summary-loading" element={<SummaryLoadingPage />} />
          <Route path="/summary-result" element={<SummaryResultPage />} />
          <Route path="/quiz-solving" element={<QuizSolvingPage />} />
          <Route path="/quiz-result" element={<QuizResultPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
