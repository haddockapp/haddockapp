import { Severity, SeverityLevel } from "../../../types/findings";
import { TrivySeverity } from "./docker-vuln/trivy-output.type";

export function stringToSeverity(trivyString: TrivySeverity): Severity {
    switch (trivyString) {
        case 'CRITICAL':
            return SeverityLevel.CRITICAL;
        case 'HIGH':
            return SeverityLevel.HIGH;
        case 'MEDIUM':
            return SeverityLevel.MEDIUM;
        case 'LOW':
            return SeverityLevel.LOW;
        case 'UNKNOWN':
            return SeverityLevel.LOW;
        default:
            return SeverityLevel.LOW;
    }
}