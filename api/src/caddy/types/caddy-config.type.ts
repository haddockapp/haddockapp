type CaddyfileConfig = {
    template: 'reverse-proxies.hbs';
    data: {
        data: {
            hostname: string;
            ip: string;
            port: number;
        }[]
    };
}

export type CaddyConfig = CaddyfileConfig & {
    dest: string;
}