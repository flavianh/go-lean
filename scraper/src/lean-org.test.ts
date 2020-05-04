import * as leanOrgHtml from "./__tests__/assets/lean-org.html";

import { Article, ArticleError, LeanOrgScraper } from "./lean-org";

import mockAxios from "jest-mock-axios";

describe("LeanOrgScraper", () => {
  describe("scrapArticle", () => {
    const url = new URL(
      "https://www.lean.org/leanpost/Posting.cfm?LeanPostId=944"
    );
    describe("should successfully", () => {
      let leanOrgArticle: Article;

      beforeAll(async () => {
        const leanOrgScraper = new LeanOrgScraper();
        const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
        mockAxios.mockResponse({ data: leanOrgHtml });
        leanOrgArticle = await leanOrgArticlePromise;
      });

      test("parse title", () => {
        expect(leanOrgArticle.title).toBe("TPS, the Thinking People System");
      });
      test("return URL", () => {
        expect(leanOrgArticle.originalURL).toBe(url.toString());
      });
      test("parse author full name", () => {
        expect(leanOrgArticle.author.fullName).toBe("Michael Ballé");
      });
      test("parse author URL", () => {
        expect(leanOrgArticle.author.originalURL).toBe(
          "https://www.lean.org/WhoWeAre/LeanPerson.cfm?LeanPersonId=134"
        );
      });
    });

    it("should throw an ArticleError with a reason 'URLBroken' if axios responds with status code less than not 200", async () => {
      const leanOrgScraper = new LeanOrgScraper();
      const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
      mockAxios.mockResponse({ status: 499, data: "" });
      try {
        await leanOrgArticlePromise;
      } catch (error) {
        expect(error instanceof ArticleError).toBeTruthy();
        expect(error.url).toEqual(url);
        expect(error.reasons).toEqual(["URLBroken"]);
      }
    });
    it("should throw an ArticleError with a reason 'MissingTitle' if title is missing", async () => {
      const leanOrgScraper = new LeanOrgScraper();
      const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
      mockAxios.mockResponse({ data: "" });
      try {
        await leanOrgArticlePromise;
      } catch (error) {
        expect(error instanceof ArticleError).toBeTruthy();
        expect(error.url).toEqual(url);
        expect(error.reasons).toContain("MissingTitle");
      }
    });
    it("should throw an ArticleError with a reason 'MissingAuthorFullname' if author info is missing", async () => {
      const leanOrgScraper = new LeanOrgScraper();
      const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
      mockAxios.mockResponse({ data: "" });
      try {
        await leanOrgArticlePromise;
      } catch (error) {
        expect(error instanceof ArticleError).toBeTruthy();
        expect(error.url).toEqual(url);
        expect(error.reasons).toContain("MissingAuthorFullname");
      }
    });
    it("should throw an ArticleError with a reason 'MissingAuthorURL' if author info is missing", async () => {
      const leanOrgScraper = new LeanOrgScraper();
      const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
      mockAxios.mockResponse({ data: "" });
      try {
        await leanOrgArticlePromise;
      } catch (error) {
        expect(error instanceof ArticleError).toBeTruthy();
        expect(error.url).toEqual(url);
        expect(error.reasons).toContain("MissingAuthorURL");
      }
    });
  });
});
