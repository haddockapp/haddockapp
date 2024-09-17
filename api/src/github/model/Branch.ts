export default interface Branch {
  name: string;
  commits: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection: {
    enabled: boolean;
    required_status_check: {
      enforcement_level: 'on' | 'off';
      contexts: any[];
      checks: any[];
    };
  };
}
