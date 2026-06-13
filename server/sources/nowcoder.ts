interface Res {
  data: {
    result: {
      id: string
      title: string
      type: number
      uuid: string
    }[]
  }
}

export default defineSource(async () => {
  const timestamp = Date.now()
  const url = `https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=20&_=${timestamp}&t=`
  const res: Res = await myFetch(url)
  return res.data.result
    // 仅保留能构造出有效详情链接的条目 (type 74 为动态, 0 为讨论帖), 其余类型无对应 url 直接丢弃
    .map((k) => {
      if (k.type === 74) {
        return { id: k.uuid, title: k.title, url: `https://www.nowcoder.com/feed/main/detail/${k.uuid}` }
      } else if (k.type === 0) {
        return { id: k.id, title: k.title, url: `https://www.nowcoder.com/discuss/${k.id}` }
      }
      return null
    })
    .filter((k): k is NonNullable<typeof k> => k !== null)
})
