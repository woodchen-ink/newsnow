import process from "node:process"
import { SignJWT } from "jose"
import { UserTable } from "#/database/user"

export default defineEventHandler(async (event) => {
  // 添加调试信息
  console.log("CZL Connect OAuth 回调被访问")

  try {
    const code = getQuery(event).code
    console.log("获取到授权码:", code)

    if (!code) {
      console.error("未获取到授权码")
      throw createError({
        statusCode: 400,
        message: "Missing authorization code",
      })
    }

    const db = useDatabase()
    const userTable = db ? new UserTable(db) : undefined
    if (!userTable) throw new Error("db is not defined")
    if (process.env.INIT_TABLE !== "false") await userTable.init()

    // 确认环境变量存在
    if (!process.env.CZL_CLIENT_ID || !process.env.CZL_CLIENT_SECRET || !process.env.CZL_REDIRECT_URI) {
      console.error("缺少必要的环境变量")
      throw createError({
        statusCode: 500,
        message: "Missing required environment variables",
      })
    }

    console.log("请求访问令牌...")
    // 构建表单数据，使用x-www-form-urlencoded格式
    const formData = new URLSearchParams()
    formData.append("client_id", process.env.CZL_CLIENT_ID)
    formData.append("client_secret", process.env.CZL_CLIENT_SECRET)
    formData.append("code", code.toString())
    formData.append("grant_type", "authorization_code")
    formData.append("redirect_uri", process.env.CZL_REDIRECT_URI)

    // 第一种方式：使用fetch原生API
    try {
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
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const tokenResponse = await response.json()

      if (!tokenResponse || !tokenResponse.access_token) {
        console.error("访问令牌响应无效:", tokenResponse)
        throw createError({
          statusCode: 400,
          message: "Invalid token response",
        })
      }

      console.log("获取到访问令牌:", !!tokenResponse.access_token)

      // 获取用户信息
      console.log("请求用户信息...")
      const userInfoResponse = await fetch("https://connect.czl.net/api/oauth2/userinfo", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${tokenResponse.access_token}`,
          "User-Agent": "NewsNow App",
        },
      })

      if (!userInfoResponse.ok) {
        throw new Error(`HTTP error! Status: ${userInfoResponse.status}`)
      }

      interface CZLUserInfo {
        id: string
        email: string
        avatar?: string
        avatar_url?: string
        username?: string
        name?: string
      }

      const userInfo = await userInfoResponse.json() as CZLUserInfo

      if (!userInfo || !userInfo.id) {
        console.error("用户信息响应无效:", userInfo)
        throw createError({
          statusCode: 400,
          message: "Invalid user info response",
        })
      }

      console.log("获取到用户信息:", !!userInfo.id)

      const userID = userInfo.id
      await userTable.addUser(userID, userInfo.email, "czl")

      const jwtToken = await new SignJWT({
        id: userID,
        type: "czl",
      })
        .setExpirationTime("60d")
        .setProtectedHeader({ alg: "HS256" })
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

      // 返回登录参数
      const params = new URLSearchParams({
        login: "czl",
        jwt: jwtToken,
        user: JSON.stringify({
          avatar: userInfo.avatar || userInfo.avatar_url,
          name: userInfo.username || userInfo.name,
        }),
      })
      return sendRedirect(event, `/?${params.toString()}`)
    } catch (fetchError) {
      console.error("使用fetch失败:", fetchError)

      // 第二种方式：退回到使用myFetch
      try {
        console.log("尝试使用myFetch...")
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

        if (!tokenResponse || !tokenResponse.access_token) {
          console.error("访问令牌响应无效:", tokenResponse)
          throw createError({
            statusCode: 400,
            message: "Invalid token response",
          })
        }

        console.log("获取到访问令牌:", !!tokenResponse.access_token)

        // 获取用户信息
        console.log("请求用户信息...")
        const userInfo = await myFetch(`https://connect.czl.net/api/oauth2/userinfo`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${tokenResponse.access_token}`,
            "User-Agent": "NewsNow App",
          },
        }) as CZLUserInfo

        if (!userInfo || !userInfo.id) {
          console.error("用户信息响应无效:", userInfo)
          throw createError({
            statusCode: 400,
            message: "Invalid user info response",
          })
        }

        console.log("获取到用户信息:", !!userInfo.id)

        const userID = userInfo.id
        await userTable.addUser(userID, userInfo.email, "czl")

        const jwtToken = await new SignJWT({
          id: userID,
          type: "czl",
        })
          .setExpirationTime("60d")
          .setProtectedHeader({ alg: "HS256" })
          .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

        // 返回登录参数
        const params = new URLSearchParams({
          login: "czl",
          jwt: jwtToken,
          user: JSON.stringify({
            avatar: userInfo.avatar || userInfo.avatar_url,
            name: userInfo.username || userInfo.name,
          }),
        })
        return sendRedirect(event, `/?${params.toString()}`)
      } catch (myFetchError) {
        console.error("使用myFetch也失败:", myFetchError)
        throw createError({
          statusCode: 400,
          message: "Failed to exchange authorization code for access token after multiple attempts",
        })
      }
    }
  } catch (error: any) {
    // 处理错误
    console.error("CZL Connect 登录过程中出错:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "OAuth 流程出错",
    })
  }
})
