import * as core from "@actions/core";
import { SummaryTableRow } from "@actions/core/lib/summary";
import { stringify } from "querystring";
import { Report } from "./Report";
import { ReportMetadata } from "./ReportMetadata";

export class SummaryReport extends ReportMetadata implements Report {
  prepare(): void {
    core.summary.addHeading("GHAS Metrics Summary");
    core.summary.addBreak();
  }

  addHeader(title: string): void {
    core.summary.addHeading(title, 2);
  }

  addSection(
    name: string,
    heading: string,
    list: string[],
    tableHeaders: string[],
    tableBody: unknown[],
  ): void {
    core.summary
      .addHeading(name)
      .addList(list)
      .addHeading(heading, 2)
      .addTable([
        tableHeaders.map((attribute) => {
          return { data: attribute, header: true };
        }),
        ...tableBody,
      ] as SummaryTableRow[])
      .addBreak();
  }

  write(): void {
    core.summary.write();
  }

  stringify(): string {
    return core.summary.stringify();
  }
}
