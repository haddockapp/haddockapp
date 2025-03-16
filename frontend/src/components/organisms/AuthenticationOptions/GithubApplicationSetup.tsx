import { Button } from "@/components/ui/button";
import { FC } from "react";
import Configuration from "@/components/organisms/Configuration/SetupGithubApp";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import useDisclosure from "@/hooks/use-disclosure";

const GithubApplicationSetup: FC = () => {
  const disclosureMethods = useDisclosure();

  return (
    <SimpleDialog
      {...disclosureMethods}
      title="Add a new configuration"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Suspendisse mollis placerat leo in pellentesque. Vivamus tellus
dolor, euismod eget luctus vel, placerat nec metus. Proin nibh
ligula, porta eu libero ultricies, vulputate sodales augue."
      Content={Configuration}
      Trigger={({ onOpen }) => (
        <Button variant="outline" onClick={onOpen} className="space-x-2">
          <img
            className="w-5 rounded-full"
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
          />
          <span>App Configuration</span>
        </Button>
      )}
    />
  );
};

export default GithubApplicationSetup;
