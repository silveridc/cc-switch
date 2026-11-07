这个安装包是什么

它是 CC Switch 的一个分支构建：界面是复活的旧版（v3.20.4 的那套 UI），
后端是上游 v4。同一套后端还能以「浏览器版页面 + 无头单二进制」的形式跑在
没有显示器的 Linux 服务器上，这个桌面版只是把同一份前端装进 Tauri 壳里。

和官方版的关系（重要）

1. 两者共用同一个数据目录：C:\Users\<你>\.cc-switch（数据库 cc-switch.db、
   供应商配置、日志、备份都在这里）。这个安装包不会迁移也不会复制你的数据，
   装完打开看到的就是你现有的那套供应商。

2. 第一次用这个版本打开数据库时，它会把自己的表结构版本升级上去（v4 的 schema）。
   这个升级是单向的：升级后旧版二进制会报「数据库版本过新」而打不开同一个库。
   升级前应用会自动把当时的库备份到 .cc-switch\backups\db_backup_<时间戳>.db，
   需要回退就停掉应用、把那个文件复制回 cc-switch.db。

3. 界面里的「切换」「启用路由」是真的在写你的 C:\Users\<你>\.claude\settings.json
   （以及 .codex / .gemini 的对应配置），不是演示。改之前建议先看清当前生效的是
   哪张卡。

4. 卸载只删除程序本体（{app} 目录和快捷方式），.cc-switch 里的数据一律保留。

运行依赖

Windows 需要 Microsoft Edge WebView2 Runtime（Win10 1803+ / Win11 一般随 Edge
自带）。缺失时窗口会白屏或起不来，去微软官网装「Evergreen WebView2 Runtime」即可。

出问题去哪看

日志：C:\Users\<你>\.cc-switch\logs\cc-switch.log
提 Issue 时请附上崩溃时间点前后的日志行。

源码：https://github.com/silveridc/cc-switch
