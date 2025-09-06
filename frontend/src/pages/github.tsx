import { HaddockLoader } from "@/components/atoms/spinner";
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
              navigate("/loading");
            })
            .catch(() => {
              toast({
                title: "Error",
                variant: "destructive",
                description: "Failed to login",
              });
              navigate("/");
            });
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
              navigate("/workspaces");
            });
          break;
      }
    }
  }, [dispatch, navigate, triggerCreateAuthorization, triggerLoginGithub]);

  return <HaddockLoader />;
};

export default GithubCallback;
