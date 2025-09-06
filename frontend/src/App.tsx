import { BrowserRouter, Route, Routes } from "react-router-dom";
import Setup from "./pages/setup";
import Projects from "./pages/dashboard";
import GithubCallback from "./pages/github";
import { Toaster } from "./components/ui/toaster";
import useWebsockets from "./hooks/use-websockets";
import ProjectDetails from "./pages/project";
import { TooltipProvider } from "./components/ui/tooltip";
import useConfig from "./hooks/use-config";
import Layout from "./components/wrappers/page-layout";
import AuthenticatedGuard from "./components/wrappers/authenticated-guard";
import Authentication from "./pages/authentication";
import LoadingPage from "./pages/loading";
import AutologinPage from "./pages/autologin";
import { useEffect } from "react";
import { useAppSelector } from "./hooks/useStore";
import WorkspacesPage from "./pages/workspaces";

function App() {
  useWebsockets();
  useConfig();

  const selectedTheme = useAppSelector((state) => state.settings.theme);

  useEffect(() => {
    document.body.classList.add(selectedTheme);
  }, [selectedTheme]);

  return (
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/autologin" element={<AutologinPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/github" element={<GithubCallback />} />
          <Route element={<Layout />}>
            <Route index element={<Authentication />} />
            <Route path="setup" element={<Setup />} />
            <Route element={<AuthenticatedGuard />}>
              <Route path="workspaces" element={<WorkspacesPage />} />
              <Route
                path="workspaces/:workspaceId/projects"
                element={<Projects />}
              />
              <Route path="workspaces/:workspaceId/projects/*">
                <Route path=":projectId" element={<ProjectDetails />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}
export default App;
