export enum TokenPermission {
  READ = 'read',
  START = 'start', 
  STOP = 'stop',
  DEPLOY = 'deploy',
  RECREATE = 'recreate',
  MANAGE_SERVICES = 'manage_services',
  MANAGE_ENVIRONMENT = 'manage_environment',
}

export const PERMISSIONS = Object.values(TokenPermission);

