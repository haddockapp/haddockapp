export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  versions: Version[];
}

export interface Version {
  id: string;
  label: string;
  path: string;
  compose: string;
  env: Env[];
}

export interface Env {
  label: string;
  key: string;
  type: 'plain' | 'secret';
  policy: 'input' | 'generate';
}
