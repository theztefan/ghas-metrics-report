import {
  Alert,
  AlertsMetrics as AlertsMetricsType,
  DependancyAlert,
  ghasFeatures,
  reportFrequency,
} from "../types/common/main";
import { AlertsMetrics, createUrlLink, DependabotAlerts } from "../utils";
import { Feature } from "./Feature";

export class Dependabot implements Feature {
  name: ghasFeatures = "dependabot";
  prettyName = "Dependabot";
  metrics: AlertsMetricsType;
  attributes: string[] = [
    "Package",
    "Severity",
    "Vulnerable versions",
    "Patched version",
    "CVE",
    "CVSS",
    "Link",
  ];

  async alerts(org: string, repo: string): Promise<Alert[]> {
    return await DependabotAlerts(org, repo);
  }

  async alertsMetrics(
    frequency: reportFrequency,
    alerts: Alert[]
  ): Promise<AlertsMetricsType> {
    this.metrics = AlertsMetrics(alerts, frequency, "fixed_at", "fixed", false);

    return this.metrics;
  }

  summaryTop10(): string[][] {
    return this.metrics.top10.map((a: DependancyAlert) => [
      a.security_vulnerability?.package.name || "",
      a.security_vulnerability?.severity || "",
      a.security_vulnerability?.vulnerable_version_range || "",
      a.security_vulnerability?.first_patched_version?.identifier || "",
      a.security_advisory?.cve_id || "",
      a.security_advisory?.cvss?.vector_string || "",
      createUrlLink(a.html_url, "Link"),
    ]);
  }
}
