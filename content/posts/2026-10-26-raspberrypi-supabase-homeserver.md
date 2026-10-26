---
title: "라즈베리파이 Supabase 홈서버 구축 기록"
date: 2026-10-26
slug: raspberrypi-supabase-homeserver
tags: [라즈베리파이, Supabase, Cloudflare, 홈서버, 셀프호스팅]
---

라즈베리파이 4(4GB, SD카드)에 Supabase[^1]를 셀프 호스팅[^2]하고 Cloudflare Tunnel로 supa.example.com에 연결했다. 재부팅 후 자동 복구까지 확인했다.

## 목차

- [현재 구성](#현재-구성)
- [주요 값](#주요-값)
- [진행 순서](#진행-순서)
- [막혔던 문제와 해결](#막혔던-문제와-해결)
- [운영 메모와 남은 일](#운영-메모와-남은-일)
  - [자주 쓰는 명령](#자주-쓰는-명령)
  - [주의할 점](#주의할-점)
  - [남은 일](#남은-일)
- [주석](#주석)

## 현재 구성

<!-- TODO: 원문 아티팩트의 구성도(embed: node/9f06f177-e396)가 들어갈 자리 -->

공유기 포트는 하나도 열지 않았다. supa 주소로 들어온 요청은 Kong[^3]을 거쳐 Supabase 서비스로, pi 주소로 들어온 요청은 SSH로 연결된다.

## 주요 값

| 항목 | 값 |
|---|---|
| 하드웨어 | Raspberry Pi 4 (4GB), SD카드 |
| OS | Raspberry Pi OS Lite (64-bit) |
| 호스트명 / 사용자 | (익명 처리) / (익명 처리) |
| Cloudflare 터널 | my-tunnel, 토큰 방식, 토큰은 서버의 별도 파일에 보관 |
| SSH 주소 | pi.example.com → `ssh://localhost:22` (Mac에서 `ssh pi`) |
| Supabase 주소 | https://supa.example.com → `http://localhost:8000` |
| Supabase 폴더 | `~/supabase-project` |
| Compose[^6] 구성 | `COMPOSE_FILE=docker-compose.yml:docker-compose.kong.yml` |
| API 게이트웨이[^3] | Kong 3.9.3 (Envoy[^4]는 파이에서 동작 안 함) |
| 제외한 서비스 | imgproxy[^5] (이미지 변환 꺼짐) |
| 비밀 값 | `~/supabase-project/.env`, 확인은 `sh run.sh secrets` |

## 진행 순서

1. **OS 설치**: Raspberry Pi Imager로 Lite 64-bit 이미지를 SD카드에 굽고, 호스트명·사용자·SSH를 미리 설정해 헤드리스[^7]로 부팅했다.
2. **SD카드 보호**: SD카드의 swap을 끄고 대신 zram[^8]을 썼다. log2ram[^9]을 설치하고 루트 파티션에 noatime[^10] 옵션을 걸었다.
3. **Cloudflare Tunnel**: 대시보드(네트워크 → 터널)에서 my-tunnel 터널을 만들고, 파이에 cloudflared를 설치해 토큰으로 서비스에 등록했다.
4. **SSH 경로**: pi.example.com → `ssh://localhost:22`를 추가하고, Mac의 `~/.ssh/config`에 `cloudflared access ssh` ProxyCommand를 넣었다.
5. **Supabase 설치**: 공식 `setup.sh`로 Docker[^6] 설치, 키 생성, URL 입력까지 한 번에 진행했다.
6. **게이트웨이 교체**: Envoy가 뜨지 않아 `sh run.sh config add kong`으로 Kong으로 바꿨다.
7. **imgproxy 제거**: `docker-compose.yml`에서 imgproxy 서비스와 storage의 의존성을 지우고 `ENABLE_IMAGE_TRANSFORMATION: "false"`로 바꿨다. 원본은 `docker-compose.yml.bak`으로 남겨 뒀다.
8. **Supabase 경로**: supa.example.com → `http://localhost:8000`을 추가했다. `--resolve` 옵션으로 확인하니 401(Studio[^11] 로그인 요구)이 돌아왔다.
9. **재부팅 대응**: docker와 cloudflared를 enabled로 두고, 재부팅 후 약 2분 안에 모든 컨테이너가 healthy[^12]로 돌아오는 것을 확인했다.

## 막혔던 문제와 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| supabase-envoy unhealthy, 로그에 `tcmalloc MmapAligned() failed` | Envoy의 tcmalloc[^13]이 48비트 가상 주소를 가정하는데 파이 4 커널은 39비트 | `sh run.sh config add kong`으로 Kong 사용 |
| supabase-imgproxy Restarting (132) | Illegal instruction[^14], ARM64 이미지가 Cortex-A72에서 동작 안 함 | imgproxy 서비스 제거, 이미지 변환 끔 |
| 수정 후에도 imgproxy가 뜨고 storage unhealthy | 서비스 블록이 파일에 남아 있었음 | `nano +392`로 블록 삭제, 남은 컨테이너는 `docker rm -f supabase-imgproxy` |
| `ssh pi`에서 no such host | `~/.ssh/config`의 HostName이 실제 경로와 다름 | HostName을 pi.example.com로 수정 |
| SSH 경로가 쓰이지 않음 | 같은 호스트명 경로가 두 개, 위쪽이 먼저 매칭 | 호스트명당 경로 하나만 둠 |
| 서비스 유형에 SSH 없음 | 새 대시보드는 스킴을 URL에 직접 적는 방식 | 서비스 URL에 `ssh://localhost:22` |
| supa.example.com 접속 불가, Could not resolve host | Mac·공유기 DNS가 레코드 생성 전의 "없음" 결과를 캐시[^15] (1.1.1.1에서는 정상) | 기다리기(최대 약 30분) 또는 Mac DNS를 1.1.1.1로 |
| 재부팅 직후 meta·storage unhealthy | SD카드라 초기 기동이 느림 | 1~2분 뒤 자동으로 healthy |

## 운영 메모와 남은 일

### 자주 쓰는 명령

`~/supabase-project`에서 실행한다.

```bash
docker compose ps                 # 상태 확인
sh run.sh logs <서비스>          # 로그 보기
sh run.sh secrets                 # 키·비밀번호 확인
systemctl status cloudflared --no-pager
free -h && docker stats --no-stream
```

### 주의할 점

- 재부팅은 `sudo reboot`만 한다. `sh run.sh stop` 뒤에는 unless-stopped 때문에 재부팅해도 다시 켜지지 않는다[^16].
- 전원은 `sudo shutdown -h now` 후 초록 LED가 꺼지면 뽑는다.
- `update.sh`로 업데이트하면 imgproxy가 다시 들어올 수 있으니 확인한다.
- Kong에서 새 키(`sb_...`)로 401이 나면 기존 ANON_KEY·SERVICE_ROLE_KEY를 쓴다.
- Studio는 Basic Auth[^17]로만 보호된다. `.env`는 git에 올리지 않는다. 터널 토큰도 공개하지 않는다.

### 남은 일

- Mac DNS 캐시가 풀린 뒤 브라우저로 Studio 로그인 확인
- pg_dump + cron으로 R2 자동 백업[^18]
- 터널의 중복 경로(pi.example.com → `http://localhost:8080`) 삭제
- Zero Trust Access로 SSH 호스트명에 본인 이메일만 허용
- USB SSD로 이전 (실데이터가 쌓이기 전)

## 주석

[^1]: **Supabase**: 데이터베이스(PostgreSQL), 로그인, 파일 저장소, API를 한데 묶어 제공하는 오픈소스 백엔드 플랫폼이다. 앱의 서버 쪽 기능을 직접 짜지 않고 가져다 쓸 수 있다.
[^2]: **셀프 호스팅**: 업체가 운영하는 클라우드 서비스를 쓰는 대신, 같은 소프트웨어를 내 장비에 직접 설치해 운영하는 방식이다.
[^3]: **API 게이트웨이(Kong)**: 바깥에서 들어오는 요청을 한 곳에서 받아 알맞은 내부 서비스로 나눠 보내는 관문 역할의 프로그램이다. Kong은 그런 게이트웨이 가운데 하나다.
[^4]: **Envoy**: Kong과 같은 역할을 할 수 있는 또 다른 프록시 프로그램이다. 이 글의 환경에서는 파이 4에서 실행되지 않아 Kong으로 바꿨다.
[^5]: **imgproxy**: 이미지 크기 조정이나 형식 변환을 실시간으로 처리해 주는 서버 프로그램이다. Supabase Storage의 이미지 변환 기능이 이것을 쓴다.
[^6]: **Docker / Compose**: Docker는 프로그램을 필요한 환경과 함께 '컨테이너'라는 상자에 담아 실행하는 도구다. Compose는 여러 컨테이너의 구성을 파일 하나에 적어 한꺼번에 띄우는 기능이다.
[^7]: **헤드리스**: 모니터, 키보드, 마우스 없이 켜서 네트워크로만 접속해 쓰는 방식이다.
[^8]: **zram**: 메모리(RAM) 일부를 압축해 swap 공간으로 쓰는 기능이다. 쓰기 횟수에 수명이 걸린 SD카드에 swap을 두지 않아도 된다.
[^9]: **log2ram**: 시스템 로그를 우선 메모리에 쓰고 가끔씩만 SD카드에 옮겨 적어, 카드에 쓰는 횟수를 줄여 주는 도구다.
[^10]: **noatime**: 파일을 읽을 때마다 '마지막으로 읽은 시각'을 기록하지 않게 하는 마운트 옵션이다. 불필요한 쓰기를 줄여 준다.
[^11]: **Studio**: Supabase의 웹 관리 화면이다. 표 편집, SQL 실행, 사용자 관리 등을 브라우저에서 할 수 있다.
[^12]: **healthy**: Docker가 컨테이너마다 정해진 점검을 해서 정상으로 판단한 상태다. 반대는 unhealthy다.
[^13]: **tcmalloc과 가상 주소 비트 수**: tcmalloc은 프로그램의 메모리 할당을 빠르게 처리하는 라이브러리다. 가상 주소 비트 수는 프로그램이 쓸 수 있는 메모리 주소의 범위를 정하는데, tcmalloc은 48비트를 가정한 반면 이 파이의 커널은 39비트만 지원해 메모리를 잡지 못했다.
[^14]: **Illegal instruction**: 프로그램이 CPU가 지원하지 않는 명령을 실행하려 할 때 나는 오류다. 같은 ARM64라도 CPU 세대마다 지원하는 명령이 조금씩 다르다.
[^15]: **DNS 캐시**: 한 번 조회한 도메인의 주소(또는 '없음' 결과)를 일정 시간 기억해 두는 것이다. 그동안은 레코드가 새로 생겨도 예전 결과가 계속 쓰인다.
[^16]: **unless-stopped**: Docker 컨테이너의 재시작 정책이다. 사람이 직접 멈춘 컨테이너는 재부팅 뒤에도 자동으로 다시 켜지지 않는다.
[^17]: **Basic Auth**: 접속할 때 아이디와 비밀번호만 묻는 가장 단순한 웹 인증 방식이다.
[^18]: **pg_dump, cron, R2**: pg_dump는 PostgreSQL 데이터베이스를 파일로 내보내는 백업 도구, cron은 정해진 시각마다 명령을 자동으로 실행하는 리눅스 예약 기능, R2는 Cloudflare의 파일 저장(오브젝트 스토리지) 서비스다.
