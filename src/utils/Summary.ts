import * as core from "@actions/core";
import { SummaryTableRow } from "@actions/core/lib/summary";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

export function prepareSummary(): void {
  core.summary.addHeading("GHAS Metrics Summary");
  core.summary.addBreak();
}

export function addSummaryHeader(title: string): void {
  core.summary.addHeading(title, 2);
}

export function addSummarySection(
  name: string,
  heading: string,
  list: string[],
  tableHeaders: string[],
  tableBody: unknown[]
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

let position;
let pdf: jsPDF;

export function preparePDF(): void {
  pdf = new jsPDF();
  position = 10;
  pdf.text("GHAS Metrics Summary", 10, position);
}

export function getPDF(): jsPDF {
  return pdf;
}

export function addPDFSectionBreak(): void {
  position += 100;
}

export function addPDFHeader(title: string): void {
  position += 10;
  pdf.text(title, 10, position);
}

export function addPDFSection(
  name: string,
  heading: string,
  list: string[],
  tableHeaders: string[],
  tableBody: unknown[]
): jsPDF {
  position += 10;
  pdf.text(name, 10, position);

  list.forEach((entry) => {
    pdf.text(entry, 10, position);
    position += 10;
  });

  pdf.text(heading, 10, position);

  position += 10;
  autoTable(pdf, {
    head: [
      tableHeaders.map((attribute) => {
        return { content: attribute, styles: { halign: "center" } };
      }),
    ],
    body: tableBody as RowInput[],
    startY: position,
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

  return pdf;
}
