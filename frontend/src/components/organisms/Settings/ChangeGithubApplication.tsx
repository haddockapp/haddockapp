import { FC } from "react";
import GithubApplicationSetup from "../AuthenticationOptions/GithubApplicationSetup";

type ChangeGithubApplicationProps = { onClose: () => void };

const ChangeGithubApplication: FC<ChangeGithubApplicationProps> = () => {
  return (
    <div className="space-y-4">
      <p className="text-zinc-600">
        In order to use Haddock with a Github Application, you will need to
        setup your application in the Github Developer settings. <br />
        You can setup or modify the application here.
      </p>
      <GithubApplicationSetup />
    </div>
  );
};

export default ChangeGithubApplication;
