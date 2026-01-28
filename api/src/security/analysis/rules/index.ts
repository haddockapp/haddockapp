import { Provider } from '@nestjs/common';
import { SECURITY_RULES } from 'src/security/security.tokens';
import { StaticComposeEnvRule } from './secrets/static-compose-env.rule';
import { EnvFileRule } from './files/env-file.rule';
import { DockerVulnerabilitiesRule } from './trivy/docker-vuln/docker-vuln';
import { MisconfigurationsRule } from './trivy/misconfigurations/misconfigurations';

export const ruleProviders: Provider[] = [
  StaticComposeEnvRule,
  EnvFileRule,
  DockerVulnerabilitiesRule,
  MisconfigurationsRule,
  {
    provide: SECURITY_RULES,
    useFactory: (
      staticComposeEnvRule: StaticComposeEnvRule,
      envFileRule: EnvFileRule,
      dockerVulnerabilitiesRule: DockerVulnerabilitiesRule,
      misconfigurationsRule: MisconfigurationsRule,
    ) => [
      staticComposeEnvRule,
      envFileRule,
      dockerVulnerabilitiesRule,
      misconfigurationsRule,
    ],
    inject: [
      StaticComposeEnvRule,
      EnvFileRule,
      DockerVulnerabilitiesRule,
      MisconfigurationsRule,
    ],
  },
];
