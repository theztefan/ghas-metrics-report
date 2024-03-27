import { AlertsMetrics as AlertsMetricsType } from "../types/common/main";

export class Printable {
  printable(
    prettyName: string,
    metrics: AlertsMetricsType,
  ): { prettyName: string; metrics: AlertsMetricsType } {
    return {
      prettyName: prettyName,
      metrics: metrics,
    };
  }
}
