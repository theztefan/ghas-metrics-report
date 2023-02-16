import { Octokit } from "@octokit/action";

export class MyOctokit extends Octokit {
  constructor() {
    super({
      baseUrl: "https://api.github.com",
    });
  }
}
