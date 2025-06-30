import { FC } from "react";
import GithubApplicationSetup from "../AuthenticationOptions/GithubApplicationSetup";

type ChangeGithubApplicationProps = { onClose: () => void };

const ChangeGithubApplication: FC<ChangeGithubApplicationProps> = () => {
  return (
    <div className="space-y-4">
      <p className="text-zinc-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        mollis placerat leo in pellentesque. Vivamus tellus dolor, euismod eget
        luctus vel, placerat nec metus. Proin nibh ligula, porta eu libero
        ultricies, vulputate sodales augue.
      </p>
      <GithubApplicationSetup />
    </div>
  );
};

export default ChangeGithubApplication;
