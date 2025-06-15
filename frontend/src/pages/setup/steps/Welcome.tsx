import Copiable from "@/components/atoms/copiable";
import { Button } from "@/components/ui/button";
import { CircleGauge } from "lucide-react";
import { FC, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Welcome: FC = () => {
  const navigate = useNavigate();

  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    setSearchParams({ step: "welcome" });
  }, [setSearchParams]);

  return (
    <div className="flex flex-col space-y-12 text-center items-center w-full text-gray-700">
      <p className="flex flex-col">
        <span>
          Now that your domain is properly configured @ {window.location.origin}
          ,
        </span>
        <span>
          don't forget to edit your Github Application's callback url:
        </span>
      </p>
      <Copiable text={`${window.location.origin}/github`} />
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
