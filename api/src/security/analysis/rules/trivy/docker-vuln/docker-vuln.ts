import { Injectable } from '@nestjs/common';
import { SecurityFact } from 'src/security/types/facts';
import { SecurityFinding } from 'src/security/types/findings';
import { SecurityRule } from 'src/security/types/rule.interface';
import { ImageFact } from '../../../analyzers/compose/types';
import { execCommand } from '../../../../../utils/exec-utils';
import { TrivyImageOutput } from './trivy-output.type';
import { stringToSeverity } from '../severity.utils';

@Injectable()
export class DockerVulnerabilitiesRule implements SecurityRule<ImageFact> {
  supports(fact: SecurityFact): fact is ImageFact {
    return fact.type === 'docker-image';
  }

  async evaluate(fact: ImageFact): Promise<SecurityFinding[]> {
    const results: SecurityFinding[] = [];

    if (fact.image === 'Custom Dockerfile') {
      return results;
    }

    const { stdout } = await execCommand(
      `trivy image ${fact.image} --quiet --format json`,
      { timeout: 30000 },
    );
    const trivyResult = JSON.parse(stdout) as TrivyImageOutput;

    for (const result of trivyResult.Results) {
      if (result.Vulnerabilities) {
        for (const vuln of result.Vulnerabilities) {
          results.push({
            severity: stringToSeverity(vuln.Severity),
            category: 'docker-vulnerabilities',
            title: `Vulnerability in image ${fact.image}`,
            description: `The image "${fact.image}" used by service "${fact.service}" contains a vulnerability: ${vuln.Title} (${vuln.VulnerabilityID}).
Description: ${vuln.Description}
Installed Version: ${vuln.InstalledVersion}
Fixed Version: ${vuln.FixedVersion || 'Not fixed yet'}
            `,
            recommendation: vuln.References.join('\n'),
            source: fact.source,
            location: JSON.stringify({
              file: fact.file,
              service: fact.service,
              image: fact.image,
            }),
            metadata: JSON.stringify({
              vulnerabilityId: vuln.VulnerabilityID,
              packageName: vuln.PkgName,
              installedVersion: vuln.InstalledVersion,
              fixedVersion: vuln.FixedVersion,
            }),
          });
        }
      }
    }

    return results;
  }
}
