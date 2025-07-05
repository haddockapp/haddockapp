export enum VmProvider {
  Libvirt = "libvirt",
  VirtualBox = "virtualbox",
}

export enum VmState {
  Starting = "starting",
  Running = "running",
  Stopping = "stopping",
  Stopped = "stopped",
}

export type VMInfos = {
  id: string;
  ip: string;
  status: VmState;
  memory: number;
  disk: number;
  cpus: number;
  provider: VmProvider;
  createdAt: Date;
};
