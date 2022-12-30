import { Report } from "./Report";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { join } from "path";

export class PDFReport implements Report {
  private pdf: jsPDF;
  private position: number;
  private filename = "ghas-report.pdf";

  private jumpAndUsePosition() {
    this.position += 10;
    return this.position;
  }

  private setFontAndWriteText(
    text: string,
    fontSize: number,
    xPosition,
    yPosition = this.jumpAndUsePosition()
  ) {
    this.pdf.setFontSize(fontSize);
    this.pdf.text(text, xPosition, yPosition);
  }

  prepare(): void {
    this.position = 20;
    this.pdf = new jsPDF();
    this.pdf.setFontSize(30);
    this.pdf.text("GHAS Metrics Summary", 50, this.position, {
      lineHeightFactor: 2,
    });
    this.position = 30;
  }

  addHeader(title: string): void {
    if (this.pdf.getNumberOfPages() !== 1) {
      this.position = 20;
    }

    this.setFontAndWriteText(title, 20, 10);
  }

  addSection(
    name: string,
    heading: string,
    list: string[],
    tableHeaders: string[],
    tableBody: unknown[]
  ): void {
    if (this.pdf.getNumberOfPages() !== 1) this.position = 30;

    this.setFontAndWriteText(name, 20, 10);

    this.pdf.setFontSize(10);
    list.forEach((entry, index: number) =>
      this.pdf.text(
        entry,
        index % 2 === 0 ? 10 : 80,
        index % 2 === 0 ? this.jumpAndUsePosition() : this.position
      )
    );

    this.setFontAndWriteText(heading, 15, 10);

    const cellWidth = Math.ceil(178 / tableHeaders.length);

    autoTable(this.pdf, {
      head: [
        tableHeaders.map((attribute) => {
          return { content: attribute, styles: { halign: "center" } };
        }),
      ],
      body: tableBody as RowInput[],
      startY: this.jumpAndUsePosition(),
      theme: "grid",
      styles: {
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth },
        1: { cellWidth },
        2: { cellWidth },
        3: { cellWidth },
        4: { cellWidth },
        5: { cellWidth },
        6: { cellWidth },
      },
    });

    this.pdf.addPage();
  }

  write(): void {
    this.pdf.deletePage(this.pdf.getNumberOfPages());
    const outputFilename = join(
      process.env.GITHUB_WORKSPACE as string,
      this.filename
    );
    this.pdf.save(outputFilename);
    return;
  }
}
