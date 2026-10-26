---
layout: post
title: "Cloudflare Tunnel 생성 매뉴얼"
date: 2026-10-26
slug: cloudflare-tunnel-manual
tags: [Cloudflare, 터널, 라즈베리파이, SSH, 홈서버]
published: true
---

공유기 포트[^1]를 열지 않고도 집에 있는 서버(라즈베리파이 등)를 내 도메인으로 외부에서 접속할 수 있게 하는 방법입니다. Cloudflare Tunnel[^2]을 이용합니다. 예시의 example.com은 본인 도메인으로 바꿔 쓰세요.

## 목차

- [준비물](#준비물)
- [1. 터널 만들기](#1-터널-만들기)
- [2. 서버에 cloudflared 설치](#2-서버에-cloudflared-설치)
- [3. 경로(공개 호스트명) 추가](#3-경로공개-호스트명-추가)
- [4. SSH로 접속하기 (Mac)](#4-ssh로-접속하기-mac)
- [자주 막히는 곳](#자주-막히는-곳)
- [주석](#주석)

## 준비물

- Cloudflare에 등록된 도메인 (네임서버[^3]가 Cloudflare로 지정돼 있어야 함)
- 64비트 Linux 서버 (예: Raspberry Pi OS Lite 64-bit)
- 터널로 SSH[^4] 접속을 하려면 Mac에 Homebrew[^5]

## 1. 터널 만들기

1. Cloudflare 대시보드에서 네트워크 → 터널로 들어갑니다.
2. 터널 만들기 → Cloudflared[^6]를 선택하고 이름을 정합니다(예: my-tunnel).
3. 환경을 Debian / arm64(라즈베리파이 기준)로 고르면 설치 명령어가 나옵니다.

## 2. 서버에 cloudflared 설치

대시보드에 표시된 명령어를 그대로 복사해 서버에서 실행하면 됩니다. 대략 다음과 같은 형태입니다.

```bash
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared

sudo cloudflared service install <토큰>
```

대시보드에서 터널 상태가 정상으로 바뀌면 연결된 것입니다. 토큰[^7]은 터널의 비밀번호나 마찬가지이니 절대 공개하지 마세요.

## 3. 경로(공개 호스트명) 추가

터널 상세 화면의 경로 탭 → 경로 추가 → 게시된 애플리케이션에 다음 값을 입력합니다. 여기서 만드는 주소를 공개 호스트명[^8]이라고 합니다.

| 항목 | 웹 서비스 예시 | SSH 예시 |
|---|---|---|
| 서브도메인 | app | ssh |
| 도메인 | example.com | example.com |
| 서비스 URL | http://localhost:8080 | ssh://localhost:22 |

서비스 URL에는 `http://`, `ssh://`, `tcp://` 같은 스킴[^9]을 직접 적습니다. 저장하면 DNS[^10] 레코드가 자동으로 만들어집니다.

## 4. SSH로 접속하기 (Mac)

```bash
brew install cloudflared
```

`~/.ssh/config`에 다음 내용을 추가합니다. `ProxyCommand`[^11]는 SSH가 cloudflared를 거쳐 터널로 접속하게 하는 설정입니다.

```
Host myserver
  HostName ssh.example.com
  User 사용자명
  ProxyCommand /opt/homebrew/bin/cloudflared access ssh --hostname %h
```

이제 어디서든 `ssh myserver`로 접속할 수 있습니다. 보안을 위해 Zero Trust[^12] → Access에서 이 호스트명에 "내 이메일만 허용" 정책을 걸어 두기를 권합니다.

## 자주 막히는 곳

- **no such host**: `~/.ssh/config`의 HostName이 대시보드에 만든 호스트명과 다릅니다.
- **같은 호스트명을 두 번 등록**: 위에서부터 처음 일치하는 경로만 적용됩니다. 서비스마다 서브도메인을 나누세요.
- **웹이 안 열림**: 로컬 서버가 HTTP인데 서비스 URL을 `https://`로 적은 경우가 많습니다.
- **터널이 끊김**: 서버에서 `sudo systemctl status cloudflared`로 상태를 확인합니다.

## 주석

[^1]: **포트**: 한 컴퓨터 안에서 서비스를 구분하는 번호입니다. 건물 주소가 같아도 호수가 다른 것과 비슷합니다(SSH는 22번, 웹은 80·443번 등). 공유기 포트를 연다는 것은 외부에서 그 번호로 집 안 기기에 직접 들어올 수 있게 한다는 뜻입니다.
[^2]: **터널(Cloudflare Tunnel)**: 집 서버가 먼저 Cloudflare 쪽으로 연결을 맺어 두고, 외부 접속은 그 연결을 통해 들어오게 하는 방식입니다. 서버가 바깥으로 나가는 연결만 쓰므로 공유기 포트를 열 필요가 없습니다.
[^3]: **네임서버**: 도메인 이름에 해당하는 실제 주소(IP)를 알려 주는 서버입니다. 도메인을 산 곳에서 네임서버를 Cloudflare로 바꿔야 Cloudflare가 그 도메인의 주소를 관리할 수 있습니다.
[^4]: **SSH**: 다른 컴퓨터에 암호화된 연결로 접속해 명령어를 실행하는 방법입니다.
[^5]: **Homebrew**: Mac에서 프로그램을 명령어 한 줄로 설치하게 해 주는 패키지 관리자입니다.
[^6]: **cloudflared**: 서버와 내 컴퓨터에 설치해 Cloudflare 터널에 연결하는 Cloudflare의 프로그램입니다.
[^7]: **토큰**: 이 서버가 내 터널에 연결해도 된다는 것을 증명하는 긴 문자열입니다. 다른 사람이 알면 그 사람의 서버도 내 터널에 붙을 수 있습니다.
[^8]: **공개 호스트명**: 외부에서 접속할 때 쓰는 주소입니다(예: app.example.com). 이 주소로 들어온 요청이 터널을 거쳐 집 서버의 서비스로 전달됩니다.
[^9]: **스킴**: 주소 맨 앞의 `http://`, `ssh://`처럼 어떤 방식(프로토콜)으로 연결할지 나타내는 부분입니다.
[^10]: **DNS**: 도메인 이름을 실제 주소로 바꿔 주는 인터넷의 전화번호부 같은 체계입니다. 여기서는 새 호스트명이 터널을 가리키도록 하는 기록(레코드)이 자동으로 추가됩니다.
[^11]: **ProxyCommand**: SSH 접속 전에 실행할 중계 명령을 지정하는 설정입니다. 여기서는 cloudflared가 Cloudflare를 거쳐 서버까지 연결을 이어 줍니다.
[^12]: **Zero Trust**: 접속할 때마다 누구인지 확인하고 허용된 사람만 들여보내는 보안 방식으로, Cloudflare의 해당 기능 메뉴 이름이기도 합니다. Access에서 정책을 만들면 지정한 이메일로 인증한 사람만 접속할 수 있습니다.
