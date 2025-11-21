import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

@Injectable()
export class AppService {
  async getVersionInfo() {
    try {
      // Read version from package.json
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const currentVersion = packageJson.version;

      // Check for latest version and changelog from GitHub
      let latestVersion = null;
      let updateAvailable = false;
      let changelog = null;
      let releaseUrl = null;

      try {
        const response = await fetch(
          'https://api.github.com/repos/haddockapp/haddockapp/releases/latest',
        );

        if (response.ok) {
          const data = await response.json();
          latestVersion = data.tag_name;
          changelog = data.body; // Release notes/changelog
          releaseUrl = data.html_url;

          // Compare versions (remove 'v' prefix if present)
          const current = currentVersion.replace(/^v/, '');
          const latest = latestVersion.replace(/^v/, '');

          updateAvailable = this.isNewerVersion(latest, current);
        }
      } catch (error) {
        // If GitHub check fails, just return current version
        console.error('Failed to check for updates:', error);
      }

      return {
        currentVersion,
        latestVersion,
        updateAvailable,
        changelog,
        releaseUrl,
      };
    } catch (error) {
      return {
        currentVersion: 'unknown',
        latestVersion: null,
        updateAvailable: false,
        changelog: null,
        releaseUrl: null,
      };
    }
  }

  private isNewerVersion(latest: string, current: string): boolean {
    try {
      // Use semver for proper version comparison including pre-release identifiers
      const latestVersion = semver.coerce(latest);
      const currentVersion = semver.coerce(current);

      if (latestVersion && currentVersion) {
        return semver.gt(latestVersion, currentVersion);
      }

      // Fallback to false if versions can't be parsed
      return false;
    } catch (error) {
      console.error('Error comparing versions:', error);
      return false;
    }
  }
}
