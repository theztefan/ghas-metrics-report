import {
  Alert,
  AlertsMetrics as AlertsMetricsType,
  ghasFeatures,
  reportFrequency,
} from "../types/common/main";
import { Feature } from "./Feature";
import { SecretScanning } from "./SecretScanning";
import { Dependabot } from "./Dependabot";
import { CodeScanning } from "./CodeScanning";

export class Context {
  private _feature: Feature;

  constructor(feature: ghasFeatures) {
    switch (feature) {
      case "code-scanning":
        this._feature = new CodeScanning();
        break;
      case "dependabot":
        this._feature = new Dependabot();
        break;
      case "secret-scanning":
        this._feature = new SecretScanning();
        break;
      default:
        throw new Error(`Feature ${feature} not supported`);
    }
  }

  get prettyName(): string {
    return this._feature.prettyName;
  }

  get feature(): Feature {
    return this._feature;
  }

  async alerts(org: string, repo: string): Promise<Alert[]> {
    return await this._feature.alerts(org, repo);
  }

  async alertsMetrics(
    frequency: reportFrequency,
    alerts: Alert[],
    org?: string,
    repo?: string
  ): Promise<AlertsMetricsType> {
    return await this._feature.alertsMetrics(frequency, alerts, org, repo);
  }

  summaryTop10(): string[][] {
    return this._feature.summaryTop10();
  }
}
