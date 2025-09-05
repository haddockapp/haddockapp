type SecurityAdviceData = {
  service: string;
  variable: string;
};

export class SecurityAdviceDto {
  type: 'EXPOSED_ENV';
  data: SecurityAdviceData;
}
