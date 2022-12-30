export interface Report {
  prepare(): void;
  addHeader(title: string): void;
  addSection(
    name: string,
    heading: string,
    list: string[],
    tableHeaders: string[],
    tableBody: unknown[]
  ): void;
  write(): void;
}
