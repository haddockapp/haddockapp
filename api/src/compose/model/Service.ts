import { ServiceDeployment } from './ServiceDeployment';
import { ServiceUser } from './ServiceUser';

export interface ServiceDto {
  name: string;
  image: string;
  ports: string[];
  networks: string[];
  depends_on: string[];
  environment: { [key: string]: any };
  user: ServiceUser | null;
  deployment: ServiceDeployment | null;
}
