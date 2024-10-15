import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { FC, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  return (
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
  );
};

export default Header;
