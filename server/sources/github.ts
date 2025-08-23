import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const createTrendingSource = (language?: string) => defineSource(async () => {
  const baseURL = "https://github.com"
  const languageParam = language ? `?language=${language}&spoken_language_code=` : "?spoken_language_code="
  const html: any = await myFetch(`https://github.com/trending${languageParam}`)
  const $ = cheerio.load(html)
  const $main = $("main .Box div[data-hpc] > article")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el).find(">h2 a")
    const title = a.text().replace(/\n+/g, "").trim()
    const url = a.attr("href")
    const star = $(el).find("[href$=stargazers]").text().replace(/\s+/g, "").trim()
    const desc = $(el).find(">p").text().replace(/\n+/g, "").trim()
    const langSpan = $(el).find("[itemprop=programmingLanguage]")
    const langName = langSpan.text().trim()
    if (url && title) {
      news.push({
        url: `${baseURL}${url}`,
        title,
        id: url,
        extra: {
          info: `✰ ${star}${langName ? ` · ${langName}` : ""}`,
          hover: desc,
        },
      })
    }
  })
  return news
})

const trending = createTrendingSource()
const trendingGo = createTrendingSource("go")
const trendingRust = createTrendingSource("rust")
const trendingTypeScript = createTrendingSource("typescript")
const trendingPHP = createTrendingSource("php")

export default defineSource({
  "github": trending,
  "github-trending-today": trending,
  "github-go": trendingGo,
  "github-rust": trendingRust,
  "github-typescript": trendingTypeScript,
  "github-php": trendingPHP,
})
