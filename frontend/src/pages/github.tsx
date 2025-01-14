import HaddockSpinner from "@/components/atoms/spinner";
import { useAppDispatch } from "@/hooks/useStore";
import { setToken } from "@/services/authSlice";
import { useLoginGithubMutation } from "@/services/backendApi/auth";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GithubCallback: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [triggerLoginGithub] = useLoginGithubMutation();

  useEffect(() => {
    const [, query] = document.location.href.split("?");
    if (!query) return;
    const code = query.split("=")[1];
    if (code && code.length > 0) {
      triggerLoginGithub({ code })
        .unwrap()
        .then(({ accessToken }) => {
          dispatch(setToken(accessToken));
          navigate("/");
        });
    }
  }, [dispatch, navigate, triggerLoginGithub]);

  return (
    <div className="h-screen items-center justify-center flex flex-col">
      <HaddockSpinner />
    </div>
  );
};

export default GithubCallback;
