import { JSDOM } from "jsdom";
import axios from "axios";

type ArticleErrorReason = "MissingTitle" | "MissingAuthorFullname";

export class ArticleError extends Error {
  readonly url?: URL;
  readonly reasons?: ArticleErrorReason[];
  constructor(url?: URL, reasons?: ArticleErrorReason[]) {
    super();
    this.reasons = reasons;
    this.url = url;
  }
}
class Article {
  readonly title: string;
  readonly author: Author;
  readonly originalURL: string;

  static build = (
    url: URL,
    title: string | undefined,
    authorFullname: string | undefined
  ): Article => {
    const errorReasons: ArticleErrorReason[] = [];
    if (null == authorFullname) {
      errorReasons.push("MissingAuthorFullname");
    }
    if (null == title) {
      errorReasons.push("MissingTitle");
    }
    if (errorReasons.length > 0) {
      throw new ArticleError(url, errorReasons);
    }

    return {
      originalURL: url.toString(),
      title: title as string,
      author: { fullName: authorFullname as string },
    };
  };
}

class Author {
  readonly fullName: string;
}

interface Scraper {
  scrapArticle(url: URL): Promise<Article>;
}

export class LeanOrgScraper implements Scraper {
  scrapArticle = async (url: URL): Promise<Article> => {
    const document = await this.getDocument(url);
    const postHeader = document.querySelector("div.posthead");
    const title = postHeader?.querySelector("h1")?.textContent?.trim();
    const authorFullname = postHeader
      ?.querySelector(".itemlinkspost a")
      ?.textContent?.trim();

    return Article.build(url, title, authorFullname);
  };

  private async getDocument(url: URL): Promise<Document> {
    const { data } = await axios.get(url.toString());
    const dom = new JSDOM(data);
    const document = dom.window.document;
    return document;
  }
}
