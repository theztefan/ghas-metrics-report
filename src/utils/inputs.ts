//import { load } from "js-yaml";
import { constants, readFileSync, existsSync, openSync } from "node:fs";
import * as core from "@actions/core";

function updatePath(cardPath: string, path: string) {
  const [, prefix] = path.split("/");
  return (cardPath = `./${prefix}` + cardPath.replace(".", ""));
}

export const inputs = async (): Promise<void> => {
};
