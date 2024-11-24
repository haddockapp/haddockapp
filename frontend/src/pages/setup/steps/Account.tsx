import GithubSignInButton from "@/components/molecules/github-sign-in";
import { Button } from "@/components/ui/button";
import { constants } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import { ChevronRight } from "lucide-react";
import { FC } from "react";

const Account: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <>
      <div>
        <GithubSignInButton
          isSignedIn={isAuth}
          redirectUrl={`https://github.com/login/oauth/authorize?client_id=${constants.githubClientId}&scope=user%20repo`}
        />
      </div>
      <Button onClick={() => dispatch(nextSetupStep())} disabled={!isAuth}>
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Account;
