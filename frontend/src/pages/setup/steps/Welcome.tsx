import Copiable from "@/components/atoms/copiable";
import { Button } from "@/components/ui/button";
import { useGetConfigurationQuery } from "@/services/backendApi/configuration";
import { CircleGauge } from "lucide-react";
import { FC, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Welcome: FC = () => {
  const navigate = useNavigate();

  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    setSearchParams({ step: "welcome" });
  }, [setSearchParams]);

  const { data: configurationData } = useGetConfigurationQuery();

  const isGithubAppConfirmed = useMemo(
    () => configurationData?.find((c) => c.key === "github_client_id"),
    [configurationData]
  );

  return (
    <div className="flex flex-col space-y-12 text-center items-center w-full text-typography/70">
      {isGithubAppConfirmed && (
        <>
          <p className="flex flex-col">
            <span>
              Now that your domain is properly configured @{" "}
              {window.location.origin},
            </span>
            <span>
              don't forget to edit your Github Application's callback url:
            </span>
          </p>
          <Copiable text={`${window.location.origin}/github`} />
        </>
      )}
      <div>
        <Button
          variant="link"
          onClick={() => navigate("/dashboard")}
          className="space-x-2"
        >
          <CircleGauge size="16px" />
          <span>Go to dashboard</span>
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
