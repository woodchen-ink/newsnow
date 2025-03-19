# NewsNow
<a href="https://hellogithub.com/repository/c2978695e74a423189e9ca2543ab3b36" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=c2978695e74a423189e9ca2543ab3b36&claim_uid=SMJiFwlsKCkWf89&theme=small" alt="Featured｜HelloGitHub" /></a>

![](screenshots/preview-1.png)

![](screenshots/preview-2.png)

English | [简体中文](README.zh-CN.md)

***Elegant reading of real-time and hottest news***

## Features
- Elegant design for a pleasant reading experience, keeping you up-to-date with the latest and hottest news.
- Supports Github login and data synchronization.
- Default cache duration is 30 minutes. Logged-in users can force fetch the latest data. However, the scraping interval is adjusted based on the update frequency of the content sources (as fast as every two minutes) to save resources and prevent frequent scraping that could lead to IP bans.

## Deployment

If login and caching are not required, you can directly deploy to platforms like Cloudflare Pages or Vercel. Just fork the repository and import it into the respective platform.

For Cloudflare Pages, you need to set the build command to `pnpm run build` and the build output directory to `dist/output/public`.

The login now supports two methods: CZL Connect and Github OAuth:

### CZL Connect Login (Recommended)
Apply for an application on the CZL Connect platform, set the callback URL to `https://your-domain.com/api/oauth/czl`.
After obtaining the Client ID and Client Secret, fill them in the environment variables.

### Github OAuth Login (Optional)
Simply [create a Github App](https://github.com/settings/applications/new) without any permission requests. Set the Callback URL to `https://your-domain.com/api/oauth/github`.

After creating the app, you will get a Client ID and Client Secret. Different platforms have different places to set environment variables; refer to the `example.env.server` file. If running locally, rename it to `.env.server` and add the necessary values.

```env
# CZL Connect OAuth (Recommended)
CZL_CLIENT_ID=
CZL_CLIENT_SECRET=
CZL_REDIRECT_URI=https://your-domain.com/api/oauth/czl

# Github OAuth (Optional)
G_CLIENT_ID=
G_CLIENT_SECRET=

# JWT Secret, can be a random string
JWT_SECRET=
# Initialize database, must be true for first run, can be disabled later
INIT_TABLE=true
# Enable caching
ENABLE_CACHE=true
```

This project primarily supports deployment on Cloudflare Pages and Docker. For Vercel, you need to set up your own database. Supported databases can be found at https://db0.unjs.io/connectors .

The Cloudflare D1 database can be used for free. To set it up, go to the Cloudflare Worker control panel and manually create a D1 database. Then, add the `database_id` and `database_name` to the corresponding fields in your `wrangler.toml` file.

If you don't have a `wrangler.toml` file, you can rename `example.wrangler.toml` to `wrangler.toml` and modify it with your configuration. The changes will take effect on your next deployment.

For Docker deployment. In the project root directory with `docker-compose.yml`, run

```sh
docker compose up
```

## Development

> [!TIP]
> Node version >= 20

```sh
corepack enable
pnpm i
pnpm dev
```

If you want to add data sources, refer to the `shared/sources`, and `server/sources` directories. The project has complete types and a simple structure; feel free to explore.

## License

[MIT](./LICENSE) © ourongxing
