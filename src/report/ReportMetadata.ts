import { Feature } from "../context/Feature";
import { secondsToReadable } from "../utils";

export class ReportMetadata {
  addList(feature: Feature, frequency: string): any {
    const list = [
      `Open Alerts: ${feature.metrics?.openVulnerabilities}`,
      `Fixed in the past X days: ${feature.metrics?.fixedLastXDays}`,
      `Opened in the past X days: ${feature.metrics?.openedLastXDays}`,
      `Frequency: ${frequency}`,
      "MTTR: " + secondsToReadable(feature.metrics?.mttr.mttr),
      "MTTD: " + secondsToReadable(feature.metrics?.mttd?.mttd) || "N/A",
    ];

    return list;
  }

  addHeading(owner: string, name: string): string {
    return `Repository ${owner}/${name}`;
  }
}
