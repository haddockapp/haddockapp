
import { NetworkInterfaceInfo } from 'os';

export const mockNetworkInterfaces = (): { [key: string]: NetworkInterfaceInfo[] } => ({
    eth0: [
        {
            family: 'IPv4',
            address: '192.168.1.1',
            internal: false,
            netmask: '255.255.255.0',
            mac: '00:1B:44:11:3A:B7',
            cidr: '192.168.1.1/24',
        },
        {
            family: 'IPv6',
            address: 'fe80::1',
            internal: false,
            netmask: 'ffff:ffff:ffff:ffff::',
            mac: '00:1B:44:11:3A:B7',
            scopeid: 1,
            cidr: 'fe80::1/64',
        },
    ],
    lo: [
        {
            family: 'IPv4',
            address: '127.0.0.1',
            internal: true,
            netmask: '255.0.0.0',
            mac: '00:00:00:00:00:00',
            cidr: '127.0.0.1/8',
        },
    ],
});
