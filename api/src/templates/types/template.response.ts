export interface TemplateResponse {
    id: string;
    name: string;
    description: string;
    icon: string;
    versions: Version[];
}

export interface Version {
    id: string;
    label: string;
    variables: Variable[];
}

export interface Variable {
    key: string;
    label: string;
    type: "plain" | "secret";
}
