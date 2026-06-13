import { ourongxing, react } from "@ourongxing/eslint-config"

// 显式标注为 ESLint Linter.Config[], 断开 composer 内部类型推断 (依赖升级后 TS2742 可移植性报错)
/** @type {import("eslint").Linter.Config[]} */
const config = ourongxing({
  type: "app",
  // 貌似不能 ./ 开头，
  ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "**/*.json"],
}).append(react({
  files: ["src/**"],
}))

export default config
