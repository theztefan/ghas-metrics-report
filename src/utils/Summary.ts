import * as core from "@actions/core";
import { Report } from "../types/common/main";
import { SummaryTableRow } from "@actions/core/lib/summary";

export function prepareSummary(report: Report): void {
  core.summary.addHeading("GHAS Metrics Summary");
  core.summary.addBreak();

  const dependabotTop10rows: SummaryTableRow[] =
    report.dependabot_metrics?.top10.map((a: any) => [
      a.security_vulnerability?.package.name,
      a.security_vulnerability?.severity,
      a.security_vulnerability?.vulnerable_version_range,
      a.security_vulnerability?.first_patched_version?.identifier,
      a.security_advisory?.cve_id,
      a.security_advisory?.cvss?.vector_string,
      createUrlLink(a.html_url, "Link"),
    ]);

  //replace occurences of null with empty string
  dependabotTop10rows.forEach((row) => {
    row.forEach((cell, index) => {
      if (cell === null || cell == undefined) {
        row[index] = "";
      }
    });
  });

  const codeScanningTop10rows: SummaryTableRow[] =
    report.code_scanning_metrics?.top10.map((a: any) => [
      a.rule?.name,
      a.rule?.severity,
      a.tool?.name,
      a.most_recent_instance?.location.path,
      createUrlLink(a.html_url, "Link"),
    ]);

  codeScanningTop10rows.forEach((row) => {
    row.forEach((cell, index) => {
      if (cell === null || cell == undefined) {
        row[index] = "";
      }
    });
  });

  const secretScanningTop10rows: SummaryTableRow[] =
    report.secret_scanning_metrics?.top10.map((a: any) => [
      a.secret_type_display_name,
      a.created_at,
      (a.push_protection_bypassed as boolean) ? "True" : "False",
      createUrlLink(a.html_url, "Link"),
    ]);

  secretScanningTop10rows.forEach((row) => {
    row.forEach((cell, index) => {
      if (cell === null || cell == undefined) {
        row[index] = "";
      }
    });
  });

  core.summary
    .addHeading("Dependabot")
    .addList([
      `Open Alerts: ${report.dependabot_metrics?.openVulnerabilities}`,
      `Fixed Yesterday: ${report.dependabot_metrics?.fixedYesterday}`,
      `Fixed in the past 7 days: ${report.dependabot_metrics?.fixedLastWeek}`,
      `MTTR: ${report.dependabot_metrics?.mttr.mttr}`,
    ])
    .addBreak()
    .addHeading("Dependabot - Top 10", 2)
    .addTable([
      [
        { data: "Package", header: true },
        { data: "Severity", header: true },
        { data: "Vulnerable versions", header: true },
        { data: "Patched version", header: true },
        { data: "CVE", header: true },
        { data: "CVSS", header: true },
        { data: "Link", header: true },
      ],
      ...dependabotTop10rows,
    ]);

  core.info("Created Dependabot");

  core.summary
    .addBreak()
    .addHeading("Code Scanning")
    .addList([
      `Open Alerts: ${report.code_scanning_metrics?.openVulnerabilities}`,
      `Fixed Yesterday: ${report.code_scanning_metrics?.fixedYesterday}`,
      `Fixed in the past 7 days: ${report.code_scanning_metrics?.fixedLastWeek}`,
      `MTTR: ${report.code_scanning_metrics?.mttr.mttr}`,
    ])
    .addHeading("Code Scanning - Top 10", 2)
    .addTable([
      [
        { data: "Vulnerability", header: true },
        { data: "Severity", header: true },
        { data: "Tool", header: true },
        { data: "Vulnerable file", header: true },
        { data: "Link", header: true },
      ],
      ...codeScanningTop10rows,
    ]);

  core.info("Created Code Scanning");

  core.summary
    .addBreak()
    .addHeading("Secret Scanning")
    .addList([
      `Open Alerts: ${report.secret_scanning_metrics?.openVulnerabilities}`,
      `Fixed Yesterday: ${report.secret_scanning_metrics?.fixedYesterday}`,
      `Fixed in the past 7 days: ${report.secret_scanning_metrics?.fixedLastWeek}`,
      `MTTR: ${report.secret_scanning_metrics?.mttr.mttr}`,
    ])
    .addHeading("Secret Scanning - Top 10", 2)
    .addTable([
      [
        { data: "Secret Type", header: true },
        { data: "Found at", header: true },
        { data: "Push Protection Bypass", header: true },
        { data: "Patched version", header: true },
        { data: "Link", header: true },
      ],
      ...secretScanningTop10rows,
    ]);

  core.info("Created Secret Scanning");
}

function createUrlLink(url: string | null, text: string): string {
  return `<a target=_blank href="${url}">${text}</a>`;
}
