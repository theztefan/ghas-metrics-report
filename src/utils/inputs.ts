import * as core from "@actions/core";
import {
  inputsReturned,
  ghasFeatures,
  reportFrequency,
  outputFormat,
} from "../types/common/main";
import * as dotenv from "dotenv";
dotenv.config();

export const inputs = async (): Promise<inputsReturned> => {
  try {
    // get the inputs
    const team: string =
      (process.env.TEAM as string) ||
      core.getInput("team", { required: false });
    const repo: string =
      (process.env.REPO as string) ||
      core.getInput("repo", { required: false });
    const org: string =
      (process.env.ORG as string) || core.getInput("org", { required: false });
    const features_string: string =
      (process.env.FEATURES as string) ||
      core.getInput("features", { required: true });
    const features: ghasFeatures[] = features_string
      .replace(/\s/g, "")
      .toLowerCase()
      .split(",", 3) as ghasFeatures[];
    //TODO: Stricter validation. Why are values not in ghasFeatures type union still accepted?
    const frequency: reportFrequency = (process.env.FREQUENCY ||
      core.getInput("frequency", {
        required: true,
      })) as reportFrequency;

    const outputFormatString = core.getInput("output-format", {
      required: true,
    });
    const outputFormat: outputFormat[] = outputFormatString
      .replace(/\s/g, "")
      .toLowerCase()
      .split(",", 3) as outputFormat[];

    core.debug(`The following team was inputted: ${team}`);
    core.debug(`The following repo was inputted: ${repo}`);
    core.debug(`The following org was inputted: ${org}`);
    core.debug(`The following features was inputted: ${features}`);
    core.debug(`The following frequency was inputted: ${frequency}`);
    core.debug(`The following output was inputted: ${outputFormat}`);

    return {
      team,
      repo,
      org,
      features,
      frequency,
      outputFormat,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      core.debug(`${e}`);
      core.setFailed(
        "Error: There was an error getting the inputs. Please check the logs."
      );
      throw new Error(e.message);
    }
  }
};
