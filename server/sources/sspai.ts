import { XMLParser } from "fast-xml-parser"

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description: string
  author: string
}

interface RSSFeed {
  rss: {
    channel: {
      item: RSSItem[]
    }
  }
}

const latest = defineSource(async () => {
  const url = "https://sspai.com/feed"
  const response = await fetch(url)
  const xmlText = await response.text()
  const parser = new XMLParser()
  const result: RSSFeed = parser.parse(xmlText)

  return result.rss.channel.item.map((item) => {
    return {
      id: item.link.split("/").pop() || "",
      title: item.title,
      url: item.link,
      description: item.description.replace(/<[^>]*>/g, "").trim(),
      author: item.author,
      pubDate: new Date(item.pubDate).valueOf(),
    }
  })
})

export default defineSource({
  "sspai-latest": latest,
})
