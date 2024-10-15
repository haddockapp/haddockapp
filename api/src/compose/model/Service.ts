import { ServiceDeployment } from "./ServiceDeployment";
import { ServiceUser } from "./ServiceUser";

export default interface Service {
    name: string;
    image: string;
    ports: string[];
    networks: string[];
    depends_on: string[];
    environment: string[];
    user: ServiceUser | null;
    deployment: ServiceDeployment | null;
}
