import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import Home from "./pages";
import Projects from "./pages/dashboard";
import GithubCallback from "./pages/github";
import { useAppSelector } from "./hooks/useStore";
import { FC } from "react";
import Header from "./components/organisms/Header";
import { Toaster } from "./components/ui/toaster";

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

  if (!token) return <Navigate to="/" />;

  return <Outlet />;
};

function App() {
  const authState = useAppSelector((state) => state.auth);


  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/github" element={<GithubCallback />} />
          <Route element={<AuthenticatedGuard />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Projects />} />
              {/*<Route path="project/*">
              <Route path=":projectId" element={<ServicesPage />} />
            </Route>
            */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
