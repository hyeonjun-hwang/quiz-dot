import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { RootLayout } from "./pages/RootLayout.tsx";
import { QuizLoadingPage } from "./pages/Quiz/QuizLoadingPage.tsx";
import { SummaryLoadingPage } from "./pages/Quiz/SummaryLoadingPage.tsx";
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
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
