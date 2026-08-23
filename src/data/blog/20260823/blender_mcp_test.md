---
title: "codexとblander mcpの連携"
description: "環境設定メモ"
publishedAt: 2026-08-23
author: "Sasaki"
tags: ["codex", "blender"]
---

# 各種セットアップ手順
## Blender MCPのセットアップ
下記リンクを参照。  
(MCPのセットアップなのでcodexの場合も手順は殆ど一緒)
- [Claude Desktop で Blender MCP を試す](https://note.com/npaka/n/n060bf656cf01)

## codex側の設定

Codex CLIのインストールを含め、下記を参考に実施した。自分の環境にはデスクトップ版しか入っていなかったので、まずCLIを追加した。

- [OpenAI Codex (Github)](https://github.com/openai/codex)
- [Codex Appから公式のBlender MCPを動かす](https://note.com/yasudadesu/n/n69b1d1c6d319)

### 設定ファイルの追記

`%USERPROFILE%\.codex\config.toml`へ下記を追記。

```toml
[mcp_servers.blender]
command = "uvx"
args = [
  "--from",
  "git+https://projects.blender.org/lab/blender_mcp.git@v1.0.0#subdirectory=mcp",
  "--with",
  "mcp<2",
  "blender-mcp"
]
startup_timeout_sec = 120

[mcp_servers.blender.env]
BLENDER_MCP_HOST = "localhost"
BLENDER_MCP_PORT = "9876"
```

`mcp<2`を指定しているのは、指定なしだと自分の環境では以下のエラーになったため。

```text
ModuleNotFoundError: No module named 'mcp.server.fastmcp'
```

### 接続確認

Blenderを起動し、MCPアドオンからBridge Serverを開始する。その後、PowerShellで9876番ポートが待受状態になっているか確認。

```powershell
Get-NetTCPConnection -State Listen -LocalPort 9876
```

結果が表示されたら、CLIから`codex`を起動するか、Codexデスクトップアプリを再起動する。  

Codex内では`/mcp`で接続状態を確認できる。  
チャットで「Blenderと連携されていますか？」と聞いて確認してもよい。

---
# 試しに...
イコちゃんのモデルを作らせてみた。  (出来はイマイチ...)

https://www.youtube.com/watch?v=1R2LqgaPeP8