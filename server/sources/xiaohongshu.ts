import { XMLParser } from "fast-xml-parser"

interface RSSItem {
  title: string
  link: string
  description: string
}

interface RSSFeed {
  rss: {
    channel: {
      item: RSSItem[]
    }
  }
}

const hotlist = defineSource(async () => {
  const url = "https://decemberpei.cyou/rssbox/xiaohongshu-hotlist.xml"
  const response = await fetch(url)
  const xmlText = await response.text()
  const parser = new XMLParser()
  const result: RSSFeed = parser.parse(xmlText)

  return result.rss.channel.item.map((item) => {
    // 从链接中提取搜索关键词作为ID
    const keyword = new URL(item.link).searchParams.get("keyword") || ""
    return {
      id: encodeURIComponent(keyword),
      title: item.title,
      url: item.link,
      description: item.description,
      pubDate: Date.now(), // 使用当前时间，因为RSS没有提供发布时间
    }
  })
})

export default defineSource({
  "xiaohongshu": hotlist,
  "xiaohongshu-hotlist": hotlist,
})
