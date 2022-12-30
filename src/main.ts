import * as core from "@actions/core";
import { inputs as getInput, secondsToReadable } from "./utils";
import {
  Alert,
  AlertsMetrics,
  ReportType,
  ReportContent,
} from "./types/common/main";
import { randomUUID } from "crypto";
import { Context } from "./context/Context";
import {
  getRepository,
  getRepositoriesForOrg,
  getRepositoriesForTeamAsAdmin,
} from "./github/Repositories";
import { Feature } from "./context/Feature";
import { JSONReport } from "./report/JSONReport";
import { PDFReport } from "./report/PDFReport";
import { SummaryReport } from "./report/SummaryReport";

const run = async (): Promise<void> => {
  // get inputs
  const inputs = await getInput();
  core.debug(`[✅] Inputs parsed]`);

  const id = randomUUID();

  const repositories = [];
  if (inputs.team) {
    core.info(
      `[🔎] Fetching repositories for team ${inputs.team} in org ${inputs.org}`
    );
    repositories.push(
      ...(await getRepositoriesForTeamAsAdmin(inputs.org, inputs.team))
    );
  } else if (inputs.repo) {
    core.info(`[🔎] Fetching repository ${inputs.repo} in org ${inputs.org}`);
    repositories.push(await getRepository(inputs.org, inputs.repo));
  } else {
    core.info(`[🔎] Fetching repositories for org ${inputs.org}`);
    repositories.push(...(await getRepositoriesForOrg(inputs.org)));
  }

  core.info(`[✅] Repositories fetched`);
  core.info(`[🔎] Found ${repositories.length} repositories`);

  const output: ReportType = {
    id: id,
    created_at: new Date().toISOString(),
    inputs: inputs,
    repositories: [],
  } as ReportType;

  for (const repository of repositories) {
    core.info(`[🔎] Fetching alerts for repository ${repository.name}`);
    const features = [];
    for (const feature of inputs.features) {
      const context = new Context(feature);
      core.info(`[🔎] Fetching ${context.prettyName} alerts`);

      const alerts: Alert[] = await context.alerts(
        inputs.org as string,
        repository.name
      );

      core.debug(`[🔎] ${context.prettyName} alerts: ` + alerts.length);
      core.info(`[✅] ${context.prettyName} alerts fetched`);

      const metrics: AlertsMetrics = await context.alertsMetrics(
        inputs.frequency,
        alerts,
        inputs.org as string,
        repository.name
      );

      core.debug(
        `[🔎] ${context.prettyName} - MTTR: ` +
          JSON.stringify(metrics.mttr.mttr)
      );
      core.debug(
        `[🔎] ${context.prettyName} - MTTD: ` +
          JSON.stringify(metrics.mttd?.mttd)
      );

      core.info(`[✅] ${context.prettyName} metrics calculated`);

      features.push(context.feature);
    }

    output.repositories.push({
      owner: inputs.org,
      name: repository.name,
      features: features,
    });
  }

  const sections: Map<string, ReportContent[]> = new Map();
  output.repositories.forEach((repository) => {
    sections.set(`${repository.owner}/${repository.name}`, []);

    repository.features.forEach((feature: Feature) =>
      sections.get(`${repository.owner}/${repository.name}`).push({
        name: feature.prettyName,
        heading: `${feature.prettyName} - top 10`,
        list: [
          `Open Alerts: ${feature.metrics?.openVulnerabilities}`,
          `Fixed in the past X days: ${feature.metrics?.fixedLastXDays}`,
          `Frequency: ${inputs.frequency}`,
          "MTTR: " + secondsToReadable(feature.metrics?.mttr.mttr),
          "MTTD: " + secondsToReadable(feature.metrics?.mttd?.mttd) || "N/A",
        ],
        tableHeaders: feature.attributes,
        tableBody: feature.summaryTop10(),
      })
    );
  });

  if (process.env.RUN_USING_ACT !== "true") {
    inputs.outputFormat.push("html", "github-output");
  }

  let report;
  inputs.outputFormat.forEach((format) => {
    switch (format) {
      case "json":
        JSONReport.write("ghas-report.json", JSON.stringify(output, null, 2));
        break;
      case "pdf":
      case "html":
        report = format === "pdf" ? new PDFReport() : new SummaryReport();
        report.prepare();

        sections.forEach((content, key) => {
          report.addHeader(`Repository ${key}`);

          content.forEach((section) =>
            report.addSection(
              section.name,
              section.heading,
              section.list,
              section.tableHeaders,
              section.tableBody
            )
          );
        });

        report.write();
        break;
      case "github-output":
        core.setOutput("report-json", JSON.stringify(output, null, 2));
        core.info(`[✅] Report written output 'report-json' variable`);
        break;
      default:
        core.warning(`[⚠️] Unknown output format ${format}`);
        break;
    }
    core.info(`[✅] ${format.toUpperCase()} Report written`);
  });

  return;
};

run();
