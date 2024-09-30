import { Card, CardContent } from "@/components/ui/card";
import { ProjectDto } from "@/types/projects/projects.dto";
import { FC } from "react";
import { FolderDot } from "lucide-react";
import { FolderGit2 } from "lucide-react";

interface ProjectCardProps {
  project: ProjectDto;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const getIcon = () => {
    if (project.source.type === "github") {
      return <FolderGit2 size={64} />;
    }
    return <FolderDot size={64} />;
  };
  const truncate = (str: string, n: number) => {
    return str.length > n ? str.substring(0, n - 1) + "..." : str;
  };
  const description =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum";
  return (
    <Card
      className="w-full cursor-pointer transition-colors duration-200 hover:bg-gray-100"
      onClick={() => console.log("Test")}
    >
      <CardContent className="p-4">
        <div className="flex justify-between h-24">
          <div className="flex flex-row items-center gap-4 w-2/3">
            {getIcon()}
            <div>
              <p className="text-xl font-bold text-gray-900">
                {project.source.settings.organization} / {project.vm.name}
              </p>
              <div className="flex flex-row gap-1">
                <p className="text-gray-600">Last deployment date:</p>
                <p className="text-gray-800 font-semibold">12/09/2024</p>
              </div>
              <p className="text-gray-700">{truncate(description, 200)}</p>
            </div>
          </div>
          <div className="self-center flex flex-row items-center gap-2">
            <p className="text-gray-800 font-bold">
              {capitalizeFirstLetter(project.vm.status)}
            </p>
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
