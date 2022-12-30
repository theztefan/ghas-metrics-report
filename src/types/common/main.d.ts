import { Feature } from "../../context/Feature";

// Inputs from configuration options
type inputsReturned = {
  team?: string;
  repo?: string;
  org?: string;
  features: ghasFeatures[];
  frequency: reportFrequency;
  outputFormat: outputFormat[];
};

type ghasFeatures = "secret-scanning" | "dependabot" | "code-scanning";
type reportFrequency = "weekly" | "monthly" | "daily";
type outputFormat = "json" | "pdf" | "html" | "github-output";

interface MTTRMetrics {
  mttr: number;
  count: number;
}
interface MTTDMetrics {
  mttd: number;
}

export interface AlertsMetrics {
  fixedLastXDays: number;
  openVulnerabilities: number;
  top10: Alert[];
  mttr: MTTRMetrics;
  mttd?: MTTDMetrics;
}

// Base alerts
export interface Alert {
  number: number;
  created_at: string;
  updated_at: string;
  url: string;
  state: string;
  html_url: string;
}

// Common to Dependabot and Code Scanning alerts
export interface DependencyOrCodeAlert extends Alert {
  dismissed_by: DismissedBy;
  dismissed_at: string;
  dismissed_reason: string;
  dismissed_comment: string;
  fixed_at: string;
}

// Dependabot alerts
export interface DependancyAlert extends DependencyOrCodeAlert {
  dependency: Dependency;
  security_advisory: SecurityAdvisory;
  security_vulnerability: SecurityVulnerability;
}

// Code scanning alerts
export interface CodeScanningAlert extends Alert {
  rule: Rule;
  tool: Tool;
  most_recent_instance: MostRecentInstance;
  instances_url: string;
}

// Secret Scaning
export interface SecretScanningAlert extends Alert {
  locations_url: string;
  secret_type: string;
  secret_type_display_name: string;
  secret: string;
  resolution: string;
  resolved_by: unknown;
  resolved_at: string;
  resolution_comment: string;
  push_protection_bypassed: boolean;
  push_protection_bypassed_by: unknown;
  push_protection_bypassed_at: string;
  commitsSha?: string[];
}

export interface Dependency {
  package: Package;
  manifest_path: string;
  scope: string;
}

export interface Package {
  ecosystem: string;
  name: string;
}

export interface SecurityAdvisory {
  ghsa_id: string;
  cve_id: string;
  summary: string;
  description: string;
  severity: string;
  identifiers: Identifier[];
  references: Reference[];
  published_at: string;
  updated_at: string;
  withdrawn_at: string;
  vulnerabilities: Vulnerability[];
  cvss: Cvss;
  cwes: Cwe[];
}

export interface Identifier {
  value: string;
  type: string;
}

export interface Reference {
  url: string;
}

export interface Vulnerability {
  package: Package2;
  severity: string;
  vulnerable_version_range: string;
  first_patched_version: FirstPatchedVersion;
}

export interface Package2 {
  ecosystem: string;
  name: string;
}

export interface FirstPatchedVersion {
  identifier: string;
}

export interface Cvss {
  vector_string: string;
  score: number;
}

export interface Cwe {
  cwe_id: string;
  name: string;
}

export interface SecurityVulnerability {
  package: Package3;
  severity: string;
  vulnerable_version_range: string;
  first_patched_version: FirstPatchedVersion2;
}

export interface Package3 {
  ecosystem: string;
  name: string;
}

export interface FirstPatchedVersion2 {
  identifier: string;
}

export interface DismissedBy {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface Rule {
  id: string;
  severity: string;
  description: string;
  name: string;
  tags: string[];
}

export interface Tool {
  name: string;
  guid: string;
  version: string;
}

export interface MostRecentInstance {
  ref: string;
  analysis_key: string;
  environment: string;
  category: string;
  state: string;
  commit_sha: string;
  message: Message;
  location: Location;
  classifications: string[];
}

export interface Message {
  text: string;
}

export interface Location {
  path: string;
  start_line: number;
  end_line: number;
  start_column: number;
  end_column: number;
}

export interface SecretScanningLocation {
  type: string;
  details: SecretScanningLocationDetail;
}

export interface SecretScanningLocationDetail {
  commit_sha: string;
}

export interface ReportType {
  id: string;
  created_at: string;
  inputs: inputsReturned;
  repositories: {
    features: Feature[];
    owner: string;
    name: string;
  }[];
}
