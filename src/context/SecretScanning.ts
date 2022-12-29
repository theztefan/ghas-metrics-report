import { SecretScanningAlerts } from "../github/SecretScanningAlerts";
import {
  AlertsMetrics as AlertsMetricsType,
  ghasFeatures,
  reportFrequency,
  SecretScanningAlert,
} from "../types/common/main";
import { AlertsMetrics, createUrlLink, GetCommitDate } from "../utils";
import { Feature } from "./Feature";

export class SecretScanning implements Feature {
  name: ghasFeatures = "secret-scanning";
  prettyName = "Secret Scanning";
  metrics: AlertsMetricsType;
  attributes: string[] = [
    "SecretType",
    "Found at",
    "Push Protection Bypass",
    "Patched version",
    "Link",
  ];

  async alerts(org: string, repo: string): Promise<SecretScanningAlert[]> {
    return await SecretScanningAlerts(org, repo);
  }

  async alertsMetrics(
    frequency: reportFrequency,
    alerts: SecretScanningAlert[],
    org: string,
    repo: string
  ): Promise<AlertsMetricsType> {
    await GetCommitDate(org, repo, alerts, "commitsSha");

    this.metrics = AlertsMetrics(
      alerts,
      frequency,
      "resolved_at",
      "resolved",
      true,
      "commitDate",
      "created_at"
    );

    return this.metrics;
  }

  summaryTop10(): string[][] {
    return this.metrics.top10.map((a: SecretScanningAlert) => [
      a.secret_type_display_name,
      a.created_at,
      (a.push_protection_bypassed as boolean) ? "True" : "False",
      createUrlLink(a.html_url, "Link"),
    ]);
  }
}
