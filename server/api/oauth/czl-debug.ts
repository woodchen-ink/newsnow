import process from "node:process"

export default defineEventHandler(async (event) => {
  try {
    // 获取请求参数
    const query = getQuery(event)
    const code = query.code as string

    if (!code) {
      return {
        status: "error",
        message: "请提供授权码",
      }
    }

    // 检查环境变量
    const envCheck = {
      CZL_CLIENT_ID: !!process.env.CZL_CLIENT_ID,
      CZL_CLIENT_SECRET: !!process.env.CZL_CLIENT_SECRET,
      CZL_REDIRECT_URI: !!process.env.CZL_REDIRECT_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
    }

    // 尝试获取访问令牌
    try {
      const tokenResponse = await myFetch(
        `https://connect.czl.net/api/oauth2/token`,
        {
          method: "POST",
          body: {
            client_id: process.env.CZL_CLIENT_ID,
            client_secret: process.env.CZL_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.CZL_REDIRECT_URI,
          },
          headers: {
            accept: "application/json",
          },
        },
      )

      return {
        status: "success",
        env_check: envCheck,
        token_response: {
          got_token: !!tokenResponse.access_token,
          token_type: tokenResponse.token_type,
          scope: tokenResponse.scope,
        },
        redirect_uri: process.env.CZL_REDIRECT_URI,
      }
    } catch (error) {
      return {
        status: "error",
        message: "获取访问令牌失败",
        env_check: envCheck,
        error: typeof error === "object"
          ? Object.getOwnPropertyNames(error).reduce((acc, key) => {
              acc[key] = String(error[key])
              return acc
            }, {})
          : String(error),
      }
    }
  } catch (e) {
    return {
      status: "error",
      message: "调试过程中出错",
      error: String(e),
    }
  }
})
