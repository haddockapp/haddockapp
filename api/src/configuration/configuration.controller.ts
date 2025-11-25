import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SetupGitbubDto } from './dto/setup-github.dto';
import { SetupSamlDto } from './dto/setup-saml.dto';
import { ToggleSamlDto } from './dto/toggle-saml.dto';
import { UpdateSamlDto } from './dto/update-saml.dto';
import { ConfigurationService } from './configuration.service';
import { Public, PublicConfig } from 'src/auth/auth.decorator';
import { AdminGuard } from 'src/auth/guard/admin.guard';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Public()
  @Get()
  async getConfiguration() {
    return await this.configurationService.getPubliConfiguration();
  }

  @PublicConfig()
  @Post('github')
  async setupGithub(@Body() data: SetupGitbubDto) {
    const dataConform =
      await this.configurationService.checkGithubTokensConformity(
        data.client_id,
        data.client_secret,
      );
    if (!dataConform) {
      throw new BadRequestException(
        'Given tokens are not conforms to Github OAuth Application',
      );
    }

    await this.configurationService.modifyGithubConfiguration(
      data.client_id,
      data.client_secret,
    );
  }

  @PublicConfig()
  @Post('saml')
  async setupSaml(@Body() data: SetupSamlDto) {
    const dataConform =
      await this.configurationService.checkSamlConfigurationConformity(
        data.entryPoint,
        data.issuer,
        data.cert,
      );
    if (!dataConform)
      throw new BadRequestException('Given SAML configuration is not valid');

    await this.configurationService.modifySamlConfiguration(
      data.entryPoint,
      data.issuer,
      data.cert,
      data.callbackUrl,
    );
  }

  @UseGuards(AdminGuard)
  @Get('saml')
  async getSamlConfiguration() {
    const config = await this.configurationService.getSamlConfigurationPublic();
    if (!config)
      return {
        entryPoint: '',
        issuer: '',
        callbackUrl: '',
        enabled: false,
      };

    return config;
  }

  @UseGuards(AdminGuard)
  @Patch('saml/enabled')
  async toggleSamlEnabled(@Body() data: ToggleSamlDto) {
    await this.configurationService.toggleSamlEnabled(data.enabled);
  }

  @UseGuards(AdminGuard)
  @Patch('saml')
  async updateSaml(@Body() data: UpdateSamlDto) {
    await this.configurationService.updateSamlConfiguration(
      data.entryPoint,
      data.issuer,
      data.cert,
      data.callbackUrl,
    );
  }

  @UseGuards(AdminGuard)
  @Post('saml/test')
  async testSamlConfiguration() {
    return await this.configurationService.testSamlConfiguration();
  }
}
