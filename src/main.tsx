import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { RootLayout } from "./pages/RootLayout.tsx";
import "./index.css";
import App from "./App.tsx";
import Signin from "./pages/auth/sign-in.tsx";
import Signup from "./pages/auth/sign-up.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* ROOT */}
          <Route path="/" element={<App />} />
          {/* AUTH */}
          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<Signup />} />
        </Route>
      </Routes>
      {/* 어떤 페이지에서든 toast 부르기 */}
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  </StrictMode>
);
