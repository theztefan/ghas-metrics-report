import * as core from "@actions/core";
import { Report } from "../types/common/main";
import { SummaryTableRow } from "@actions/core/lib/summary";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

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
      `Fixed in the past X days: ${report.dependabot_metrics?.fixedLastXDays}`,
      `Frequency: ${report.inputs.frequency}`,
      "MTTR: " + secondsToReadable(report.dependabot_metrics?.mttr.mttr),
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

  core.summary
    .addBreak()
    .addHeading("Code Scanning")
    .addList([
      `Open Alerts: ${report.code_scanning_metrics?.openVulnerabilities}`,
      `Fixed in the past X days: ${report.code_scanning_metrics?.fixedLastXDays}`,
      `Frequency: ${report.inputs.frequency}`,
      "MTTR: " + secondsToReadable(report.code_scanning_metrics?.mttr.mttr),
      "MTTD: " + secondsToReadable(report.code_scanning_metrics?.mttd.mttd),
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

  core.summary
    .addBreak()
    .addHeading("Secret Scanning")
    .addList([
      `Open Alerts: ${report.secret_scanning_metrics?.openVulnerabilities}`,
      `Fixed in the past X days: ${report.secret_scanning_metrics?.fixedLastXDays}`,
      `Frequency: ${report.inputs.frequency}`,
      "MTTR: " + secondsToReadable(report.secret_scanning_metrics?.mttr.mttr),
      "MTTD: " + secondsToReadable(report.secret_scanning_metrics?.mttd.mttd),
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
}

export function preparePdf(report: Report): jsPDF {
  const pdf = new jsPDF();
  pdf.text("GHAS Metrics Summary", 10, 10);

  const dependabotTop10rows: RowInput[] = report.dependabot_metrics?.top10.map(
    (a: any) => [
      a.security_vulnerability?.package.name,
      a.security_vulnerability?.severity,
      a.security_vulnerability?.vulnerable_version_range,
      a.security_vulnerability?.first_patched_version?.identifier,
      a.security_advisory?.cve_id,
      a.security_advisory?.cvss?.vector_string,
      createUrlLink(a.html_url, "Link"),
    ]
  );

  //replace occurences of null with empty string
  // dependabotTop10rows.forEach((row) => {
  //   row.forEach((cell, index) => {
  //     if (cell === null || cell == undefined) {
  //       row[index] = "";
  //     }
  //   });
  // });

  const codeScanningTop10rows: RowInput[] =
    report.code_scanning_metrics?.top10.map((a: any) => [
      a.rule?.name,
      a.rule?.severity,
      a.tool?.name,
      a.most_recent_instance?.location.path,
      createUrlLink(a.html_url, "Link"),
    ]);

  // codeScanningTop10rows.forEach((row) => {
  //   row.forEach((cell, index) => {
  //     if (cell === null || cell == undefined) {
  //       row[index] = "";
  //     }
  //   });
  // });

  const secretScanningTop10rows: RowInput[] =
    report.secret_scanning_metrics?.top10.map((a: any) => [
      a.secret_type_display_name,
      a.created_at,
      (a.push_protection_bypassed as boolean) ? "True" : "False",
      createUrlLink(a.html_url, "Link"),
    ]);

  // secretScanningTop10rows.forEach((row) => {
  //   row.forEach((cell, index) => {
  //     if (cell === null || cell == undefined) {
  //       row[index] = "";
  //     }
  //   });
  // });

  pdf.text("Dependabot", 10, 20);
  pdf.text(
    `Open Alerts: ${report.dependabot_metrics?.openVulnerabilities}`,
    10,
    30
  );
  pdf.text(
    `Fixed in the past X days: ${report.dependabot_metrics?.fixedLastXDays}`,
    10,
    40
  );
  pdf.text(`Frequency: ${report.inputs.frequency}`, 10, 50);
  pdf.text(
    "MTTR: " + secondsToReadable(report.dependabot_metrics?.mttr.mttr),
    10,
    60
  );
  pdf.text("Dependabot - Top 10", 10, 70);
  autoTable(pdf, {
    head: [
      [
        { content: "Package", styles: { halign: "center" } },
        { content: "Severity", styles: { halign: "center" } },
        { content: "Vulnerable versions", styles: { halign: "center" } },
        { content: "Patched version", styles: { halign: "center" } },
        { content: "CVE", styles: { halign: "center" } },
        { content: "CVSS", styles: { halign: "center" } },
        { content: "Link", styles: { halign: "center" } },
      ],
    ],
    body: dependabotTop10rows,
    startY: 80,
    theme: "grid",
    styles: {
      cellPadding: 2,
      fontSize: 8,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
      cellWidth: "wrap",
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
    },
  });

  pdf.text("Code Scanning", 10, 150);
  pdf.text(
    `Open Alerts: ${report.code_scanning_metrics?.openVulnerabilities}`,
    10,
    160
  );
  pdf.text(
    `Fixed in the past X days: ${report.code_scanning_metrics?.fixedLastXDays}`,
    10,
    170
  );
  pdf.text(`Frequency: ${report.inputs.frequency}`, 10, 180);
  pdf.text(
    "MTTR: " + secondsToReadable(report.code_scanning_metrics?.mttr.mttr),
    10,
    190
  );
  pdf.text(
    "MTTD: " + secondsToReadable(report.code_scanning_metrics?.mttd.mttd),
    10,
    200
  );
  pdf.text("Code Scanning - Top 10", 10, 210);
  autoTable(pdf, {
    head: [
      [
        { content: "Vulnerability", styles: { halign: "center" } },
        { content: "Severity", styles: { halign: "center" } },
        { content: "Tool", styles: { halign: "center" } },
        { content: "Location", styles: { halign: "center" } },
        { content: "Link", styles: { halign: "center" } },
      ],
    ],
    body: codeScanningTop10rows,
    startY: 210,
    theme: "grid",
    styles: {
      cellPadding: 2,
      fontSize: 8,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
      cellWidth: "wrap",
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 50 },
      4: { cellWidth: 20 },
    },
  });

  pdf.text("Secret Scanning", 10, 280);
  pdf.text(
    `Open Alerts: ${report.secret_scanning_metrics?.openVulnerabilities}`,
    10,
    290
  );
  pdf.text(
    `Fixed in the past X days: ${report.secret_scanning_metrics?.fixedLastXDays}`,
    10,
    300
  );
  pdf.text(`Frequency: ${report.inputs.frequency}`, 10, 310);
  pdf.text(
    "MTTR: " + secondsToReadable(report.secret_scanning_metrics?.mttr.mttr),
    10,
    320
  );
  pdf.text(
    "MTTD: " + secondsToReadable(report.secret_scanning_metrics?.mttd.mttd),
    10,
    330
  );
  pdf.text("Secret Scanning - Top 10", 10, 340);
  autoTable(pdf, {
    head: [
      [
        { content: "Secret Type", styles: { halign: "center" } },
        { content: "Found at", styles: { halign: "center" } },
        { content: "Push Protection Bypass", styles: { halign: "center" } },
        { content: "Link", styles: { halign: "center" } },
      ],
    ],
    body: secretScanningTop10rows,
    startY: 340,
    theme: "grid",
    styles: {
      cellPadding: 2,
      fontSize: 8,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
      cellWidth: "wrap",
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
    },
  });
  return pdf;
}

function createUrlLink(url: string | null, text: string): string {
  return `<a target=_blank href="${url}">${text}</a>`;
}

function secondsToReadable(seconds: number): string {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
