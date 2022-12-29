import * as core from "@actions/core";
import {
  inputs as getInput,
  PrintAlertsMetrics,
  syncWriteFile as writeReportToFile,
  preparePdfAndWriteToFile as writeReportToPdf,
  prepareSummary,
  preparePdf,
  secondsToReadable,
} from "./utils";
import { Alert, AlertsMetrics, Report } from "./types/common/main";
import { randomUUID } from "crypto";
import { Context } from "./context/Context";
import * as fs from "fs";
import { addHeader, addSummarySection } from "./utils/Summary";
import {
  getRepository,
  getRepositoriesForOrg,
  getRepositoriesForTeamAsAdmin,
} from "./github/Repositories";

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

  const output: Report = {
    id: id,
    created_at: new Date().toISOString(),
    inputs: inputs,
    repositories: [],
  } as Report;

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

      PrintAlertsMetrics(`${context.prettyName}`, metrics);

      core.debug(
        `[🔎] ${context.prettyName} - MTTR: ` +
          JSON.stringify(metrics.mttr.mttr)
      );
      core.debug(
        `[🔎] ${context.prettyName} - MTTD: ` +
          JSON.stringify(metrics.mttd?.mttd)
      );

      core.info(`[✅] ${context.prettyName} metrics calculated`);

      features.push(context.feature.printable());
    }

    output.repositories.push({
      owner: inputs.org,
      name: repository.name,
      features: features,
    });
  }

  core.setOutput("report-json", JSON.stringify(output, null, 2));
  core.info(`[✅] Report written output 'report-json' variable`);

  if (inputs.outputFormat.includes("json")) {
    writeReportToFile("ghas-report.json", JSON.stringify(output, null, 2));
    core.info(`[✅] JSON Report written to file`);
  }

  if (inputs.outputFormat.includes("pdf")) {
    writeReportToPdf("ghas-report.pdf", preparePdf(output));
    core.info(`[✅] PDF Report written to file`);
  }

  if (process.env.RUN_USING_ACT !== "true") {
    prepareSummary();

    output.repositories.forEach((repository) => {
      addHeader(`Repository ${repository.owner}/${repository.name}`);
  
      repository.features.forEach((feature) =>
        addSummarySection(
          feature.prettyName,
          `${feature.prettyName} - top 10`,
          [
            `Open Alerts: ${feature.metrics?.openVulnerabilities}`,
            `Fixed in the past X days: ${feature.metrics?.fixedLastXDays}`,
            `Frequency: ${inputs.frequency}`,
            "MTTR: " + secondsToReadable(feature.metrics?.mttr.mttr),
            "MTTD: " + secondsToReadable(feature.metrics?.mttd?.mttd) || "N/A",
          ],
          feature.attributes,
          feature.summaryTop10()
        )
      );
    });

    core.summary.write();
    core.info(`[✅] Report written to summary`);
  }

  return;
};

run();
