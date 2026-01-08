import { Provider } from '@nestjs/common';
import { SECURITY_RULES } from 'src/security/security.tokens';
import { StaticComposeEnvRule } from './secrets/static-compose-env.rule';

export const ruleProviders: Provider[] = [
  // Secrets rules
  {
    provide: SECURITY_RULES,
    useClass: StaticComposeEnvRule,
  },
];
