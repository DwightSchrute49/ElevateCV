import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import ThemeToggle from "./features/theme/ThemeToggle";

function App() {
  return (
    <>
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 999 }}>
        <ThemeToggle />
      </div>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
