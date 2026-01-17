export interface TrivyImageOutput {
    SchemaVersion: number;
    ReportID:      string;
    CreatedAt:     Date;
    ArtifactID:    string;
    ArtifactName:  string;
    ArtifactType:  string;
    Metadata:      Metadata;
    Results:       Result[];
}

export interface Metadata {
    Size:        number;
    OS:          OS;
    ImageID:     string;
    DiffIDs:     string[];
    RepoTags:    string[];
    RepoDigests: string[];
    Reference:   string;
    ImageConfig: ImageConfig;
    Layers:      LayerElement[];
}

export interface ImageConfig {
    architecture: Arch;
    created:      Date;
    history:      History[];
    os:           string;
    rootfs:       Rootfs;
    config:       Config;
}

export enum Arch {
    All = "all",
    Amd64 = "amd64",
}

export interface Config {
    Cmd:          string[];
    Entrypoint:   string[];
    Env:          string[];
    Labels:       Labels;
    ExposedPorts: ExposedPorts;
    ArgsEscaped:  boolean;
    StopSignal:   string;
}

export interface ExposedPorts {
    "80/tcp": The80TCP;
}

export interface The80TCP {
}

export interface Labels {
    maintainer: string;
}

export interface History {
    created:      Date;
    created_by:   string;
    empty_layer?: boolean;
    comment?:     Comment;
}

export enum Comment {
    BuildkitDockerfileV0 = "buildkit.dockerfile.v0",
}

export interface Rootfs {
    type:     string;
    diff_ids: string[];
}

export interface LayerElement {
    Size:   number;
    Digest: string;
    DiffID: string;
}

export interface OS {
    Family: Family;
    Name:   string;
}

export enum Family {
    Debian = "debian",
    Nvd = "nvd",
}

export interface Result {
    Target:          string;
    Class:           string;
    Type:            Family;
    Packages:        Package[];
    Vulnerabilities: Vulnerability[];
}

export interface Package {
    ID:             string;
    Name:           string;
    Identifier:     Identifier;
    Version:        string;
    Arch:           Arch;
    SrcName:        string;
    SrcVersion:     string;
    Licenses?:      string[];
    Maintainer:     string;
    DependsOn?:     string[];
    Layer:          PackageLayer;
    InstalledFiles: string[];
    Release?:       string;
    SrcRelease?:    string;
    Epoch?:         number;
    SrcEpoch?:      number;
}

export interface Identifier {
    PURL: string;
    UID:  string;
}

export interface PackageLayer {
    Digest: string;
    DiffID: string;
}

export interface Vulnerability {
    VulnerabilityID:   string;
    PkgID:             string;
    PkgName:           string;
    PkgIdentifier:     Identifier;
    InstalledVersion:  string;
    Status:            Status;
    Layer:             PackageLayer;
    SeveritySource?:   Family;
    PrimaryURL?:       string;
    DataSource:        DataSource;
    Fingerprint:       string;
    Title:             string;
    Description?:      string;
    Severity:          TrivySeverity;
    CweIDs?:           string[];
    VendorSeverity?:   { [key: string]: number };
    CVSS?:             Cvss;
    References?:       string[];
    PublishedDate?:    Date;
    LastModifiedDate?: Date;
    FixedVersion?:     string;
    VendorIDs?:        string[];
}

export interface Cvss {
    nvd?:     Nvd;
    redhat?:  Nvd;
    bitnami?: Bitnami;
    ghsa?:    Bitnami;
}

export interface Bitnami {
    V3Vector: string;
    V3Score:  number;
}

export interface Nvd {
    V2Vector?: string;
    V3Vector?: string;
    V2Score?:  number;
    V3Score?:  number;
}

export interface DataSource {
    ID:   Family;
    Name: Name;
    URL:  string;
}

export enum Name {
    DebianSecurityTracker = "Debian Security Tracker",
}

export enum TrivySeverity {
    Critical = "CRITICAL",
    High = "HIGH",
    Low = "LOW",
    Medium = "MEDIUM",
    Unknown = "UNKNOWN",
}

export enum Status {
    Affected = "affected",
    FixDeferred = "fix_deferred",
    Fixed = "fixed",
    WillNotFix = "will_not_fix",
}
