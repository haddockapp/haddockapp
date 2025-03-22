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

function App() {
  useWebsockets();
  useConfig();

  return (
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/github" element={<GithubCallback />} />
          <Route element={<Layout />}>
            <Route index element={<Authentication />} />
            <Route path="setup" element={<Setup />} />
            <Route element={<AuthenticatedGuard />}>
              <Route path="dashboard" element={<Projects />} />
              <Route path="project/*">
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
