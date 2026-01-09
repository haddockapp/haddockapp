import { Provider } from '@nestjs/common';
import { SECURITY_ANALYZERS } from 'src/security/security.tokens';
import { ComposeAnalyzer } from './compose/compose.analyzer';
import { EnvFileAnalyzer } from './files/env-file.analyzer';

export const analyzerProviders: Provider[] = [
  ComposeAnalyzer,
  EnvFileAnalyzer,

  {
    provide: SECURITY_ANALYZERS,
    useFactory: (compose: ComposeAnalyzer, env: EnvFileAnalyzer) => [
      compose,
      env,
    ],
    inject: [ComposeAnalyzer, EnvFileAnalyzer],
  },
];
