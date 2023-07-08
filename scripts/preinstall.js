if(!/pnpm/.test(process.env.npm_execpath || "")){
  console.log("\x1b[43m%s\x1b[0m", "************请使用pnpm运行************");
  process.exit(1)
}
// 安装全局依赖 pnpm i react -w
// 安装单个项目依赖 pnpm i antd -r --filter 项目名
// 本地共享库安装到主项目 pnpm i 共享库名称 -r --filter 主项目名称