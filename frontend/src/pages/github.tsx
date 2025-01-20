import HaddockSpinner from "@/components/atoms/spinner";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/hooks/useStore";
import { setToken } from "@/services/authSlice";
import {
  GithubAuthReason,
  useLoginGithubMutation,
} from "@/services/backendApi/auth";
import {
  AuthorizationEnum,
  useCreateAuthorizationMutation,
} from "@/services/backendApi/authorizations";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GithubCallback: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [triggerLoginGithub] = useLoginGithubMutation();
  const [triggerCreateAuthorization] = useCreateAuthorizationMutation();

  useEffect(() => {
    const [, query] = document.location.href.split("?");
    if (!query) return;
    const params = new URLSearchParams(query);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state) {
      switch (state) {
        case GithubAuthReason.LOGIN:
          triggerLoginGithub({ code })
            .unwrap()
            .then(({ accessToken }) => {
              dispatch(setToken(accessToken));
            });
          break;
        case GithubAuthReason.CREATE_AUTHORIZATION:
          triggerCreateAuthorization({
            type: AuthorizationEnum.OAUTH,
            data: { code },
          })
            .unwrap()
            .then(() => {
              toast({
                title: "Authorization created",
                description:
                  "You can now use this authorization to access your repositories.",
              });
            });
          break;
      }
      navigate("/");
    }
  }, [dispatch, navigate, triggerCreateAuthorization, triggerLoginGithub]);

  return (
    <div className="h-screen items-center justify-center flex flex-col">
      <HaddockSpinner />
    </div>
  );
};

export default GithubCallback;
