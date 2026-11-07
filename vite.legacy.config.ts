import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

/**
 * 旧版（v3.20.4）前端的构建配置。
 *
 * `--mode web` 时把 @tauri-apps/* 换成 web/transport 下的 shim，同一份 src-legacy
 * 代码即可在浏览器里跑；桌面模式只把 `@tauri-apps/api/core` 换成同一个适配层
 * （invoke 仍走上游 IPC，只补旧前端的响应契约），其余包保持原生。
 * src-legacy 保持与 v3.20.4 逐字节一致，所有适配都发生在这里和 shim 里。
 */
const API_ORIGIN = process.env.CC_API_ORIGIN ?? "http://127.0.0.1:14515";

const SHIM_DIR = path.resolve(__dirname, "web/transport").replace(/\\/g, "/");
const I18N_DIR = path.resolve(__dirname, "web/i18n").replace(/\\/g, "/");

const LOCALE_CODES = ["en", "ja", "zh", "zh-TW"];

/** 旧前端的 locale JSON 在 web/i18n 下加了一层覆盖，src-legacy 不动。 */
const I18N_OVERRIDES = LOCALE_CODES.map((code) => ({
  find: new RegExp(`^\\./locales/${code}\\.json$`),
  replacement: `${I18N_DIR}/${code}.ts`,
}));

const SHIMS: Record<string, string> = {
  "@tauri-apps/api/core": "core.ts",
  "@tauri-apps/api/event": "event.ts",
  "@tauri-apps/api/window": "window.ts",
  "@tauri-apps/api/app": "app.ts",
  "@tauri-apps/api/path": "path.ts",
  "@tauri-apps/plugin-dialog": "plugin-dialog.ts",
  "@tauri-apps/plugin-log": "plugin-log.ts",
  "@tauri-apps/plugin-process": "plugin-process.ts",
  "@tauri-apps/plugin-updater": "plugin-updater.ts",
};

export default defineConfig(({ mode }) => {
  const webTransport = mode === "web" || process.env.CC_UI_TRANSPORT === "web";
  const webAliases = Object.entries(SHIMS).map(([specifier, file]) => ({
    find: new RegExp(`^${specifier.replace(/\./g, "\\.")}$`),
    replacement: `${SHIM_DIR}/${file}`,
  }));

  return {
    root: "src-legacy",
    plugins: [react()],
    base: "./",
    build: {
      outDir: "../dist-legacy",
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, "src-legacy/index.html"),
      },
    },
    css: {
      // 必须内联：`css.postcss` 传字符串时 vite 当作"去这个目录找配置"，不是文件路径，
      // 结果会退回根目录 postcss.config.cjs → tailwind 扫的是 ./src/**（新 UI），
      // 旧 UI 独有的工具类（bg-orange-500、data-[state=unchecked]:bg-gray-200 …）全部不生成。
      postcss: {
        plugins: [
          tailwindcss({
            config: path.resolve(__dirname, "tailwind.legacy.config.cjs"),
          }),
          autoprefixer(),
        ],
      },
    },
    server: {
      port: 3001,
      strictPort: true,
      proxy: webTransport
        ? {
            "/api": {
              target: API_ORIGIN,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    resolve: {
      alias: [
        ...I18N_OVERRIDES,
        {
          find: /^@\//,
          replacement: `${path.resolve(__dirname, "src-legacy").replace(/\\/g, "/")}/`,
        },
        ...(webTransport
          ? webAliases
          : [
              {
                find: /^@tauri-apps\/api\/core$/,
                replacement: `${SHIM_DIR}/desktop-core.ts`,
              },
            ]),
      ],
    },
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
  };
});
