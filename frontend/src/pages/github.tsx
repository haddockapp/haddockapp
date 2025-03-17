import { HaddockLoader } from "@/components/atoms/spinner";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
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
  const { isSetupComplete } = useAppSelector((state) => state.auth);

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
      const stateParsed = JSON.parse(state) as {
        reason: GithubAuthReason;
        authorizationName?: string;
      };
      if (!stateParsed.reason) {
        toast({
          title: "Error",
          description: "Invalid state",
        });
        return;
      }
      switch (stateParsed.reason) {
        case GithubAuthReason.LOGIN:
          triggerLoginGithub({ code })
            .unwrap()
            .then(({ accessToken }) => {
              dispatch(setToken(accessToken));
            });
          if (!isSetupComplete) navigate("/setup?step=domains");
          else navigate("/dashboard");
          break;
        case GithubAuthReason.CREATE_AUTHORIZATION:
          triggerCreateAuthorization({
            type: AuthorizationEnum.OAUTH,
            data: { code },
            name: stateParsed.authorizationName ?? "Github OAuth",
          })
            .unwrap()
            .then(() => {
              toast({
                title: "Authorization created",
                description:
                  "You can now use this authorization to access your repositories.",
              });
            });
          navigate("/dashboard");
          break;
      }
    }
  }, [
    dispatch,
    isSetupComplete,
    navigate,
    triggerCreateAuthorization,
    triggerLoginGithub,
  ]);

  return <HaddockLoader />;
};

export default GithubCallback;
