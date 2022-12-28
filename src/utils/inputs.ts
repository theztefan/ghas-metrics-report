import * as core from "@actions/core";
import {
  inputsReturned,
  ghasFeatures,
  reportFrequency,
} from "../types/common/main";

export const inputs = async (): Promise<inputsReturned> => {
  try {
    // get the inputs
    const repo = core.getInput("repo", { required: true });
    const org = core.getInput("org", { required: true });
    const features_string = core.getInput("features", { required: true });
    const features: ghasFeatures[] = features_string
      .replace(/\s/g, "")
      .toLowerCase()
      .split(",", 3) as ghasFeatures[];
    //TODO: Stricter validation. Why are values not in ghasFeatures type union still accepted?
    const frequency = core.getInput("frequency", {
      required: true,
    }) as reportFrequency;

    core.debug(`The following repo was inputted: ${repo}`);
    core.debug(`The following org was inputted: ${org}`);
    core.debug(`The following features was inputted: ${features}`);
    core.debug(`The following frequency was inputted: ${frequency}`);

    return {
      repo,
      org,
      features,
      frequency,
    };
  } catch (e: any) {
    core.debug(`${e}`);
    core.setFailed(
      "Error: There was an error getting the inputs. Please check the logs."
    );
    throw new Error(e.message);
  }
};
