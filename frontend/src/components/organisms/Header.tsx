import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/hooks/useStore";
import { logout } from "@/services/authSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const pathTranslations: Record<string, string> = {
  ["/"]: "/setup",
  ["/github"]: "",
};

const Header: FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: projects } = useGetProjectsQuery();
  const projectName = useMemo(
    () => projects?.find((p) => p.id === projectId)?.name,
    [projects, projectId]
  );
  const dispatch = useAppDispatch();

  return (
    <div>
      <div className="flex items-center ml-4 mt-4">
        <img
          className="w-16 cursor-pointer"
          src="/haddock.png"
          onClick={() => navigate("/dashboard")}
        />
        <h3 className="text-2xl ml-2">
          {projectId
            ? `/projects/${projectName}`
            : pathTranslations[window.location.pathname] ??
              window.location.pathname}
        </h3>
      </div>
      <Tooltip delayDuration={250}>
        <TooltipTrigger>
          <Button
            className="space-x-2"
            variant="secondary"
            onClick={() => dispatch(logout())}
          >
            <LogOut size="16px" />
            <span>Logout</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          I'm here for debug purposes only, please don't delete me before I'm
          given a stable home ! 감사합니다 !!!
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Header;
