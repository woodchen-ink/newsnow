import { motion } from "framer-motion"

function ThemeToggle() {
  const { isDark, toggleDark } = useDark()
  return (
    <li onClick={toggleDark} className="cursor-pointer [&_*]:cursor-pointer transition-all">
      <span className={$("inline-block", isDark ? "i-ph-moon-stars-duotone" : "i-ph-sun-dim-duotone")} />
      <span>
        {isDark ? "浅色模式" : "深色模式"}
      </span>
    </li>
  )
}

export function Menu() {
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)
  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <span className="flex items-center scale-90">
        {
          enableLogin && loggedIn && userInfo && userInfo.avatar
            ? (
                <button
                  type="button"
                  className="h-6 w-6 rounded-full bg-cover bg-center border-none overflow-hidden"
                  style={
                    {
                      backgroundImage: `url(${userInfo.avatar})`,
                    }
                  }
                >
                </button>
              )
            : <button type="button" className="btn i-si:more-muted-horiz-circle-duotone" />
        }
      </span>
      {shown && (
        <div className="absolute right-0 z-99 bg-transparent pt-4 top-4">
          <motion.div
            id="dropdown-menu"
            className={$([
              "w-200px",
              "bg-primary backdrop-blur-5 bg-op-70! rounded-lg shadow-xl",
            ])}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
          >
            <ol className="bg-base bg-op-70! backdrop-blur-md p-2 rounded-lg color-base text-base">
              {enableLogin && (loggedIn
                ? (
                    <li onClick={logout}>
                      <span className="i-ph:sign-out-duotone inline-block" />
                      <span>退出登录</span>
                    </li>
                  )
                : (
                    <li onClick={login}>
                      <span className="i-ph:sign-in-duotone inline-block" />
                      <span>CZL Connect 登录</span>
                    </li>
                  ))}
              {!loggedIn && enableLogin && (
                <li className="text-xs op-60 py-1 px-2">
                  <span>CZL Connect是安全的统一账号登录服务</span>
                </li>
              )}
              <ThemeToggle />
              <li onClick={() => window.open("https://www.sunai.net/t/topic/386", "_blank", "noopener,noreferrer")}>
                <span className="i-ph:chat-circle-dots-duotone inline-block" />
                <span>反馈</span>
              </li>
              <li onClick={() => window.open(Homepage)}>
                <span className="i-ph:github-logo-duotone inline-block" />
                <span>Star on Github </span>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
