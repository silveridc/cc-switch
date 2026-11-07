; Inno Setup script for the fork's desktop build that ships the revived v3.20.4 UI
; on the upstream v4 backend. Compile it with tools/inno.cmd.
;
; Keep this file ASCII-only: Inno decodes a BOM-less UTF-8 script with the system
; ANSI codepage, so non-ASCII here mangles the wizard text. Files that do carry
; Chinese are stored as UTF-8 *with* BOM (see legacy-ui-readme.txt).

#define AppName "CC Switch Legacy UI"
#define DirName "cc-switch-legacy"
#define AppExe "cc-switch.exe"
; tools/inno.cmd passes the version from src-tauri/tauri.conf.json; this is only the fallback.
#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif
; Whatever `pnpm tauri build --config src-tauri/tauri.legacy.conf.json` last emitted.
; A plain `pnpm tauri build` overwrites the same path with the *new* UI binary, so
; build the legacy target right before packing; the installer just takes what's there.
#define SrcDir "..\src-tauri\target\release"

[Setup]
; Deliberately NOT the official app's identity: same product name or MSI/upgrade
; code would let this package show up as, or replace, "CC Switch" itself.
AppId={{0FFB04C8-EE3B-41C5-AC4A-AFF7C5A92A4D}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher=silveridc
AppPublisherURL=https://github.com/silveridc/cc-switch
AppSupportURL=https://github.com/silveridc/cc-switch/issues
AppUpdatesURL=https://github.com/silveridc/cc-switch/releases
DefaultDirName={autopf}\{#DirName}
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
DisableWelcomePage=no
LicenseFile=..\LICENSE
InfoBeforeFile=legacy-ui-readme.txt
OutputDir=Output
OutputBaseFilename={#DirName}-{#AppVersion}-x64-setup
SetupIconFile=..\src-tauri\icons\icon.ico
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\{#AppExe}
Compression=lzma2/max
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
; The app itself is per-user (its config lives in ~\.cc-switch), so the installer
; must not demand admin just to write to {autopf}.
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
CloseApplications=yes
RestartApplications=no
WizardStyle=modern
VersionInfoVersion={#AppVersion}
VersionInfoProductName={#AppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "{#SrcDir}\{#AppExe}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExe}"; Description: "{cm:LaunchProgram,{#AppName}}"; Flags: nowait postinstall skipifsilent

[Code]
const
  EdgeClientKey = 'Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';

function WebView2Present: Boolean;
var
  Version: string;
begin
  Result := False;
  if RegQueryStringValue(HKLM, 'SOFTWARE\WOW6432Node\' + EdgeClientKey, 'pv', Version) then
    Result := (Version <> '') and (Version <> '0.0.0.0');
  if not Result then
    if RegQueryStringValue(HKLM, 'SOFTWARE\' + EdgeClientKey, 'pv', Version) then
      Result := (Version <> '') and (Version <> '0.0.0.0');
  if not Result then
    if RegQueryStringValue(HKCU, 'Software\' + EdgeClientKey, 'pv', Version) then
      Result := (Version <> '') and (Version <> '0.0.0.0');
end;

function InitializeSetup: Boolean;
begin
  // WebView2 is the only hard runtime dependency of a Tauri app on Windows. Warn,
  // don't block: an offline machine can install the runtime separately.
  if not WebView2Present then
    MsgBox('Microsoft Edge WebView2 Runtime was not detected. This build needs it: ' +
      'without it the window opens blank or not at all.' + #13#10#13#10 +
      'Install "Evergreen WebView2 Runtime" from Microsoft, then start the app.',
      mbInformation, MB_OK);
  Result := True;
end;
