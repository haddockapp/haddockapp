import {
  DomainStatusDto,
  DomainResponseDto,
} from "@/services/backendApi/domains";

export interface SetupDomainStep {
  boolean: keyof DomainStatusDto;
  value: keyof DomainResponseDto;
  title: string;
  subtitle: string;
}

const steps: SetupDomainStep[] = [
  {
    boolean: "primaryStatus",
    value: "primaryBinding",
    title: "Link primary domain name",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    boolean: "wildcardStatus",
    value: "wildcardBinding",
    title: "Link wildcard domain name",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    boolean: "challengeStatus",
    value: "challengeBinding",
    title: "Haddock verification challenge",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

export default steps;
