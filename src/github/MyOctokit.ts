import { Octokit } from "@octokit/action";

export class MyOctokit extends Octokit {
  constructor() {
    super({
      baseUrl: process.env.GITHUB_URL ?? "https://api.github.com",
    });
  }
}
