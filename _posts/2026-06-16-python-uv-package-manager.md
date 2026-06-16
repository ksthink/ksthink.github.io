---
layout: post
title: "uv: Rust로 만든 초고속 Python 패키지 매니저 완벽 가이드"
date: 2026-06-16
tags: [Python, uv, 패키지매니저, Rust, 개발환경, Astral]
---

Python 생태계에서 패키지 관리는 오랜 숙제였다. `pip`, `virtualenv`, `pyenv`, `poetry`, `pipx`… 도구가 너무 많고 역할이 분산되어 있어 입문자는 물론 숙련자도 혼란을 겪는다. **uv**는 이 모든 문제를 하나의 도구로 해결하려는 시도다.

## uv란?

**uv**는 Python 린터 Ruff로 유명한 [Astral](https://astral.sh)이 2024년 2월에 공개한 Python 패키지 및 프로젝트 매니저다. Rust로 작성되어 있으며, pip 대비 **10~100배 빠른** 설치 속도를 자랑한다. 단순한 pip 대체재를 넘어, 가상환경 관리·Python 버전 관리·프로젝트 스캐폴딩까지 통합적으로 제공한다.

> "A single tool to replace pip, pip-tools, pipx, poetry, pyenv, twine, virtualenv, and more."
> — Astral 공식 문서

## 주요 특징

### 1. 압도적인 속도

uv의 가장 큰 차별점은 속도다. 의존성 해결(dependency resolution)과 패키지 다운로드를 병렬로 처리하고, 전역 캐시를 통해 이미 다운로드한 패키지는 재사용한다.

- **cold install** (캐시 없음): pip 대비 약 8~15배 빠름
- **warm install** (캐시 있음): pip 대비 약 80~100배 빠름

### 2. 단일 바이너리

uv는 단일 실행 파일 하나로 배포된다. Python이 설치되어 있지 않아도 uv 자체가 Python을 설치할 수 있다.

### 3. pip 호환 인터페이스

기존 pip 명령어에 익숙하다면 `pip` 대신 `uv pip`만 앞에 붙이면 거의 그대로 동작한다. 마이그레이션 비용이 매우 낮다.

### 4. 잠금 파일(lockfile) 지원

`uv.lock` 파일을 통해 재현 가능한 빌드를 보장한다. `poetry.lock`이나 `pip-tools`의 `requirements.txt`와 동일한 역할이다.

### 5. Python 버전 관리

`pyenv` 없이 uv 하나로 여러 Python 버전을 설치하고 전환할 수 있다.

---

## 설치

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# pip으로도 설치 가능
pip install uv
```

---

## 주요 사용법

### Python 버전 관리

```bash
# 사용 가능한 Python 버전 목록 확인
uv python list

# 특정 버전 설치
uv python install 3.12

# 특정 버전 설치 및 사용
uv python install 3.11 3.12
```

### 프로젝트 초기화

```bash
# 새 프로젝트 생성
uv init my-project
cd my-project

# 생성되는 파일 구조:
# my-project/
# ├── pyproject.toml
# ├── .python-version
# ├── .venv/
# └── hello.py
```

### 패키지 추가 및 제거

```bash
# 패키지 추가 (자동으로 가상환경에 설치됨)
uv add requests
uv add "fastapi>=0.100"

# 개발용 의존성 추가
uv add --dev pytest ruff

# 패키지 제거
uv remove requests
```

### 가상환경 없이 스크립트 실행

```bash
# 의존성을 명시한 인라인 스크립트 실행
uv run --with requests python script.py

# pyproject.toml 기반 프로젝트 실행
uv run python main.py
uv run pytest
```

### pip 호환 모드

```bash
# 기존 pip 명령어와 유사한 인터페이스
uv pip install numpy pandas
uv pip install -r requirements.txt
uv pip freeze > requirements.txt
uv pip list
```

### 의존성 동기화

```bash
# uv.lock 기준으로 환경 동기화 (CI/CD에서 유용)
uv sync

# 개발 의존성 제외하고 동기화
uv sync --no-dev
```

### 전역 도구 설치 (pipx 대체)

```bash
# 전역 CLI 도구 설치
uv tool install ruff
uv tool install black
uv tool install httpie

# 설치 없이 일회성 실행
uvx ruff check .
uvx black --check .
```

---

## poetry와의 비교

| 항목 | uv | poetry |
|------|-----|--------|
| 속도 | 매우 빠름 (Rust) | 상대적으로 느림 (Python) |
| Python 버전 관리 | 내장 | 미지원 (pyenv 별도) |
| pip 호환 | 있음 | 없음 |
| 잠금 파일 | uv.lock | poetry.lock |
| 성숙도 | 2024년 출시, 빠르게 성장 중 | 오랜 생태계 |
| pyproject.toml | 표준 준수 | 자체 섹션 사용 |

---

## 실전 워크플로우 예시

```bash
# 1. 프로젝트 생성
uv init blog-api
cd blog-api

# 2. Python 버전 고정
uv python pin 3.12

# 3. 의존성 추가
uv add fastapi uvicorn
uv add --dev pytest httpx

# 4. 앱 실행
uv run uvicorn main:app --reload

# 5. 테스트 실행
uv run pytest

# 6. CI에서 의존성 설치
uv sync --frozen  # lockfile 변경 없이 동기화
```

---

## 마치며

uv는 Python 도구 생태계의 파편화를 해결할 현실적인 대안으로 빠르게 자리잡고 있다. 특히 Rust 기반의 속도는 Docker 빌드나 CI/CD 파이프라인에서 체감 효과가 크다. pip·poetry·pyenv를 각각 배워야 했던 번거로움이 사라진다는 점에서, Python 프로젝트를 시작할 때 가장 먼저 고려해볼 도구다.

공식 문서는 [docs.astral.sh/uv](https://docs.astral.sh/uv)에서 확인할 수 있다.

---

`#Python` `#uv` `#패키지매니저` `#Rust` `#Astral` `#개발환경` `#pip` `#가상환경` `#pyenv대체`
