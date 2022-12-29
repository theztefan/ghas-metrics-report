import { Report } from "./Report";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { join } from "path";

export class PDFReport implements Report {
  private pdf: jsPDF;
  private position: number;

  private jumpAndUsePosition() {
    this.position += 10;
    return this.position;
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
      this.pdf.addPage();
      this.position = 20;
    }

    this.pdf.setFontSize(20);
    this.pdf.text(title, 10, this.jumpAndUsePosition());
  }

  addSection(
    name: string,
    heading: string,
    list: string[],
    tableHeaders: string[],
    tableBody: unknown[]
  ): void {
    if (this.pdf.getNumberOfPages() !== 1) this.position = 30;

    this.pdf.setFontSize(20);
    this.pdf.text(name, 10, this.jumpAndUsePosition());

    this.pdf.setFontSize(10);
    list.forEach((entry, index: number) =>
      this.pdf.text(
        entry,
        index % 2 === 0 ? 10 : 80,
        index % 2 === 0 ? this.jumpAndUsePosition() : this.position
      )
    );

    this.pdf.setFontSize(15);
    this.pdf.text(heading, 10, this.jumpAndUsePosition());

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

  write(filename: string): void {
    this.pdf.deletePage(this.pdf.getNumberOfPages());
    const outputFilename = join(
      process.env.GITHUB_WORKSPACE as string,
      filename
    );
    this.pdf.save(outputFilename);
    return;
  }
}
