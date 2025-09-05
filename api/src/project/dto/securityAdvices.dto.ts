type SecurityAdvicesData = {
  service: string;
  variable: string;
};

export class SecurityAdvicesDto {
  type: 'EXPOSED_ENV';
  data: SecurityAdvicesData;
}
