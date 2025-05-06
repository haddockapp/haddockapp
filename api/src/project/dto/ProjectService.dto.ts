import { ServiceDto } from 'src/compose/model/Service';
import { ServiceStatus } from 'src/types/service.enum';

export default interface ProjectServiceDto extends ServiceDto {
  icon: string;
  status: ServiceStatus;
  statusTimeStamp: Date;
}
