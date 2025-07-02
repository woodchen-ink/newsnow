import { XMLParser } from "fast-xml-parser"

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description: string
  category: string
}

interface RSSFeed {
  rss: {
    channel: {
      item: RSSItem[]
    }
  }
}

const latest = defineSource(async () => {
  const url = "https://exp.czl.net/feed"
  const response = await fetch(url)
  const xmlText = await response.text()
  const parser = new XMLParser()
  const result: RSSFeed = parser.parse(xmlText)

  return result.rss.channel.item.map((item) => {
    return {
      id: item.link.split("/").pop()?.replace(".html", "") || "",
      title: item.title,
      url: item.link,
      description: item.description.replace(/<[^>]*>/g, "").trim(),
      category: item.category,
      pubDate: new Date(item.pubDate).valueOf(),
    }
  })
})

export default defineSource({
  "czlexpress-latest": latest,
})
