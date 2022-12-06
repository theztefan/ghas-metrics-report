
// Dependabot alerts

export interface DependancyAlert {
    number: number
    state: string
    dependency: Dependency
    security_advisory: SecurityAdvisory
    security_vulnerability: SecurityVulnerability
    url: string
    html_url: string
    created_at: string
    updated_at: string
    dismissed_at: any
    dismissed_by: any
    dismissed_reason: any
    dismissed_comment: any
    fixed_at: any
  }
  
  export interface Dependency {
    package: Package
    manifest_path: string
    scope: string
  }
  
  export interface Package {
    ecosystem: string
    name: string
  }
  
  export interface SecurityAdvisory {
    ghsa_id: string
    cve_id: string
    summary: string
    description: string
    severity: string
    identifiers: Identifier[]
    references: Reference[]
    published_at: string
    updated_at: string
    withdrawn_at: any
    vulnerabilities: Vulnerability[]
    cvss: Cvss
    cwes: Cwe[]
  }
  
  export interface Identifier {
    value: string
    type: string
  }
  
  export interface Reference {
    url: string
  }
  
  export interface Vulnerability {
    package: Package2
    severity: string
    vulnerable_version_range: string
    first_patched_version: FirstPatchedVersion
  }
  
  export interface Package2 {
    ecosystem: string
    name: string
  }
  
  export interface FirstPatchedVersion {
    identifier: string
  }
  
  export interface Cvss {
    vector_string: any
    score: number
  }
  
  export interface Cwe {
    cwe_id: string
    name: string
  }
  
  export interface SecurityVulnerability {
    package: Package3
    severity: string
    vulnerable_version_range: string
    first_patched_version: FirstPatchedVersion2
  }
  
  export interface Package3 {
    ecosystem: string
    name: string
  }
  
  export interface FirstPatchedVersion2 {
    identifier: string
  }
  

  // Code scanning alerts
  export interface CodeScanningAlert {
    number: number
    created_at: string
    updated_at: string
    url: string
    html_url: string
    state: string
    fixed_at: any
    dismissed_by: DismissedBy
    dismissed_at: string
    dismissed_reason: string
    dismissed_comment: string
    rule: Rule
    tool: Tool
    most_recent_instance: MostRecentInstance
    instances_url: string
  }
  
  export interface DismissedBy {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  
  export interface Rule {
    id: string
    severity: string
    description: string
    name: string
    tags: string[]
    security_severity_level: string
  }
  
  export interface Tool {
    name: string
    guid: any
    version: string
  }
  
  export interface MostRecentInstance {
    ref: string
    analysis_key: string
    environment: string
    category: string
    state: string
    commit_sha: string
    message: Message
    location: Location
    classifications: any[]
  }
  
  export interface Message {
    text: string
  }
  
  export interface Location {
    path: string
    start_line: number
    end_line: number
    start_column: number
    end_column: number
  }
  