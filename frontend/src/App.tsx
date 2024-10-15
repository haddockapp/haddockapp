import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import Setup from "./pages/setup";
import Projects from "./pages/dashboard";
import GithubCallback from "./pages/github";
import { useAppSelector } from "./hooks/useStore";
import { FC } from "react";
import Header from "./components/organisms/Header";
import { Toaster } from "./components/ui/toaster";
import useWebsockets from "./hooks/use-websockets";
import { ConfigProvider } from "./providers/config";
import ProjectDetails from "./pages/project";

const Layout: FC = () => (
  <div className="h-full w-full space-y-8 mb-2 px-2 py-2">
    <Header />
    <div className="overflow-scroll w-full h-full">
      <Outlet />
    </div>
  </div>
);

const AuthenticatedGuard: FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  if (!token || token === "undefined") return <Navigate to="/" />;
  else return <Outlet />;
};

function App() {
  useWebsockets();

  return (
    <ConfigProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/github" element={<GithubCallback />} />
          <Route element={<Layout />}>
            <Route index element={<Setup />} />
            <Route element={<AuthenticatedGuard />}>
              <Route path="dashboard" element={<Projects />} />
              <Route path="project/*">
                <Route path=":projectId" element={<ProjectDetails />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
export default App;
