import {Controller, Get, Param} from "@nestjs/common";
import { DockerService } from './docker.service';

@Controller('docker')
export class DockerController {
    constructor(private readonly dockerService: DockerService) {}

    @Get(':imageName/logo')
    async getImageLogo(@Param('imageName') imageName: string): Promise<string> {
        imageName = imageName.replace('/', '%2F');
        return this.dockerService.getImageLogo(imageName);
    }
}
