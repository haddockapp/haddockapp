import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import SimpleDrawer from "./SimpleDrawer";
import Settings from "./Settings";
import useSetup from "@/hooks/use-setup";

const pathTranslations: Record<string, string> = {
  ["/"]: "/ authentication",
  ["/setup"]: "/ setup",
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

  const { isSetupComplete } = useSetup();

  return (
    <div className="flex flex-row justify-between w-full pt-8 px-8 items-center">
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
      </div>
      {isSetupComplete && (
        <SimpleDrawer
          Content={Settings}
          Trigger={({ onOpen }) => (
            <Button onClick={onOpen} variant="ghost" className="group p-2">
              <Menu
                strokeWidth={3}
                className="stroke-primary/70 group-hover:stroke-primary duration-1000"
              />
            </Button>
          )}
          title="Settings"
        />
      )}
    </div>
  );
};

export default Header;
