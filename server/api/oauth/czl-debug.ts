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
      CZL_CLIENT_ID_VALUE: process.env.CZL_CLIENT_ID ? `${process.env.CZL_CLIENT_ID.substring(0, 5)}...` : null,
      CZL_CLIENT_SECRET: !!process.env.CZL_CLIENT_SECRET,
      CZL_CLIENT_SECRET_LENGTH: process.env.CZL_CLIENT_SECRET?.length || 0,
      CZL_REDIRECT_URI: !!process.env.CZL_REDIRECT_URI,
      CZL_REDIRECT_URI_VALUE: process.env.CZL_REDIRECT_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
    }

    // 构建表单数据
    const formData = new URLSearchParams()
    formData.append("client_id", process.env.CZL_CLIENT_ID || "")
    formData.append("client_secret", process.env.CZL_CLIENT_SECRET || "")
    formData.append("code", code)
    formData.append("grant_type", "authorization_code")
    formData.append("redirect_uri", process.env.CZL_REDIRECT_URI || "")

    console.log("尝试获取访问令牌...")
    console.log("请求参数:", {
      client_id_length: process.env.CZL_CLIENT_ID?.length,
      client_secret_length: process.env.CZL_CLIENT_SECRET?.length,
      code_length: code?.length,
      redirect_uri: process.env.CZL_REDIRECT_URI,
    })

    // 尝试使用fetch原生API
    try {
      console.log("使用fetch原生API...")
      const response = await fetch("https://connect.czl.net/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": "NewsNow App",
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`)
      }

      const tokenResponse = await response.json()

      return {
        status: "success",
        method: "fetch",
        env_check: envCheck,
        token_response: {
          got_token: !!tokenResponse.access_token,
          token_type: tokenResponse.token_type,
          scope: tokenResponse.scope,
          raw: JSON.stringify(tokenResponse),
        },
        redirect_uri: process.env.CZL_REDIRECT_URI,
      }
    } catch (fetchError: any) {
      console.error("使用fetch失败:", fetchError)

      // 尝试使用myFetch
      try {
        console.log("使用myFetch...")
        const tokenResponse = await myFetch(
          `https://connect.czl.net/api/oauth2/token`,
          {
            method: "POST",
            body: Object.fromEntries(formData),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json",
            },
          },
        )

        return {
          status: "success",
          method: "myFetch",
          env_check: envCheck,
          token_response: {
            got_token: !!tokenResponse.access_token,
            token_type: tokenResponse.token_type,
            scope: tokenResponse.scope,
            raw: JSON.stringify(tokenResponse),
          },
          redirect_uri: process.env.CZL_REDIRECT_URI,
        }
      } catch (myFetchError: any) {
        return {
          status: "error",
          message: "获取访问令牌失败 (所有方法)",
          fetch_error: {
            message: fetchError.message,
            stack: fetchError.stack,
          },
          myfetch_error: {
            message: myFetchError.message,
            stack: myFetchError.stack,
            data: myFetchError.data,
            statusCode: myFetchError.statusCode,
          },
          env_check: envCheck,
        }
      }
    }
  } catch (e: any) {
    return {
      status: "error",
      message: "调试过程中出错",
      error: String(e),
      errorObj: {
        message: e?.message,
        stack: e?.stack,
      },
    }
  }
})
