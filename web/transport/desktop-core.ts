// 桌面 legacy 构建里 `@tauri-apps/api/core` 的替身：invoke 仍走上游实现，只把旧前端
// （v3.20.4 冻结，只会读 v3 的响应形状）缺的字段补回来，适配表与 web 版共用
// result-adapt.ts。这条 alias 对插件包同样生效，所以 core 的导出要一并转发。
//
// 真实模块从 `@tauri-apps/api` 这个入口拿（index.js 用相对路径引 core.js，
// 不会被本文件的 alias 绕回来）。
import { core } from "@tauri-apps/api";
import { adaptInvokeResult } from "./result-adapt";

export async function invoke<T = unknown>(
  cmd: string,
  args?: Record<string, unknown>,
  options?: Parameters<typeof core.invoke>[2],
): Promise<T> {
  return adaptInvokeResult(cmd, await core.invoke<T>(cmd, args, options));
}

export const isTauri = core.isTauri;
export const transformCallback = core.transformCallback;
export const convertFileSrc = core.convertFileSrc;
export const Channel = core.Channel;
export const PluginListener = core.PluginListener;
export const Resource = core.Resource;
export const addPluginListener = core.addPluginListener;
export const checkPermissions = core.checkPermissions;
export const requestPermissions = core.requestPermissions;
export const SERIALIZE_TO_IPC_FN = core.SERIALIZE_TO_IPC_FN;
