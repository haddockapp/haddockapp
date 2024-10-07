import ServiceCard from "@/components/organisms/ServiceCard";
import { useGetServicesByProjectIdQuery } from "@/services/backendApi/services";
import { FC } from "react";
import { useParams } from "react-router-dom";

const ProjectDetails: FC = () => {
  const { projectId } = useParams();
  const { data: services } = useGetServicesByProjectIdQuery(projectId ?? "");
  return (
    <div className="mx-8">
      {services?.map((service, index) => {
        return (
          <>
            <ServiceCard
              key={index}
              name={service.name}
              icon={service.icon}
              image={service.image}
              onClick={() => console.log(service.name)}
            />
            <hr />
          </>
        );
      })}
    </div>
  );
};

export default ProjectDetails;
