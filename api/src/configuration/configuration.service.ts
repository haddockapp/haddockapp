import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from './configuration.repository';
import { GithubConfiguration } from './model/github-configuration';
import { SamlConfiguration } from './model/saml-configuration';
import {
  GITHUB_ID_KEY,
  GITHUB_SECRET_KEY,
  SAML_ENTRY_POINT_KEY,
  SAML_ISSUER_KEY,
  SAML_CERT_KEY,
  SAML_CALLBACK_URL_KEY,
  SAML_ENABLED_KEY,
} from './utils/consts';
import { SamlConfigurationPublic } from './model/saml-configuration';
import { Prisma } from '@prisma/client';
import { Strategy } from 'passport-saml';

@Injectable()
export class ConfigurationService {
  private configBlacklist = [GITHUB_SECRET_KEY, SAML_CERT_KEY];

  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  async checkGithubTokensConformity(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clientSecret: string,
  ): Promise<boolean> {
    // @TODO: Validate using RegExp
    // @TODO: Validate using Github API
    return true;
  }

  async getGithubConfiguration(): Promise<GithubConfiguration | null> {
    const configs = await this.configurationRepository.getConfigurationByKeys([
      GITHUB_ID_KEY,
      GITHUB_SECRET_KEY,
    ]);
    if (configs.length !== 2) {
      return null;
    }

    return {
      client_id: configs.find((e) => e.key === GITHUB_ID_KEY).value.toString(),
      client_secret: configs
        .find((e) => e.key === GITHUB_SECRET_KEY)
        .value.toString(),
    };
  }

  async modifyGithubConfiguration(client_id: string, client_secret: string) {
    const config = await this.getGithubConfiguration();
    if (!config) {
      await this.configurationRepository.createConfiguration(
        GITHUB_ID_KEY,
        client_id,
      );
      await this.configurationRepository.createConfiguration(
        GITHUB_SECRET_KEY,
        client_secret,
      );
    } else {
      await this.configurationRepository.updateConfiguration(
        GITHUB_ID_KEY,
        client_id,
      );
      await this.configurationRepository.updateConfiguration(
        GITHUB_SECRET_KEY,
        client_secret,
      );
    }
  }

  async modifyConfiguration(key: string, value: Prisma.JsonValue) {
    const exists =
      await this.configurationRepository.getConfigurationByKey(key);
    if (!exists) {
      await this.configurationRepository.createConfiguration(key, value);
    } else {
      await this.configurationRepository.updateConfiguration(key, value);
    }
  }

  async getPubliConfiguration() {
    const configs = await this.configurationRepository.getConfiguration();
    return configs.filter(
      (config) => !this.configBlacklist.includes(config.key),
    );
  }

  async checkSamlConfigurationConformity(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    entryPoint: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    issuer: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cert: string,
  ): Promise<boolean> {
    // @TODO: Validate SAML configuration
    // Could validate certificate format, URL format, etc.
    return true;
  }

  async getSamlConfiguration(): Promise<SamlConfiguration | null> {
    const configs = await this.configurationRepository.getConfigurationByKeys([
      SAML_ENTRY_POINT_KEY,
      SAML_ISSUER_KEY,
      SAML_CERT_KEY,
      SAML_CALLBACK_URL_KEY,
      SAML_ENABLED_KEY,
    ]);

    const entryPoint = configs.find((e) => e.key === SAML_ENTRY_POINT_KEY);
    const issuer = configs.find((e) => e.key === SAML_ISSUER_KEY);
    const cert = configs.find((e) => e.key === SAML_CERT_KEY);
    const callbackUrl = configs.find((e) => e.key === SAML_CALLBACK_URL_KEY);
    const enabled = configs.find((e) => e.key === SAML_ENABLED_KEY);

    if (!entryPoint || !issuer || !cert) {
      return null;
    }

    return {
      entryPoint: entryPoint.value.toString(),
      issuer: issuer.value.toString(),
      cert: cert.value.toString(),
      callbackUrl: callbackUrl
        ? callbackUrl.value.toString()
        : process.env.SAML_CALLBACK_URL || '/auth/saml/callback',
      enabled: enabled ? (enabled.value as boolean) : false,
    };
  }

  async getSamlConfigurationPublic(): Promise<SamlConfigurationPublic | null> {
    const config = await this.getSamlConfiguration();
    if (!config) return null;

    // Return public config without sensitive cert
    return {
      entryPoint: config.entryPoint,
      issuer: config.issuer,
      cert: !!config.cert,
      callbackUrl: config.callbackUrl,
      enabled: config.enabled ?? false,
    };
  }

  async toggleSamlEnabled(enabled: boolean): Promise<void> {
    await this.modifyConfiguration(SAML_ENABLED_KEY, enabled);
  }

  async modifySamlConfiguration(
    entryPoint: string,
    issuer: string,
    cert: string,
    callbackUrl?: string,
  ) {
    const config = await this.getSamlConfiguration();
    if (!config) {
      await this.configurationRepository.createConfiguration(
        SAML_ENTRY_POINT_KEY,
        entryPoint,
      );
      await this.configurationRepository.createConfiguration(
        SAML_ISSUER_KEY,
        issuer,
      );
      await this.configurationRepository.createConfiguration(
        SAML_CERT_KEY,
        cert,
      );
      if (callbackUrl) {
        await this.configurationRepository.createConfiguration(
          SAML_CALLBACK_URL_KEY,
          callbackUrl,
        );
      }
    } else {
      await this.configurationRepository.updateConfiguration(
        SAML_ENTRY_POINT_KEY,
        entryPoint,
      );
      await this.configurationRepository.updateConfiguration(
        SAML_ISSUER_KEY,
        issuer,
      );
      await this.configurationRepository.updateConfiguration(
        SAML_CERT_KEY,
        cert,
      );
      if (callbackUrl)
        await this.configurationRepository.updateConfiguration(
          SAML_CALLBACK_URL_KEY,
          callbackUrl,
        );
    }
  }

  async updateSamlConfiguration(
    entryPoint?: string,
    issuer?: string,
    cert?: string,
    callbackUrl?: string,
  ): Promise<void> {
    if (entryPoint !== undefined) {
      await this.modifyConfiguration(SAML_ENTRY_POINT_KEY, entryPoint);
    }
    if (issuer !== undefined) {
      await this.modifyConfiguration(SAML_ISSUER_KEY, issuer);
    }
    if (cert !== undefined) {
      await this.modifyConfiguration(SAML_CERT_KEY, cert);
    }
    if (callbackUrl !== undefined) {
      await this.modifyConfiguration(SAML_CALLBACK_URL_KEY, callbackUrl);
    }
  }

  async testSamlConfiguration(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get current configuration
    const config = await this.getSamlConfiguration();
    if (!config) {
      errors.push('SAML configuration is not set up');
      return { valid: false, errors, warnings };
    }

    // Validate entryPoint URL format
    try {
      const entryPointUrl = new URL(config.entryPoint);
      if (!['http:', 'https:'].includes(entryPointUrl.protocol)) {
        errors.push('Entry point must use HTTP or HTTPS protocol');
      }
    } catch (error) {
      errors.push('Entry point is not a valid URL');
    }

    // Validate certificate format
    if (!config.cert.includes('-----BEGIN CERTIFICATE-----'))
      errors.push('Certificate does not appear to be in PEM format');
    if (!config.cert.includes('-----END CERTIFICATE-----'))
      errors.push('Certificate is missing END CERTIFICATE marker');

    // Validate issuer is not empty
    if (!config.issuer || config.issuer.trim().length === 0)
      errors.push('Issuer cannot be empty');

    // Validate callback URL format if provided
    if (config.callbackUrl) {
      try {
        const callbackUrl = new URL(config.callbackUrl);
        if (!['http:', 'https:'].includes(callbackUrl.protocol)) {
          errors.push('Callback URL must use HTTP or HTTPS protocol');
        }
      } catch (error) {
        errors.push('Callback URL is not a valid URL');
      }
    }

    // Try to create a Strategy instance to validate the configuration
    try {
      new Strategy(
        {
          callbackUrl:
            config.callbackUrl ||
            process.env.SAML_CALLBACK_URL ||
            '/auth/saml/callback',
          entryPoint: config.entryPoint,
          issuer: config.issuer,
          cert: config.cert,
          signatureAlgorithm: 'sha256',
          acceptedClockSkewMs: 5000,
          identifierFormat:
            'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        },
        () => {
          // Dummy validate function for testing
        },
      );
      // If we reach here, the Strategy was created successfully
      // which means the configuration is at least syntactically valid
    } catch (error) {
      errors.push(
        `Failed to initialize SAML strategy: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Check if SAML is enabled
    if (!config.enabled) warnings.push('SAML SSO is currently disabled');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
