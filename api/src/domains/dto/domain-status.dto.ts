export class DomainStatusDto {
  id: string;
  domain: string;
  main: boolean;

  primaryStatus: boolean;
  wildcardStatus: boolean;
  challengeStatus: boolean;

  canBeLinked: boolean;
}
