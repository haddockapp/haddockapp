import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import { CircleGauge } from "lucide-react";
import { FC } from "react";

const Welcome: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div>
      <Button onClick={() => dispatch(nextSetupStep())} className="space-x-2">
        <CircleGauge size="16px" />
        <span>Go to dashboard</span>
      </Button>
    </div>
  );
};

export default Welcome;
