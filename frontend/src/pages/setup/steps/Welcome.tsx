import { Button } from "@/components/ui/button";
import { CircleGauge } from "lucide-react";
import { FC, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Welcome: FC = () => {
  const navigate = useNavigate();

  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    setSearchParams({ step: "welcome" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
  );
};

export default Welcome;
