---
title: "PoweShellでGUIツールを作るメモ"
description: "PowershellでGUIツールを作ってみる"
publishedAt: 2024-04-23
author: "Sasaki"
tags: ["PowerShell"]
---

# はじめに
WIndowsFormやWPFアプリケーションはC#で作成するのが一般的だと思われるが、閉鎖的な環境ではそもそもC#の開発環境を整えることが厳しい場合がある。

Window標準搭載のPowerShellを触っていてふと思ったのが、.NetFrameWorkを利用できるのであればGUIアプリも構築可能なのでは?と調べてみたところ普通にできるようである。

- [PowerShellでユーザーフォームを作る　- 基礎編 -](https://letspowershell.blogspot.com/2015/07/powershell_9.html?m=1)
- [PowerShellでWPFを使う](https://qiita.com/potimarimo/items/1eca0516bd8c690872dc)

Formアプリに関しては以前C#で触れたということもあるので、今回はWPFを触れてみようと思う。

# 基本
始めるにあたり、何かライブラリを入れる必要性は基本的にない。

Windwos環境であればスクリプトとXMLファイルを用意してビルドするだけで簡単に動作させることができる。

## スクリプト側
WPFアプリケーションは基本的にGUI側の画面をxml形式で記載し、アプリケーションロジック側をPowerShellやC#などで記述する。

今回は単純な文字列を示すGUIを構築する。まず以下にxmlファイルの例を示す。
```xml
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" 
xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
Title="Test" Width="300" Height="300">
        <StackPanel>
            <TextBlock Text="Test" FontSize="24"/>
            <TextBlock Text="Hello World"/>
        </StackPanel>
</Window>
```

続いてpowershell スクリプト側を示す。 例ではxmlとps1ファイルを分割して記載しているが、`[xml]$xaml = `にxmlタグを直接代入することも可能である。
```powershell
using namespace System.Xml

function main {
    Add-Type -AssemblyName PresentationFramework
    [xml]$xaml = Get-Content .\test.xaml

    $nodeReader = (New-Object XmlNodeReader $xaml)
    $window = [Windows.Markup.XamlReader]::Load($nodeReader)
    $window.ShowDialog()
}

main
```

## 実行結果
### 実行コマンド
```bash
powershell -ExecutionPolicy Bypass .\main.ps1
```

### 出力
![aaa](./aaa.png)



# 応用例
昨日のメール自動送信スクリプトのClassと組み合わせて送信フォームGUIを構築してみる。

### XMLファイル
```xml
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" 
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MyApp" Width="500" Height="500">
    <Window.Resources>
        <!-- TextBoxのスタイルを定義 -->
        <Style TargetType="TextBox">
            <Setter Property="FontSize" Value="16"/>
            <Setter Property="Margin" Value="5"/>
            <Setter Property="MinHeight" Value="30"/>
            <Setter Property="Width" Value="400"/> 
            <Setter Property="VerticalAlignment" Value="Center"/>
        </Style>
    </Window.Resources>
    <Grid>
        <StackPanel>
            <TextBlock Text="Mail Send Application" FontSize="24" HorizontalAlignment="Center" VerticalAlignment="Center"/>
            <TextBlock Text="To:" FontSize="16"/>
            <TextBox x:Name="toTextBox"/>
            <TextBlock Text="Subject:" FontSize="16"/>
            <TextBox x:Name="subjectTextBox"/>
            <TextBlock Text="Body:" FontSize="16"/>
            <TextBox x:Name="bodyTextBox" Height="150"/>
            <Button x:Name="sendButton" Content="Send" Width="100" Height="30" Margin="5"/>
        </StackPanel>
    </Grid>
</Window>
```

### PS1ファイル
```powershell
using namespace System.Xml

class SendOutlookMail {
    [string]$to
    [string]$subject
    [string]$body

    SendOutlookMail([string]$to, [string]$subject, [string]$body) {
        $this.to = $to
        $this.subject = $subject
        $this.body = $body
    }

    [void] CreateMailItem() {
        try {
            # Outlook COMオブジェクトを作成する
            $Outlook = New-Object -ComObject Outlook.Application
            $mailItem = $Outlook.CreateItem(0)

            # To, Subjectの作成
            $mailItem.to = $this.to
            $mailItem.Subject = $this.subject
            

            # メール本文をHTML形式で作成する
            $body_ = $this.body
            $mailItem.BodyFormat = 2
            $mailItem.HTMLBody = "<p style='font-family: Meiryo UI; font-size: 9pt;'>$body_</P>"

            # メールの送信
            $mailItem.Send()

            # 正常完了通知
            $succMsg = $this.to+"に正常にメールが送信されました"
            $this.ToastItem($succMsg)
        } catch {
            # エラー通知
            $errorMessage = $_.Exception.Message
            $errMsg =  "エラーメッセージ: $errorMessage"
            $this.ToastItem($errMsg)
        }
    }

    [void] ToastItem([string]$msg) {
        # Windows通知ハンドラ
        $ToastText01 = [Windows.UI.Notifications.ToastTemplateType, Windows.UI.Notifications, ContentType = WindowsRuntime]::ToastText01
        $TemplateContent = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]::GetTemplateContent($ToastText01)
        $TemplateContent.SelectSingleNode('//text[@id="1"]').InnerText = $msg
        $AppId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($AppId).Show($TemplateContent)
    }
}

function main {
    Add-Type -AssemblyName PresentationFramework
    [xml]$xaml = Get-Content .\test.xaml

    $nodeReader = (New-Object XmlNodeReader $xaml)
    $window = [Windows.Markup.XamlReader]::Load($nodeReader)

    $toTextBox = $window.FindName("toTextBox")
    $subjectTextBox = $window.FindName("subjectTextBox")
    $bodyTextBox = $window.FindName("bodyTextBox")
    $sendButton = $window.FindName("sendButton")


    # ボタンクリックイベント処理
    $sendButton.Add_Click({
        $to = $toTextBox.Text
        $subject = $subjectTextBox.Text
        $body = $bodyTextBox.Text
        $mailer = [SendOutlookMail]::new($To, $Subject, $Body)
        $mailer.CreateMailItem()
    })

    $window.ShowDialog() | Out-Null
}

main
```

## 実行
### GUI
![aaa2](./aaa2.png)


# おわりに
開発環境がWindwosかつ状況的にインストールできるものが限られている場合に使用する業務効率化の手段としては中々使えるのではないかと思った。

あくまで閉鎖的環境かつWindows PCを使用しているという条件に限られるが...

# 参考
1. [PowerShellでWPFを使う](https://qiita.com/potimarimo/items/1eca0516bd8c690872dc)
2. [C#WPFの道#3！Gridの使い方をわかりやすく解説！](https://anderson02.com/cs/wpf/wpf-3/)
3. [Windows PowerShell 活用編（5）
.NET Framework利用の基礎](https://codezine.jp/article/detail/3572)