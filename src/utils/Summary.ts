import * as core from "@actions/core";
import { Report } from "../types/common/main";
import { SummaryTableRow } from "@actions/core/lib/summary";

export function prepareSummary(report: Report): void {
  core.summary.addHeading("GHAS Metrics Summary");
  core.summary.addBreak();

  const dependabotTop10rows = report.dependabot_metrics?.top10.map((a: any) => [
    a.security_vulnerability?.package.name,
    a.security_vulnerability?.severity,
    a.security_vulnerability?.vulnerable_version_range,
    a.security_vulnerability?.first_patched_version?.identifier,
    a.security_advisory?.cve_id,
    a.security_advisory?.cvss?.vector_string,
  ]);

  core.debug("#####");
  core.debug(dependabotTop10rows);

  const codeScanningTop10rows: SummaryTableRow =
    report.code_scanning_metrics?.top10.map((a: any) => [
      a.rule?.name,
      a.rule?.severity,
      a.tool?.name,
      a.location?.path,
      a.instances_url,
    ]);

  const secretScanningTop10rows: SummaryTableRow =
    report.secret_scanning_metrics?.top10.map((a: any) => [
      a.secret_type_display_name,
      a.created_at,
      a.push_protection_bypassed,
      a.html_url,
    ]);

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
        "Package",
        "Severity",
        "Vulnerable versions",
        "Patched version",
        "CVE",
        "CVSS",
      ],
      //dependabotTop10rows,
      [
        "loader-utils",
        "critical",
        ">= 2.0.0, < 2.0.3",
        "2.0.3",
        "CVE-2022-37601",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      ],
      [
        "loader-utils",
        "critical",
        "< 1.4.1",
        "1.4.1",
        "CVE-2022-37601",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      ],
      [
        "shell-quote",
        "critical",
        "<= 1.7.2",
        "1.7.3",
        "CVE-2021-42740",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      ],
      [
        "eventsource",
        "critical",
        "< 1.1.1",
        "1.1.1",
        "CVE-2022-1650",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:N",
      ],
      [
        "ejs",
        "critical",
        "< 3.1.7",
        "3.1.7",
        "CVE-2022-29078",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      ],
      [
        "url-parse",
        "critical",
        "< 1.5.8",
        "1.5.8",
        "CVE-2022-0686",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
      ],
      [
        "json-schema",
        "critical",
        "< 0.4.0",
        "0.4.0",
        "CVE-2021-3918",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      ],
      [
        "pycrypto",
        "critical",
        "<= 2.6.1",
        "xx",
        "CVE-2013-7459",
        "CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      ],
      [
        "qs",
        "high",
        ">= 6.5.0, < 6.5.3",
        "6.5.3",
        "CVE-2022-24999",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
      ],
      [
        "qs",
        "high",
        ">= 6.7.0, < 6.7.3",
        "6.7.3",
        "CVE-2022-24999",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
      ],
    ])

    .addBreak()
    .addHeading("Code Scanning")
    .addList([
      `Open Alerts: ${report.code_scanning_metrics?.openVulnerabilities}`,
      `Fixed Yesterday: ${report.code_scanning_metrics?.fixedYesterday}`,
      `Fixed in the past 7 days: ${report.code_scanning_metrics?.fixedLastWeek}`,
      `MTTR: ${report.code_scanning_metrics?.mttr.mttr}`,
    ])
    .addTable([
      ["Vulnerability", "Severity", "Tool", "Vulnerable file", "Link"],
      codeScanningTop10rows,
    ])

    .addBreak()
    .addHeading("Secret Scanning")
    .addList([
      `Open Alerts: ${report.secret_scanning_metrics?.openVulnerabilities}`,
      `Fixed Yesterday: ${report.secret_scanning_metrics?.fixedYesterday}`,
      `Fixed in the past 7 days: ${report.secret_scanning_metrics?.fixedLastWeek}`,
      `MTTR: ${report.secret_scanning_metrics?.mttr.mttr}`,
    ])
    .addTable([
      ["Secret Type", "Found at", "Push Protection Bypass", "Link"],
      secretScanningTop10rows,
    ]);
}
