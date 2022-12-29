import { writeFileSync } from "fs";
import { join } from "path";

export class JSONReport {
  static write(filename: string, data: string): void {
    const outputFilename = join(
      process.env.GITHUB_WORKSPACE as string,
      filename
    );
    writeFileSync(outputFilename, data, {
      flag: "w",
    });
    return;
  }
}
