import HaddockSpinner from "@/components/atoms/spinner";
import { useAppDispatch } from "@/hooks/useStore";
import { setToken } from "@/services/authSlice";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GithubCallback: FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const [, query] = document.location.href.split("?");
    if (!query) return navigate("/");
    const code = query.split("=")[1];
    if (code && code.length > 0) {
      dispatch(setToken(code));
      navigate("/dashboard");
    }
  }, [dispatch, navigate]);

  return (
    <div className="h-screen justify-center items-center flex flex-col">
      <HaddockSpinner />
      <p>Loading . . .</p>
    </div>
  );
};

export default GithubCallback;
