import { Provider } from '@nestjs/common';
import { SECURITY_ANALYZERS } from 'src/security/security.tokens';
import { ComposeAnalyzer } from './compose/compose.analyzer';
import { EnvFileAnalyzer } from './files/env-file.analyzer';
import { TrivyConfigAnalyzer } from './trivy/trivy-config.analyzer';

export const analyzerProviders: Provider[] = [
  ComposeAnalyzer,
  EnvFileAnalyzer,
  TrivyConfigAnalyzer,
  {
    provide: SECURITY_ANALYZERS,
    useFactory: (
      compose: ComposeAnalyzer,
      env: EnvFileAnalyzer,
      trivy: TrivyConfigAnalyzer,
    ) => [compose, env, trivy],
    inject: [ComposeAnalyzer, EnvFileAnalyzer, TrivyConfigAnalyzer],
  },
];
