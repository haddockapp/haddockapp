import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { logout } from "@/services/authSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import SimpleDrawer from "./SimpleDrawer";
import Settings from "./Settings";

const pathTranslations: Record<string, string> = {
  ["/"]: "/ setup",
  ["/dashboard"]: "/ dashboard",
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
  const { isAuth } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-row justify-between w-full p-8 items-center">
      <div className="flex items-center">
        <img
          className="w-16 cursor-pointer"
          src="/haddock.png"
          onClick={() => navigate("/dashboard")}
        />
        <h3 className="text-2xl ml-2">
          {projectId
            ? `/ project / ${projectName}`
            : pathTranslations[window.location.pathname] ??
              window.location.pathname}
        </h3>
        <Tooltip delayDuration={250}>
          <TooltipTrigger>
            <Button variant="ghost" onClick={() => dispatch(logout())} />
          </TooltipTrigger>
          <TooltipContent>
            I'm here for debug purposes only, please don't delete me before I'm
            given a stable home ! 감사합니다 !!!
          </TooltipContent>
        </Tooltip>
      </div>
      <SimpleDrawer
        Content={Settings}
        Trigger={({ onOpen }) => (
          <Button
            disabled={!isAuth}
            onClick={onOpen}
            variant="ghost"
            className="group p-2"
          >
            <Menu
              strokeWidth={3}
              className="stroke-primary/70 group-hover:stroke-primary duration-1000"
            />
          </Button>
        )}
        title="Settings"
      />
    </div>
  );
};

export default Header;
