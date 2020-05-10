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
      test("parse meta description", () => {
        expect(leanOrgArticle.meta.description).toBe(
          "The twin pillars of just-in-time and jidoka help support a full model about how to achieve customer satisfaction from employee satisfaction, through teamwork and respect, on a basis of mutual trust between management and employees."
        );
      });
      test("return URL", () => {
        expect(leanOrgArticle.originalURL).toBe(url.toString());
      });
      test("parse author full name and originalUrl", () => {
        expect(leanOrgArticle.authors).toStrictEqual([
          {
            fullName: "Michael Ballé",
            originalURL:
              "https://www.lean.org/WhoWeAre/LeanPerson.cfm?LeanPersonId=134",
          },
        ]);
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

    ["MissingTitle", "MissingAuthorFullname", "MissingAuthorURL"].forEach(
      (reason) => {
        it(`should throw an ArticleError with a reason '${reason}' if title is missing`, async () => {
          const leanOrgScraper = new LeanOrgScraper();
          const leanOrgArticlePromise = leanOrgScraper.scrapArticle(url);
          mockAxios.mockResponse({ data: "" });
          try {
            await leanOrgArticlePromise;
          } catch (error) {
            expect(error instanceof ArticleError).toBeTruthy();
            expect(error.url).toEqual(url);
            expect(error.reasons).toContain(reason);
          }
        });
      }
    );
  });
});
