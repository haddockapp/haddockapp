import { Provider } from '@nestjs/common';
import { SECURITY_ANALYZERS } from 'src/security/security.tokens';
import { ComposeAnalyzer } from './compose/compose.analyzer';

export const analyzerProviders: Provider[] = [
  {
    provide: SECURITY_ANALYZERS,
    useClass: ComposeAnalyzer,
  },
];
