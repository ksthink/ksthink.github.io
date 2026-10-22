---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 22일 — 공급망을 노린 공격과 PHP 긴급 패치"
date: 2026-10-22
slug: geeknews-daily-2026-10-22
tags: [GeekNews, 기술뉴스, 데일리요약, 보안, AI, 클라우드]
published: true
---

오늘 GeekNews는 개발자가 매일 쓰는 도구와 플랫폼을 겨냥한 보안 소식이 주를 이뤘다. 인기 LLM 프록시 LiteLLM의 PyPI 배포본에 인증 정보를 훔치는 악성코드가 들어갔고, 배포 플랫폼 Railway는 고객 환경 변수가 유출됐을 수 있다고 공개했다. PHP는 원격 코드 실행 취약점 2건을 고친 버전을 내놓으며 수정이 늦어진 경위도 털어놓았다. 여기에 OpenAI 모델의 Google Cloud 진출과, 한국 개발자들이 새로 만든 AI 모델의 절반 가까이가 중국 Qwen 기반이라는 보고서도 함께 정리한다.

## 1. LiteLLM 1.107.0 PyPI 패키지에 인증 정보 탈취 악성코드와 백도어 삽입

여러 LLM API를 하나로 묶어 주는 LiteLLM의 PyPI 배포본 1.107.0에서 인증 정보 탈취 악성코드와 원격 코드 실행 백도어가 발견됐다. 운영체제별 wheel 7개 모두 `cook.pth`, `cook.py`, `sitecustomize.py`를 설치한다. 그래서 LiteLLM을 불러오지 않아도 Python이 시작될 때마다 악성코드가 실행되고, pip나 IDE 언어 서버, CI 작업도 실행 계기가 될 수 있다. 악성코드는 SSH 키, 클라우드 인증 정보, 브라우저 비밀번호, AI 개발 도구 토큰과 LiteLLM 프록시 DB에 저장된 LLM 제공업체 API 키를 수집해 외부로 보낸다. 공개 GitHub 소스에는 악성 파일이 없었고, 분석한 SafeDep는 공격자가 변조한 소스를 비공개 릴리스 파이프라인이 빌드했을 가능성이 높다고 봤다. PyPI는 해당 릴리스를 삭제했으며, 1.106.2와 1.107.0rc1·rc2에는 악성코드가 없었다.

**왜 중요한가:** 1.107.0을 설치한 적이 있다면 패키지를 지우는 것만으로는 부족하고, 그 환경에 있던 키와 토큰을 모두 교체해야 한다.

- [GeekNews](https://news.hada.io/topic?id=35767) · [원문 (SafeDep)](https://safedep.io/litellm-pypi-compromise-credential-stealer-backdoor/)

## 2. PHP, 원격 코드 실행 취약점 2건 수정하고 패치 지연 경위 공개

PHP 프로젝트가 10월 21일 PHP 8.5.12, 8.4.27, 8.3.36, 8.2.35를 내놓고, 인증 없이 원격 코드 실행이 가능한 취약점 2건을 고쳤다. 하나는 요청이 특정 시점에 `memory_limit`에 걸리면 메모리가 손상되는 문제로, Apache mod_php 기본 설정에서 완전한 원격 코드 실행이 입증됐다. 다른 하나는 치명적 오류 뒤 이전 요청의 내부 상태가 남아 해제된 메모리를 다시 쓰는 문제다. PHP 재단은 첫 번째 문제의 징후를 2024년 보안 감사 때 발견했지만, 하위 호환성과 합의 중심 의사결정, 인력 부족이 겹쳐 수정이 늦어졌다고 인정했다. 앞으로는 보안팀이 다수결로 결정할 수 있도록 절차를 바꾸고 전담 인력과 검증 도구를 늘리겠다고 밝혔다.

**왜 중요한가:** PHP 서버를 운영한다면 즉시 업데이트해야 하며, AI 덕분에 취약점 발견은 빨라졌지만 고치는 일은 여전히 숙련된 사람의 몫이라는 점도 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=35766) · [원문 (PHP 재단 블로그)](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)

## 3. Railway, 고객 환경 변수 유출 가능성 공개하고 전체 배포 중단

배포 플랫폼 Railway가 고객 환경 변수를 저장하는 시스템에서 이상 활동을 탐지했다고 공개했다. 조사 결과 비인가 제3자가 암호화된 환경 변수에 접근했고, 일부는 복호화된 내용까지 손에 넣었을 가능성이 있다. 환경 변수에는 API 키와 데이터베이스·레지스트리 자격 증명이 들어 있을 수 있어, Railway는 모든 사용자에게 환경 변수와 비공개 레지스트리 자격 증명을 즉시 교체하고 로그를 점검하라고 권고했다. 조사 기간에는 모든 배포가 중단돼, 빌드가 복구될 때까지 새 버전을 올릴 수 없다. Railway는 이번 사고가 AI 추론 제공업체를 노려 플랫폼 기업을 잇달아 공격하는 흐름의 일부라고 보고 있다.

**왜 중요한가:** 플랫폼에 맡겨 둔 비밀 값도 언제든 새어 나갈 수 있으므로, 키를 빠르게 교체할 수 있는 체계를 미리 갖춰 둬야 한다.

- [GeekNews](https://news.hada.io/topic?id=35778) · [원문 (Railway 블로그)](https://blog.railway.com/p/security-disclosure-wednesday-october-21st)

## 4. OpenAI 모델과 Codex, Google Cloud에 들어간다

OpenAI 모델과 Codex를 Google Cloud에서 쓸 수 있게 된다. 일부 기업 고객을 대상으로 GPT-6 Astra, GPT-6.1 Sol, GPT-6 Luna의 비공개 프리뷰가 시작됐고, 정식 출시는 몇 주 안에 이뤄질 예정이다. 모델은 Model Garden에서 고르고 Google Cloud Marketplace로 구매하며, 기존 Google Cloud 지출 약정을 쓸 수 있고 이용 내역은 Google Cloud 청구서 하나로 합쳐진다. 이 모델들은 전용 Google Cloud 인프라에서 실행되고 기존 접근 제어와 감사 로그가 그대로 적용되며, 로컬 Codex CLI와 데스크톱 앱을 연결해 추론을 실행할 수도 있다. Microsoft는 계속 OpenAI의 주요 클라우드 파트너로 남는다.

**왜 중요한가:** Google Cloud를 쓰는 기업도 클라우드를 옮기지 않고 OpenAI 모델을 도입할 수 있게 되면서, 모델과 클라우드를 따로 고르는 흐름이 한층 뚜렷해졌다.

- [GeekNews](https://news.hada.io/topic?id=35775) · [원문 (OpenAI)](https://openai.com/index/openai-models-google-cloud/)

## 5. 한국의 신규 AI 파생 모델, 절반 가까이가 중국 Qwen 기반

2026년 1~8월 한국 계정이 Hugging Face에 새로 공개한 언어모델 1,845건 가운데 49.3%가 중국 모델을 기반으로 한다는 보고서가 나왔다. 이 흐름을 이끈 것은 알리바바 Qwen으로 전체의 46.8%인 864건을 차지했고, Gemma(14.7%), Llama(13.8%), EXAONE(9.3%)이 뒤를 이었으며 DeepSeek는 1.0%에 그쳤다. 신규 산출물 중 중국 기반 비중은 2023년 1.2%에서 2025년 22.0%, 2026년 49.3%로 빠르게 늘었다. 기업 102곳에 중국 AI를 쓰는지 물었을 때는 쓴다고 답한 곳이 없었지만, 서비스별로 물으면 일부가 쓴다고 답했다. 보고서는 다양한 모델 크기와 다국어 지원, 풍부한 도구를 Qwen의 강점으로 꼽고, 국내 개방형 모델도 상업적 이용 조건과 파인튜닝 생태계를 함께 갖춰야 한다고 지적했다.

**왜 중요한가:** 한국 AI 개발 현장이 실제로 어떤 기반 모델 위에서 움직이는지를 데이터로 보여 주며, 국산 모델 정책이 성능 너머 생태계까지 봐야 하는 이유를 드러낸다.

- [GeekNews](https://news.hada.io/topic?id=35785) · [원문 (록브리지네트워크코리아)](https://rbnkorea.org/insight/?bmode=view&idx=175120449)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
