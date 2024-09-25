import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages";
import Projects from "./pages/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Projects />} />
        {/* <Route path="/github" element={<GithubCallback />} />
        <Route element={<AuthenticatedGuard />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Projects />} />
            <Route path="project/*">
              <Route path=":projectId" element={<ServicesPage />} />
            </Route>
          </Route>
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;
