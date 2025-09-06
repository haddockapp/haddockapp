import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import SimpleDrawer from "./SimpleDrawer";
import Settings from "./Settings";
import { setTheme, Theme } from "@/services/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { useGetWorkspacesQuery } from "@/services/backendApi/workspaces";

const pathTranslations: Record<string, string> = {
  ["/"]: "/ authentication",
  ["/setup"]: "/ setup",
  ["/dashboard"]: "/ dashboard",
  ["/github"]: "",
};

const Header: FC = () => {
  const { projectId, workspaceId } = useParams();
  const dispatch = useAppDispatch();
  const selectedTheme = useAppSelector((state) => state.settings.theme);
  const navigate = useNavigate();

  const { data: workspaces } = useGetWorkspacesQuery();
  const { data: projects } = useGetProjectsQuery();

  const workspaceName = useMemo(
    () => workspaces?.find((w) => w.id === workspaceId)?.name,
    [workspaces, workspaceId]
  );
  const projectName = useMemo(
    () => projects?.find((p) => p.id === projectId)?.name,
    [projects, projectId]
  );

  return (
    <div className="flex flex-row justify-between w-full pt-4 px-8 items-center">
      <div className="flex items-center">
        <img
          className="w-16 cursor-pointer"
          src="/haddock.png"
          onClick={() => navigate("/dashboard")}
        />
        <h3 className="text-typography text-2xl ml-2">
          {projectId
            ? `/ ${workspaceName} / ${projectName}`
            : workspaceId
            ? `/ ${workspaceName}`
            : pathTranslations[window.location.pathname] ??
              window.location.pathname}
        </h3>
      </div>
      <div className="flex flex-row items-center">
        <Button
          onClick={() =>
            dispatch(
              setTheme(selectedTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)
            )
          }
          variant="ghost"
          className="group p-2"
        >
          {selectedTheme === Theme.LIGHT ? (
            <Sun className="text-primary/70 group-hover:text-primary" />
          ) : (
            <Moon className="text-primary/70 group-hover:text-primary" />
          )}
        </Button>
        <SimpleDrawer
          Content={Settings}
          Trigger={({ onOpen }) => (
            <Button onClick={onOpen} variant="ghost" className="group p-2">
              <Menu className="text-primary/70 group-hover:text-primary" />
            </Button>
          )}
          title="Settings"
        />
      </div>
    </div>
  );
};

export default Header;
