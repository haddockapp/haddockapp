export enum SecurityAdviceType {
  EXPOSED_ENV = 'EXPOSED_ENV',
}

type SecurityAdviceData = {
  service: string;
  variable: string;
};

export class SecurityAdviceDto {
  type: SecurityAdviceType;
  data: SecurityAdviceData;
}
