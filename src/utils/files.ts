import * as core from "@actions/core";
import { writeFileSync } from "fs";
import { join } from "path";

export const syncWriteFile = (filename: string, data: any): void => {
  const outputFilename = join(__dirname, filename);
  writeFileSync(outputFilename, data, {
    flag: "w",
  });
  core.debug(`[📝] File ${outputFilename} written`);
  return;
};
