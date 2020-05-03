import { JSDOM } from "jsdom";
import axios from "axios";

class Article {
  readonly title: string;
}

type Reason = "MissingTitle";

export class ArticleError extends Error {
  readonly url?: URL;
  readonly reasons?: Reason[];
  constructor(url?: URL, reasons?: Reason[]) {
    super();
    this.reasons = reasons;
    this.url = url;
  }
}

interface Scraper {
  scrapArticle(url: URL): Promise<Article>;
}

export class LeanOrgScraper implements Scraper {
  scrapArticle = async (url: URL): Promise<Article> => {
    const document = await this.getDocument(url);
    const postHeader = document.querySelector("div.posthead");
    const title = postHeader?.querySelector("h1")?.textContent?.trim();

    if (null == title) {
      throw new ArticleError(url, ["MissingTitle"]);
    }
    return { title };
  };

  private async getDocument(url: URL): Promise<Document> {
    const { data } = await axios.get(url.toString());
    const dom = new JSDOM(data);
    const document = dom.window.document;
    return document;
  }
}
