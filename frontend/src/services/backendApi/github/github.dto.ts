export interface Repository {
  id: number;
  name: string;
  full_name: string;
  url: string;
}

export interface Settings {
  branch: string;
  repository: string;
  organization: string;
}

export type GetAllRepositoriesParams = {
  authorization: string;
};

export type GetRepositoryByNameParam = {
  organization: string;
  repository: string;
  authorization: string;
};

export type GetAllBranchesByRepositoryParams = {
  repository: string;
  authorization: string;
};
