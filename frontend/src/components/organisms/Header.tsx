import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Keyboard, KeyboardOff, Moon, Settings, Sun } from "lucide-react";
import { setTheme, Theme, toggleShowCommands } from "@/services/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { useSidebar } from "../ui/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";

const pathTranslations: Record<string, string> = {
  ["/"]: "/ authentication",
  ["/setup"]: "/ setup",
  ["/dashboard"]: "/ dashboard",
  ["/github"]: "",
};

const Header: FC = () => {
  const { projectId } = useParams();
  const dispatch = useAppDispatch();
  const { theme: selectedTheme, showCommands } = useAppSelector(
    (state) => state.settings
  );
  const navigate = useNavigate();
  const location = useLocation();

  const { data: projects = [], isFetching } = useGetProjectsQuery();

  const projectName = useMemo(
    () => projects.find((p) => p.id === projectId)?.name ?? "",
    [projects, projectId]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "h"
      ) {
        e.preventDefault();
        navigate("/dashboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const { toggleSidebar } = useSidebar();
  const { isAuth } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col sm:flex-row justify-between w-full py-4 px-8 items-center">
      <div className="flex flex-col sm:flex-row items-center">
        <img
          className="w-12 sm:w-16 cursor-pointer"
          src="/haddock.png"
          onClick={() => navigate("/dashboard")}
        />
        <div className="text-typography text-sm sm:text-2xl ml-2 text-nowrap flex flex-row items-center gap-2">
          {projectId ? (
            <>
              / project /
              <Skeleton
                loading={isFetching}
                className="inline-block min-w-[200px] h-8"
              >
                {projectName}
              </Skeleton>
            </>
          ) : (
            pathTranslations[window.location.pathname] ??
            window.location.pathname
          )}
        </div>
      </div>
      <div className="flex flex-row items-center">
        <AnimatePresence>
          {location.pathname !== "/dashboard" && isAuth && (
            <motion.div
              key="home-button"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    className="group p-2"
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Home className="text-primary/70 group-hover:text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>⌘ + Shift + H</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          onClick={() => dispatch(toggleShowCommands())}
          variant="ghost"
          className="group p-2 hidden md:flex"
        >
          {showCommands === true ? (
            <Keyboard className="text-primary/70 group-hover:text-primary" />
          ) : (
            <KeyboardOff className="text-primary/70 group-hover:text-primary" />
          )}
        </Button>
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
        <Tooltip>
          <TooltipTrigger>
            <Button
              className="group p-2"
              variant="ghost"
              onClick={toggleSidebar}
            >
              <Settings className="text-primary/70 group-hover:text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>⌘ + B</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default Header;
