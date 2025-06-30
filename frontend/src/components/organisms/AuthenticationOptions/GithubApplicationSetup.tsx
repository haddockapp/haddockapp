import { Button } from "@/components/ui/button";
import { FC } from "react";
import Configuration from "@/components/organisms/Configuration/SetupGithubApp";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import useDisclosure from "@/hooks/use-disclosure";
import Copiable from "@/components/atoms/copiable";

const GithubApplicationSetup: FC = () => {
  const disclosureMethods = useDisclosure();

  return (
    <SimpleDialog
      {...disclosureMethods}
      title="Add a new configuration"
      description={
        <>
          In order to use Haddock with a Github Application, you will need to
          setup your application in the Github Developer settings.
          <br />
          This will allow Haddock to access your repositories and perform
          actions on your behalf.
          <br />
          For the <i>application name field</i>, you can write{" "}
          <Copiable text="Haddock" />
          <br />
          In the <i>homepage URL field</i>, please input{" "}
          <Copiable text={`${window.location.origin}`} />
          <br />
          In the <i>callback URL field</i>, insert{" "}
          <Copiable text={`${window.location.origin}/github`} />
          <br />
          Once you have created your application, you will need to copy the
          credentials into Haddock :
        </>
      }
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
