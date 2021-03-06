import { JSDOM } from "jsdom";
import axios from "axios";

type ArticleErrorReason =
  | "MissingTitle"
  | "MissingAuthorFullname"
  | "MissingAuthorURL"
  | "URLBroken";

export class ArticleError extends Error {
  readonly url?: URL;
  readonly reasons?: ArticleErrorReason[];
  constructor(url?: URL, reasons?: ArticleErrorReason[]) {
    super();
    this.reasons = reasons;
    this.url = url;
  }
}

class ArticleMeta {
  readonly description: string;
}
export class Article {
  readonly meta: ArticleMeta;
  readonly title: string;
  readonly authors: Author[];
  readonly originalURL: string;

  static build = (
    url: URL,
    meta: ArticleMeta,
    title: string | undefined,
    authorFullname: string | undefined,
    authorOriginalURL: string | undefined
  ): Article => {
    const errorReasons: ArticleErrorReason[] = [];
    if (null == title) {
      errorReasons.push("MissingTitle");
    }
    if (null == authorFullname) {
      errorReasons.push("MissingAuthorFullname");
    }
    if (null == authorOriginalURL) {
      errorReasons.push("MissingAuthorURL");
    }
    if (errorReasons.length > 0) {
      throw new ArticleError(url, errorReasons);
    }

    const rebasedAuthorURL = new URL(
      authorOriginalURL as string,
      url
    ).toString();
    return {
      originalURL: url.toString(),
      meta,
      title: title as string,
      authors: [
        {
          fullName: authorFullname as string,
          originalURL: rebasedAuthorURL,
        },
      ],
    };
  };
}

class Author {
  readonly fullName: string;
  readonly originalURL: string;
}

interface Scraper {
  scrapArticle(url: URL): Promise<Article>;
}

export class LeanOrgScraper implements Scraper {
  scrapArticle = async (url: URL): Promise<Article> => {
    const document = await this.getDocument(url);

    const meta = this.scrapArticleMeta(document);

    const postHeader = document.querySelector("div.posthead");
    const title = postHeader?.querySelector("h1")?.textContent?.trim();
    const authorLink:
      | HTMLLinkElement
      | null
      | undefined = postHeader?.querySelector(".itemlinkspost a");
    const authorFullname = authorLink?.textContent?.trim();
    const authorOriginalURL = authorLink?.href;

    return Article.build(url, meta, title, authorFullname, authorOriginalURL);
  };

  scrapArticleMeta(document: Document): ArticleMeta {
    const metaDescription = document
      .querySelector("[property='og:description']")
      ?.getAttribute("content");
    const metaDescriptionContent =
      metaDescription == null ? "" : metaDescription;

    return {
      description: metaDescriptionContent,
    };
  }

  private async getDocument(url: URL): Promise<Document> {
    const { data, status } = await axios.get(url.toString());
    if (status > 200) {
      throw new ArticleError(url, ["URLBroken"]);
    }
    const dom = new JSDOM(data);
    const document = dom.window.document;
    return document;
  }
}
