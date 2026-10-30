//! 托盘之外也在用的几条判定：语言码、「需要路由」规则。
//!
//! 桌面构建把这些名字从 `tray` 里转出（`tray.rs` 只做 `pub(crate) use`），
//! 无头构建的 `tray_headless` 也转出同一份，两边的行为不会分叉。

use crate::app_config::AppType;
use crate::provider::Provider;

/// 将系统区域标识映射为托盘支持的语言码。
///
/// 镜像前端 `i18n/getInitialLanguage` 的判定顺序，确保首次安装
/// （`settings.language` 尚未写入）时托盘语言与界面语言一致：
/// 繁中系统（zh-TW/HK/MO/Hant）→ `zh-TW`，其余 zh → `zh`，
/// 日文 → `ja`，土耳其文 → `tr`，英文 → `en`，其他语言回退到 `en`，
/// 区域为空时回退到 `zh`（与前端默认一致）。
fn map_locale_to_tray_language(locale: &str) -> &'static str {
    let locale = locale.to_lowercase();
    if locale == "zh" {
        "zh"
    } else if locale.starts_with("zh-tw")
        || locale.starts_with("zh-hk")
        || locale.starts_with("zh-mo")
        || locale.starts_with("zh-hant")
    {
        "zh-TW"
    } else if locale.starts_with("zh") {
        "zh"
    } else if locale.starts_with("ja") {
        "ja"
    } else if locale.starts_with("tr") {
        "tr"
    } else if locale.is_empty() {
        "zh"
    } else {
        "en"
    }
}

/// 读取系统区域并映射为托盘语言码；取不到区域时回退到 `zh`。
pub(crate) fn detect_system_tray_language() -> &'static str {
    sys_locale::get_locale()
        .as_deref()
        .map(map_locale_to_tray_language)
        .unwrap_or("zh")
}

pub(crate) fn tray_language() -> String {
    crate::settings::get_settings()
        .language
        .unwrap_or_else(|| detect_system_tray_language().to_string())
}

// ─── 「需要路由」判定（镜像前端 `providerNeedsRouting`）──────────────────────────────

const MANAGED_OAUTH_PROVIDER_TYPES: &[&str] = &["github_copilot", "codex_oauth", "xai_oauth"];

/// 官方账号卡（同前端 `isOfficialAccount`）：Codex 早期绑定托管账号的官方卡没有 category，按身份认。
pub(crate) fn is_official_account(app: &AppType, provider: &Provider) -> bool {
    provider.category.as_deref() == Some("official")
        || (*app == AppType::Codex && crate::proxy::providers::is_codex_official_provider(provider))
}

/// Codex / Grok Build 配置里当前供应商的 `wire_api`；TOML 读不懂时退回唯一的一条赋值。
pub(crate) fn codex_wire_api(config_text: &str) -> Option<String> {
    if let Ok(doc) = config_text.parse::<toml::Value>() {
        if let Some(active) = doc.get("model_provider").and_then(|v| v.as_str()) {
            if let Some(wire_api) = doc
                .get("model_providers")
                .and_then(|providers| providers.get(active))
                .and_then(|provider| provider.get("wire_api"))
                .and_then(|v| v.as_str())
            {
                return Some(wire_api.to_string());
            }
        }
        return doc
            .get("wire_api")
            .and_then(|v| v.as_str())
            .map(str::to_string);
    }
    let mut found = config_text.lines().filter_map(|line| {
        let (key, value) = line.split_once('=')?;
        (key.trim() == "wire_api").then(|| {
            value
                .trim()
                .trim_matches(|c| c == '"' || c == '\'')
                .to_string()
        })
    });
    let first = found.next()?;
    found.next().is_none().then_some(first)
}

pub(crate) fn is_chat_or_anthropic_wire_api(value: &str) -> bool {
    matches!(
        value.trim().to_ascii_lowercase().as_str(),
        "chat"
            | "chat_completions"
            | "chat-completions"
            | "openai_chat"
            | "openai-chat"
            | "openai_chat_completions"
            | "anthropic"
            | "anthropic_messages"
            | "anthropic-messages"
            | "messages"
            | "claude"
    )
}

/// 这家在这个应用下必须经过路由服务才能用（直连写进去也用不了）。和前端
/// `providerNeedsRouting`（`src/utils/providerCapabilities.ts`）是同一条规则，改一边要改另一边。
pub(crate) fn provider_needs_routing(app: &AppType, provider: &Provider) -> bool {
    if is_official_account(app, provider) {
        return false;
    }
    let meta = provider.meta.as_ref();
    let managed_oauth = meta
        .and_then(|meta| meta.provider_type.as_deref())
        .is_some_and(|kind| MANAGED_OAUTH_PROVIDER_TYPES.contains(&kind));
    let full_url = meta.and_then(|meta| meta.is_full_url) == Some(true);
    let api_format = meta
        .and_then(|meta| meta.api_format.as_deref())
        .filter(|fmt| !fmt.is_empty());
    match app {
        AppType::ClaudeDesktop => {
            managed_oauth
                || meta
                    .and_then(|meta| meta.claude_desktop_mode.as_ref())
                    .is_some_and(|mode| *mode == crate::provider::ClaudeDesktopMode::Proxy)
        }
        AppType::Claude => {
            managed_oauth || full_url || api_format.is_some_and(|f| f != "anthropic")
        }
        AppType::Codex | AppType::GrokBuild => {
            managed_oauth
                || full_url
                || matches!(api_format, Some("openai_chat" | "anthropic"))
                || provider
                    .settings_config
                    .get("config")
                    .and_then(|config| config.as_str())
                    .and_then(codex_wire_api)
                    .is_some_and(|wire_api| is_chat_or_anthropic_wire_api(&wire_api))
        }
        _ => false,
    }
}
