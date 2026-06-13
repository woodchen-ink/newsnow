import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://kaopu.news"
  const html = await myFetch<string>(baseURL, {
    responseType: "text" as any,
  })
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  const seen = new Set<string>()

  $("article").each((_, el) => {
    const $el = $(el)
    const href = $el.find("a[href^=\"/story/\"]").first().attr("href")
    const title = $el.find("h2").first().text().trim()
    const description = $el.find("p").first().text().trim()
    const date = $el.find(".story-meta span").first().text().trim()
    const source = $el.find(".story-provenance").first().text().trim()
    if (!href || !title || seen.has(href)) return
    seen.add(href)

    news.push({
      id: href,
      title,
      pubDate: date ? parseRelativeDate(date, "Asia/Shanghai").valueOf() : undefined,
      extra: {
        hover: description,
        info: source,
      },
      url: new URL(href, baseURL).toString(),
    })
  })

  return news
})
