# NewsNow

<a href="https://hellogithub.com/repository/c2978695e74a423189e9ca2543ab3b36" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=c2978695e74a423189e9ca2543ab3b36&claim_uid=SMJiFwlsKCkWf89&theme=small" alt="Featured｜HelloGitHub" /></a>

![](screenshots/preview-1.png)

![](screenshots/preview-2.png)

[English](./README.md) | 简体中文 | [日本語](README.ja-JP.md)

***优雅地阅读实时热门新闻***

## 特性
- 优雅的设计，优雅的阅读体验，时刻关注最新最热的新闻。
- 支持 Github 登录，支持数据同步。
- 默认 30 分钟缓存，登录用户可以强制拉取最新数据。但也会根据内容源的更新间隔设置不同的爬虫间隔时间（最快两分钟），节约资源的同时避免频繁爬取而导致 IP 封禁。

## 部署

如果不需要登录，缓存，可以直接部署到 Cloudflare Pages，Vercel 等。Fork 之后在对应平台上导入即可。

Cloudflare Pages 需要填入构建命令 `pnpm run build`, 构建输出文件夹 `dist/output/public`。

登录现在支持CZL Connect和Github Oauth两种方式：

### CZL Connect登录（推荐）
到CZL Connect平台申请一个应用，设置回调URL为 `https://your-domain.com/api/oauth/czl`。
获取到Client ID和Client Secret后，将其填入环境变量。

### Github Oauth登录（可选）
只需要 [创建一个 Github App](https://github.com/settings/applications/new) 即可，不需要申请任何权限。Callback URL 为 `https://your-domain.com/api/oauth/github`。

然后就会得到 Client ID 和 Client Secret。关于环境变量，不同平台有不同的填写位置，请关注 `example.env.server` 文件。如果本地运行，需要将其重命名为 `.env.server`，然后按照要求添加。

```env
# CZL Connect OAuth (推荐)
CZL_CLIENT_ID=
CZL_CLIENT_SECRET=
CZL_REDIRECT_URI=https://your-domain.com/api/oauth/czl

# Github OAuth (可选)
G_CLIENT_ID=
G_CLIENT_SECRET=

# JWT Secret, 通常可以生成一个随机字符串
JWT_SECRET=
# 初始化数据库, 首次运行必须设置为 true，之后可以将其关闭
INIT_TABLE=true
# 是否启用缓存
ENABLE_CACHE=true
```

### 数据库支持
本项目主推 Cloudflare Pages 以及 Docker 部署， Vercel 需要你自行搞定数据库，其他支持的数据库可以查看 https://db0.unjs.io/connectors 。

1. 在 Cloudflare Worker 控制面板创建 D1 数据库
2. 在 `wrangler.toml` 中配置 `database_id` 和 `database_name`
3. 若无 `wrangler.toml` ，可将 `example.wrangler.toml` 重命名并修改配置
4. 重新部署生效

### Docker 部署
对于 Docker 部署，只需要项目根目录 `docker-compose.yaml` 文件，同一目录下执行
```
docker compose up
```
同样可以通过 `docker-compose.yaml` 配置环境变量。

## 开发
> [!Note]
> 需要 Node.js >= 20

```bash
corepack enable
pnpm i
pnpm dev
```

你可能想要添加数据源，请关注 `shared/sources` `server/sources`，项目类型完备，结构简单，请自行探索。

## 路线图
- 添加 **多语言支持**（英语、中文，更多语言即将推出）
- 改进 **个性化选项**（基于分类的新闻、保存的偏好设置）
- 扩展 **数据源** 以涵盖多种语言的全球新闻

## 贡献指南
欢迎贡献代码！您可以提交 pull request 或创建 issue 来提出功能请求和报告 bug

## License

[MIT](./LICENSE) © ourongxing

## 赞赏
如果本项目对你有所帮助，可以给小猫买点零食。如果需要定制或者其他帮助，请通过下列方式联系备注。

![](./screenshots/reward.gif)
