
export class DomainResponseDto {
    id: string;
    domain: string;
    main: boolean;

    primaryBinding: string;
    wildcardBinding: string;
    challengeBinding: string;

    linked: boolean;
}
