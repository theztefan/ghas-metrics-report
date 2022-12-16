import * as core from "@actions/core";
import { writeFileSync } from "fs";
import { join } from "path";

export const syncWriteFile = (filename: string, data: any): void => {
  writeFileSync(filename, data, {
    flag: "w",
  });
  core.debug(`[📝] File ${filename} written`);
  return;
};
