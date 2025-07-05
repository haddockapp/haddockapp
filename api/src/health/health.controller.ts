import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/auth.decorator';

@Controller('health')
export class HealthController {

    @Public()
    @Get()
    async healthCheck() {
        return 'ok';
    }
}
