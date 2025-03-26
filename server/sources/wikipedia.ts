import type { NewsItem } from "@shared/types"
import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

interface WikipediaResponse {
  mostread: {
    date: string
    articles: {
      views: number
      rank: number
      title: string
      displaytitle: string
      pageid: number
      extract: string
      extract_html: string
      normalizedtitle: string
      description?: string
      content_urls?: {
        desktop: {
          page: string
        }
        mobile: {
          page: string
        }
      }
    }[]
  }
}

// 删除未使用的函数，解决lint错误
// function stripHtml(html: string): string {
//   if (!html) return ""
//   // 使用更强的正则表达式来匹配并删除所有HTML标签
//   return html.replace(/<[^>]*>/g, "")
// }

export default defineSource(async () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  const url = `https://zh.wikipedia.org/api/rest_v1/feed/featured/${year}/${month}/${day}`
  const data: WikipediaResponse = await myFetch(url)
  const news: NewsItem[] = []

  if (data && data.mostread && data.mostread.articles) {
    // 确保所有文章都被处理，包括第一个
    const articles = data.mostread.articles
    for (let i = 0; i < articles.length; i++) {
      const item = articles[i]
      const articleUrl = item.content_urls?.desktop?.page || `https://zh.wikipedia.org/wiki/${item.title}`
      const cleanTitle = item.title
      const description = item.description ? ` - ${item.description}` : ""
      news.push({
        id: item.pageid.toString(),
        title: cleanTitle,
        url: articleUrl,
        extra: {
          info: `浏览量: ${item.views}${description}`,
        },
      })
    }
  }
  return news
})
