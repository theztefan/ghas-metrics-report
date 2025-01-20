import {
  AlertsMetrics as AlertsMetricsType,
  CodeScanningAlert,
  DependencyOrCodeAlert,
  ghasFeatures,
  reportFrequency,
} from "../types/common/main";
import { AlertsMetrics, GetCommitDate } from "../utils";
import { Feature } from "./Feature";
import { CodeScanningAlerts } from "../github/CodeScanningAlerts";
import { Printable } from "./Printable";
export class CodeScanning extends Printable implements Feature {
  name: ghasFeatures = "code-scanning";
  prettyName = "Code Scanning";
  metrics: AlertsMetricsType;
  attributes: string[] = [
    "Vulnerability",
    "Severity",
    "Weakness",
    "Tool",
    "Vulnerable file",
    "Link",
  ];

  async alerts(org: string, repo: string): Promise<CodeScanningAlert[]> {
    return await CodeScanningAlerts(org, repo);
  }

  async alertsMetrics(
    frequency: reportFrequency,
    alerts: DependencyOrCodeAlert[],
    org: string,
    repo: string,
  ): Promise<AlertsMetricsType> {
    await GetCommitDate(org, repo, alerts, "most_recent_instance.commit_sha");

    this.metrics = AlertsMetrics(
      alerts,
      frequency,
      "fixed_at",
      "fixed",
      true,
      "commitDate",
      "created_at",
    );

    return this.metrics;
  }

  //Extracts CWE-### from CodeScanningAlert.rule.tags[] from any format like  "external/cwe/cwe-247" or "CWE-352: Cross-Site Request Forgery (CSRF)"
  cweFromTags(rule: CodeScanningAlert): string {
    const cwe = rule.rule?.tags
      .map((tag) => {
        const cwe = tag.match(/cwe-(\d+)/i);
        if (cwe) {
          return `CWE-${cwe[1]}`;
        }
        return "";
      })
      .filter((cwe) => cwe !== "")
      .join(", ");
    return cwe;
  }

  summaryTop10(): string[][] {
    return this.metrics.top10.map((a: CodeScanningAlert) => [
      a.rule?.name || "",
      a.rule?.security_severity_level || a.rule?.severity || "",
      this.cweFromTags(a),
      a.tool?.name || "",
      a.most_recent_instance?.location?.path
        ? `${a.most_recent_instance.location.path}#L${a.most_recent_instance.location.start_line}`
        : "",
      a.html_url,
    ]);
  }
}
