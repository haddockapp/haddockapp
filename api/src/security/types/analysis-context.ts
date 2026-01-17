import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { ProjectFileIndex } from '../helpers/project-file-index.service';

export interface AnalysisContext {
  project: PersistedProjectDto;
  fileIndex?: ProjectFileIndex;
}
