import * as leanOrgHtml from "./__tests__/assets/lean-org.html";

import { ArticleError, LeanOrgScraper } from "./lean-org";

import mockAxios from "jest-mock-axios";

describe("LeanOrgScraper", () => {
  describe("scrapArticle", () => {
    it("should scrap one article as a LeanOrgArticle", async () => {
      const leanOrgScraper = new LeanOrgScraper();
      const url = new URL(
        "https://www.lean.org/leanpost/Posting.cfm?LeanPostId=944"
      );
      const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
      mockAxios.mockResponse({ data: leanOrgHtml });
      const leanOrgArticle = await leanOrgArticlePromise;
      expect(leanOrgArticle.title).toBe("TPS, the Thinking People System");
    });

    it("should throw an ArticleError with a reason 'MissingTitle' if title is missing", async () => {
      const leanOrgScraper = new LeanOrgScraper();
      const url = new URL(
        "https://www.lean.org/leanpost/Posting.cfm?LeanPostId=944"
      );
      const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
      mockAxios.mockResponse({ data: "" });
      try {
        await leanOrgArticlePromise;
      } catch (error) {
        expect(error instanceof ArticleError).toBeTruthy();
        expect(error.url).toEqual(url);
        expect(error.reasons).toEqual(["MissingTitle"]);
      }
    });
  });
});
