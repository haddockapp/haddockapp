import { FC } from "react";
import Configuration from "@/components/organisms/Configuration/SetupGithubApp";

type ChangeGithubApplicationProps = { onClose: () => void };

const ChangeGithubApplication: FC<ChangeGithubApplicationProps> = ({
  onClose,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <p className="text-zinc-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        mollis placerat leo in pellentesque. Vivamus tellus dolor, euismod eget
        luctus vel, placerat nec metus. Proin nibh ligula, porta eu libero
        ultricies, vulputate sodales augue.
      </p>
      <Configuration onClose={onClose} isAppSetup={false} />
    </div>
  );
};

export default ChangeGithubApplication;
