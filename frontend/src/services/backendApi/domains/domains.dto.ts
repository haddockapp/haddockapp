export interface CreateDomainDto {
  domain: string;

  main: boolean;
}

export interface DomainResponseDto {
  id: string;
  domain: string;
  main: boolean;

  primaryBinding: string;
  wildcardBinding: string;
  challengeBinding: string;

  linked: boolean;
}

export interface DomainStatusDto {
  id: string;
  domain: string;
  main: boolean;

  primaryStatus: boolean;
  wildcardStatus: boolean;
  challengeStatus: boolean;

  canBeLinked: boolean;
}
