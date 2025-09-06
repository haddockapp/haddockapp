import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Moon, SlashIcon, Sun } from "lucide-react";
import SimpleDrawer from "./SimpleDrawer";
import Settings from "./Settings";
import { setTheme, Theme } from "@/services/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { useGetWorkspacesQuery } from "@/services/backendApi/workspaces";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Header: FC = () => {
  const dispatch = useAppDispatch();
  const selectedTheme = useAppSelector((state) => state.settings.theme);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { projectId, workspaceId } = useParams();

  const { data: workspaces } = useGetWorkspacesQuery();
  const { data: projects } = useGetProjectsQuery();

  return (
    <div className="flex flex-row justify-between w-full pt-4 px-8 items-center">
      <div className="flex items-center">
        <img
          className="w-16 cursor-pointer"
          src="/haddock.png"
          onClick={() => navigate("/workspaces")}
        />
        <Breadcrumb>
          <BreadcrumbList>
            {pathname.includes("/workspaces") && (
              <BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                <BreadcrumbLink
                  onClick={() => navigate("/workspaces")}
                  className="cursor-pointer"
                >
                  workspaces
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {workspaceId && (
              <BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                <BreadcrumbLink
                  onClick={() =>
                    navigate(`/workspaces/${workspaceId}/projects`)
                  }
                  className="cursor-pointer"
                >
                  {workspaces?.find((w) => w.id === workspaceId)?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {projectId && (
              <BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                <BreadcrumbLink
                  onClick={() =>
                    navigate(`/workspaces/${workspaceId}/projects/${projectId}`)
                  }
                  className="cursor-pointer"
                >
                  {projects?.find((p) => p.id === projectId)?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
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
