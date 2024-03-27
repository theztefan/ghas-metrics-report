import {
  Alert,
  AlertsMetrics as AlertsMetricsType,
  ghasFeatures,
  reportFrequency,
} from "../types/common/main";

export interface Feature {
  name: ghasFeatures;
  prettyName: string;
  metrics: AlertsMetricsType;
  attributes: string[];

  alerts(org: string, repo: string): Promise<Alert[]>;
  alertsMetrics(
    frequency: reportFrequency,
    alerts: Alert[],
    org?: string,
    repo?: string,
  ): Promise<AlertsMetricsType>;
  summaryTop10(): string[][];
  printable(
    prettyName: string,
    metrics: AlertsMetricsType,
  ): { prettyName: string; metrics: AlertsMetricsType };
}
