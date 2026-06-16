import { createBrowserRouter } from "react-router";
import ResumeAnalyzer from "./features/resume-analyzer/pages/ResumeAnalyzer";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import { Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ResumeAnalyzer />,
  },
  {
    path: "/analyze",
    element: <ResumeAnalyzer />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
