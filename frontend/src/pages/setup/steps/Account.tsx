import { Button } from "@/components/ui/button";
import { constants } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import { Check, ChevronRight } from "lucide-react";
import { FC } from "react";

const Account: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <>
      <div>
        {isAuth ? (
          <Button variant="dark" disabled className="p-4 gap-2">
            <Check />
            <span>Signed up</span>
          </Button>
        ) : (
          <Button
            variant="dark"
            onClick={() =>
              (window.location.href = `https://github.com/login/oauth/authorize?client_id=${constants.githubClientId}&scope=user%20repo&redirect_uri=${window.location.protocol}//${window.location.host}/github`)
            }
            className="p-4 gap-2"
          >
            <img
              className="w-5 bg-white invert rounded-full"
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
            />
            <span className="font-semibold">Signup with Github</span>
          </Button>
        )}
      </div>
      <Button onClick={() => dispatch(nextSetupStep())} disabled={!isAuth}>
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Account;
