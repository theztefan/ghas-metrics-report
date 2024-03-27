import { Octokit } from "@octokit/action";
import { Endpoints } from "@octokit/types";
import { MyOctokit } from "./MyOctokit";

export const getRepositoriesForOrg = async (
  org: string,
): Promise<Endpoints["GET /orgs/{org}/repos"]["response"]["data"]> => {
  const octokit = new MyOctokit();

  const repos: Endpoints["GET /orgs/{org}/repos"]["response"]["data"] =
    await octokit.paginate(`GET /orgs/${org}/repos`, {
      per_page: 100,
    });

  return repos;
};

export const getRepositoriesForTeamAsAdmin = async (
  org: string,
  teamSlug: string,
): Promise<Endpoints["GET /teams/{team_id}/repos"]["response"]["data"]> => {
  const octokit = new MyOctokit();

  //get team id from slug
  const team: Endpoints["GET /orgs/{org}/teams/{team_slug}"]["response"] =
    await octokit.rest.teams.getByName({
      org: org,
      team_slug: teamSlug,
    });

  const repos: Endpoints["GET /teams/{team_id}/repos"]["response"]["data"] =
    await octokit.paginate(`GET /teams/${team.data.id}/repos`, {
      per_page: 100,
    });

  return repos.filter((repo) => repo.permissions?.admin);
};

export const getRepository = async (
  owner: string,
  repo: string,
): Promise<Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"]> => {
  const octokit = new MyOctokit();

  const response: Endpoints["GET /repos/{owner}/{repo}"]["response"] =
    await octokit.rest.repos.get({
      owner: owner,
      repo: repo,
    });

  return response.data;
};
