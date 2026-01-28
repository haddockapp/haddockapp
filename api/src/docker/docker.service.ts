import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DockerService {
  async getImageLogo(imageName: string): Promise<string> {
    const res = await axios.get(
      `https://hub.docker.com/api/media/repos_logo/v1/${imageName}`,
    );
    return res.data.url;
  }
}
