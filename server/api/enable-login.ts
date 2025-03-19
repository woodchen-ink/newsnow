import process from "node:process"

export default defineEventHandler(async () => {
  // 构造OAuth授权URL
  const authURL = new URL("https://connect.czl.net/oauth2/authorize")
  authURL.searchParams.append("client_id", process.env.CZL_CLIENT_ID || "")
  authURL.searchParams.append("response_type", "code")
  authURL.searchParams.append("redirect_uri", process.env.CZL_REDIRECT_URI || "")
  authURL.searchParams.append("scope", "openid profile email")

  return {
    enable: true,
    url: authURL.toString(),
  }
})
