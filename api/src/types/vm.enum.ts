export enum VmProvider {
  Libvirt = 'libvirt',
  VirtualBox = 'virtualbox',
}

export enum VmState {
  Starting = 'starting',
  Running = 'running',
  Stopped = 'stopped',
  Error = 'error'
}
