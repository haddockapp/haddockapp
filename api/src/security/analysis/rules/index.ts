import { Provider } from '@nestjs/common';
import { SECURITY_RULES } from 'src/security/security.tokens';
import { StaticComposeEnvRule } from './secrets/static-compose-env.rule';
import { EnvFileRule } from './files/env-file.rule';

export const ruleProviders: Provider[] = [
    StaticComposeEnvRule,
    EnvFileRule,

    {
        provide: SECURITY_RULES,
        useFactory: (staticComposeEnvRule: StaticComposeEnvRule, envFileRule: EnvFileRule) => [
            staticComposeEnvRule,
            envFileRule,
        ],
        inject: [StaticComposeEnvRule, EnvFileRule],
    }
];
