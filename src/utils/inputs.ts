import * as core from "@actions/core";
import {
  inputsReturned,
  ghasFeatures,
  reportFrequency,
  outputFormat,
} from "../types/common/main";

export const inputs = async (): Promise<inputsReturned> => {
  try {
    // get the inputs
    const repo = core.getInput("repo", { required: true });
    const org = core.getInput("org", { required: true });
    const featuresString = core.getInput("features", { required: true });
    const features: ghasFeatures[] = featuresString
      .replace(/\s/g, "")
      .toLowerCase()
      .split(",", 3) as ghasFeatures[];
    //TODO: Stricter validation. Why are values not in ghasFeatures type union still accepted?
    const frequency = core.getInput("frequency", {
      required: true,
    }) as reportFrequency;
    const outputFormatString = core.getInput("output-format", {
      required: true,
    });
    const outputFormat: outputFormat[] = outputFormatString
      .replace(/\s/g, "")
      .toLowerCase()
      .split(",", 3) as outputFormat[];

    core.debug(`The following repo was inputted: ${repo}`);
    core.debug(`The following org was inputted: ${org}`);
    core.debug(`The following features was inputted: ${features}`);
    core.debug(`The following frequency was inputted: ${frequency}`);
    core.debug(`The following output was inputted: ${outputFormat}`);

    return {
      repo,
      org,
      features,
      frequency,
      outputFormat,
    };
  } catch (e: any) {
    core.debug(`${e}`);
    core.setFailed(
      "Error: There was an error getting the inputs. Please check the logs."
    );
    throw new Error(e.message);
  }
};
