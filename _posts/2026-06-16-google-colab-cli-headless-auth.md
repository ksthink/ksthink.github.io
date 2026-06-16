---
layout: post
title: "Google Colab CLI, 헤드리스 서버에서 인증하기"
date: 2026-06-16
tags: [Colab, CLI, OAuth, SSH, 헤드리스, 인증, Python, Google]
---

Google Colab CLI(`google-colab-cli`)는 브라우저 없이 터미널에서 Colab VM을 다루는 도구다. CPU·GPU·TPU 런타임을 프로비저닝하고, 코드를 실행하고, 파일을 주고받고, 자동화 파이프라인을 구성할 수 있다. 그런데 이 도구를 브라우저가 없는 원격 서버에서 처음 실행하면 인증 단계에서 막힌다. 이 글은 그 과정에서 마주친 오류들과 해결책을 정리한 것이다.

## Google Colab CLI란?

`google-colab-cli`는 Colab 팀이 공식 배포하는 커맨드라인 인터페이스다.

```bash
# 설치
uv tool install google-colab-cli
# 또는
pip install google-colab-cli
```

주요 기능은 다음과 같다.

| 명령어 | 설명 |
|--------|------|
| `colab new` | CPU/GPU/TPU VM 세션 생성 |
| `colab exec -f script.py` | 로컬 파이썬 파일을 VM에서 실행 |
| `colab run --gpu T4 train.py` | 스크립트 실행 후 VM 자동 종료 |
| `colab upload / download` | 파일 송수신 |
| `colab repl` | 인터랙티브 REPL |
| `colab stop` | 세션 종료 |

로컬 맥/리눅스 환경에서는 `colab new` 한 줄로 브라우저 로그인 창이 뜨고 바로 연결된다. 문제는 **브라우저가 없는 원격 서버**에서 실행할 때다.

---

## 오류 1: `could not locate runnable browser`

```
Error: could not locate runnable browser
```

`colab new`를 실행하면 내부적으로 Google OAuth 2.0 인증 흐름이 시작된다. 구체적으로는 `google-auth-oauthlib`의 `InstalledAppFlow.run_local_server()`를 호출하는데, 이 함수가 인증 URL을 브라우저로 여는 `webbrowser.get().open(url)`을 실행한다. 헤드리스 서버에는 브라우저가 없으므로 바로 실패한다.

```python
# colab_cli/auth.py 내부 (원본)
flow = InstalledAppFlow.from_client_config(client_config, PUBLIC_SCOPES)
creds = flow.run_local_server(port=OAUTH_SERVER_PORT)
# → webbrowser.get() 호출 → 브라우저 없음 → 오류
```

---

## 오류 2: `DefaultCredentialsError` (ADC 시도)

`--auth adc` 옵션으로 Application Default Credentials를 쓰면 브라우저 문제를 피할 수 있을 것 같지만, ADC는 `gcloud auth application-default login`으로 사전에 설정된 자격증명을 필요로 한다. gcloud가 없는 환경이라면 역시 실패한다.

```
DefaultCredentialsError: Your default credentials were not found.
```

---

## 오류 3: `MismatchingStateError` (CSRF 불일치)

첫 번째 시도에서 URL을 먼저 따로 생성해 출력한 뒤, `run_local_server()`를 별도로 호출하는 방식을 썼다. 이때 OAuth `state` 파라미터가 두 번 생성되어 불일치가 발생한다.

```
MismatchingStateError: (mismatching_state) CSRF Warning! State not equal in request and response.
```

OAuth state는 CSRF 방지용으로, 인증 요청을 보낼 때 생성한 값과 리다이렉트로 돌아온 값이 정확히 일치해야 한다. URL을 두 번 만들면 state도 두 번 만들어지므로 일치하지 않는다.

---

## 해결책: `webbrowser` 모듈 패치 + SSH 포트 포워딩

근본적인 문제는 두 가지다.

1. `webbrowser.get()`이 실패한다 → 브라우저 대신 URL을 출력하면 된다.
2. Google이 `http://localhost:8200/`으로 리다이렉트하는데, 그 localhost는 **서버가 아닌 사용자 브라우저 쪽**이다 → SSH 포트 포워딩으로 연결한다.

### 1단계: auth.py 패치

`webbrowser` 모듈을 monkey-patch해서 URL을 터미널에 출력하게 하고, `run_local_server()`는 그대로 쓴다. 이렇게 하면 state가 한 번만 생성되어 CSRF 오류가 없다.

```python
# colab_cli/auth.py 수정
if not creds:
    import webbrowser as _wb
    _orig_get = _wb.get
    class _PrintBrowser:
        def open(self, url, new=0, autoraise=True):
            print(f"\n[colab] 브라우저에서 아래 URL을 열어 로그인하세요:\n\n{url}\n")
            return True
    _wb.get = lambda *a, **kw: _PrintBrowser()
    flow = InstalledAppFlow.from_client_config(client_config, PUBLIC_SCOPES)
    try:
        creds = flow.run_local_server(port=OAUTH_SERVER_PORT)
    finally:
        _wb.get = _orig_get
```

파일 경로:
```
~/.local/share/uv/tools/google-colab-cli/lib/python3.12/site-packages/colab_cli/auth.py
```

### 2단계: SSH 포트 포워딩

`run_local_server()`는 포트 8200에서 리다이렉트를 기다린다. 사용자 브라우저가 `http://localhost:8200/`으로 리다이렉트될 때, 그 트래픽이 서버의 포트 8200으로 전달되어야 한다. SSH 로컬 포트 포워딩(`-L`)으로 이 터널을 만든다.

로컬 머신(Windows PowerShell 또는 macOS/Linux 터미널)에서:

```bash
ssh -i "경로/키파일.pem" -L 8200:localhost:8200 ubuntu@서버_공인IP
```

이 상태에서 서버에 접속해 `colab new`를 실행하면:

1. URL이 터미널에 출력된다.
2. 로컬 브라우저에서 URL을 열고 Google 계정으로 로그인한다.
3. Google이 `http://localhost:8200/?code=...`으로 리다이렉트한다.
4. 브라우저의 요청이 SSH 터널을 통해 서버 포트 8200으로 전달된다.
5. `run_local_server()`가 코드를 받아 토큰을 교환하고 `~/.config/colab-cli/token.json`에 저장한다.

```
channel 3: open failed: connect failed: Connection refused  ← 무시해도 됨 (타이밍 이슈)
[colab] Session READY.  ← 성공
```

`channel 3` 오류는 SSH 터널 소켓이 아직 준비되기 전에 요청이 들어온 타이밍 문제로, 최종 결과에 영향이 없다.

---

## 한 번 인증 후에는

토큰이 `~/.config/colab-cli/token.json`에 저장되므로, 이후에는 SSH 포워딩 없이 `colab new`만 실행해도 자동으로 로그인된다. 토큰 만료 시 refresh token으로 자동 갱신된다.

---

## 정리

| 오류 | 원인 | 해결 |
|------|------|------|
| `could not locate runnable browser` | 헤드리스 서버에 브라우저 없음 | `webbrowser` monkey-patch로 URL 출력 |
| `DefaultCredentialsError` | ADC 미설정 (gcloud 없음) | OAuth2 흐름 유지 |
| `MismatchingStateError` | URL을 따로 생성해 state 불일치 | `run_local_server()` 단일 호출로 통일 |
| 리다이렉트 연결 불가 | 브라우저 localhost ≠ 서버 localhost | SSH `-L` 포트 포워딩 |

Colab CLI는 AI 학습·데이터 처리·자동화 파이프라인을 브라우저 없이 터미널에서 제어할 수 있는 강력한 도구다. 원격 서버 환경에서는 초기 인증에 약간의 설정이 필요하지만, 한 번만 거치면 이후부터는 `colab new` 한 줄로 GPU 환경을 바로 띄울 수 있다.

---

`#GoogleColab` `#CLI` `#OAuth` `#SSH` `#헤드리스` `#원격서버` `#Python` `#인증`
