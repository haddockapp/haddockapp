export default interface Email {
    email: string,
    verified: boolean,
    primary: boolean,
    visibility: 'public' | 'private';
}
