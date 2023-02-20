import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import { MyOctokit } from "./MyOctokit";
import {
  SecretScanningAlert,
  SecretScanningLocation,
} from "../types/common/main";

export const SecretScanningAlerts = async (
  owner: string,
  repository: string
): Promise<SecretScanningAlert[]> => {
  let res: Array<SecretScanningAlert> = [];
  try {
    const octokit = new MyOctokit();
    const iterator = await octokit.paginate(
      "GET /repos/{owner}/{repo}/secret-scanning/alerts",
      {
        owner: owner,
        repo: repository,
        per_page: 100,
      },
      (response) => {
        return response.data;
      }
    );
    res = iterator as SecretScanningAlert[];

    for (const alert of res) {
      const { data: locationData } = await octokit.request(
        "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations",
        {
          owner: owner,
          repo: repository,
          alert_number: alert.number,
        }
      );
      alert["commitsSha"] = (locationData as SecretScanningLocation[]).map(
        (location) => location.details.commit_sha
      );
    }
  } catch (error) {
    core.setFailed("There was an error. Please check the logs" + error);
  }
  return res;
};
