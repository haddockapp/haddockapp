export enum VmProvider {
  Libvirt = "libvirt",
  VirtualBox = "virtualbox",
}

export enum VmState {
  Starting = "starting",
  Running = "running",
  Stopped = "stopped",
}

export type VMInfos = {
  id: string;
  name: string;
  ip: string;
  status: VmState;
  memory: number;
  disk: number;
  cpus: number;
  provider: VmProvider;
  createdAt: Date;
};
