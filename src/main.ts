import * as core from "@actions/core";
import { inputs as getInput, secondsToReadable } from "./utils";
import { Alert, AlertsMetrics, ReportType } from "./types/common/main";
import { randomUUID } from "crypto";
import { Context } from "./context/Context";
import {
  getRepository,
  getRepositoriesForOrg,
  getRepositoriesForTeamAsAdmin,
} from "./github/Repositories";
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

      if (context.feature.metrics.openVulnerabilities > 0)
        features.push(context.feature);
    }

    output.repositories.push({
      owner: inputs.org,
      name: repository.name,
      features: features,
    });
  }

  if (process.env.RUN_USING_ACT !== "true") {
    inputs.outputFormat.push("html", "github-output");
  }

  inputs.outputFormat.forEach((format) => {
    const outputWithoutMetadata = {
      ...output,
      repositories: output.repositories.map((repository) => ({
        ...repository,
        features: repository.features.map((feature) =>
          feature.printable(feature.prettyName, feature.metrics)
        ),
      })),
    };

    switch (format) {
      case "json":
        JSONReport.write(
          "ghas-report.json",
          JSON.stringify(outputWithoutMetadata, null, 2)
        );
        break;
      case "pdf":
      case "html": {
        const report = format === "pdf" ? new PDFReport() : new SummaryReport();
        report.prepare();

        output.repositories.forEach((repository) => {
          if (repository.features.length === 0) return;

          report.addHeader(`Repository ${repository.owner}/${repository.name}`);

          repository.features.forEach((feature) => {
            const list = [
              `Open Alerts: ${feature.metrics?.openVulnerabilities}`,
              `Fixed in the past X days: ${feature.metrics?.fixedLastXDays}`,
              `Frequency: ${inputs.frequency}`,
              "MTTR: " + secondsToReadable(feature.metrics?.mttr.mttr),
              "MTTD: " + secondsToReadable(feature.metrics?.mttd?.mttd) ||
                "N/A",
            ];
            report.addSection(
              feature.prettyName,
              `${feature.prettyName} - top 10`,
              list,
              feature.attributes,
              feature.summaryTop10()
            );
          });
        });

        report.write();
        break;
      }
      case "github-output":
        core.setOutput(
          "report-json",
          JSON.stringify(outputWithoutMetadata, null, 2)
        );
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
