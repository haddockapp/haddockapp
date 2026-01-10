export interface TemplateResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  versions: VersionResponse[];
}

export interface VersionResponse {
  id: string;
  label: string;
  variables: VariableResponse[];
}

export interface VariableResponse {
  key: string;
  label: string;
  type: 'plain' | 'secret';
}
