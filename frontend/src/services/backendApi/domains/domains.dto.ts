export interface CreateDomainDto {
  domain: string;
  https?: boolean;
  main: boolean;
}

export interface DomainResponseDto {
  id: string;
  domain: string;
  https: boolean;
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

export interface DomainApplyResponseDto {
  mainDomain: string;
  frontendUrl: string;
  backendUrl: string;
  autologin: string;
}
