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
      "Configure the main domain name for your platform. This will be the primary address users will use to access your services.",
  },
  {
    boolean: "wildcardStatus",
    value: "wildcardBinding",
    title: "Link wildcard domain name",
    subtitle:
      "Set up a wildcard domain to allow access to all subdomains (e.g., *.yourdomain.com). This is useful for multi-site or dynamic subdomain setups.",
  },
  {
    boolean: "challengeStatus",
    value: "challengeBinding",
    title: "Haddock verification challenge",
    subtitle:
      "Add the provided TXT record to your DNS to verify domain ownership. This step is required to complete the domain setup process.",
  },
];

export default steps;
