---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 29일 — 보이지 않는 비용, 모델 안의 컴퓨터"
date: 2026-10-29
slug: geeknews-daily-2026-10-29
tags: [GeekNews, 기술뉴스, 데일리요약, AI, 에이전트, 오픈소스]
published: true
---

오늘 GeekNews에서는 Claude Code가 백그라운드 에이전트의 상태 줄 하나를 채우려고 대화 기록 전체를 주기적으로 모델에 보내고 있다는 분석이 가장 눈에 띄었다. 언어 모델의 가중치 안에 RISC-V CPU를 컴파일해 넣은 Qwenputer 실험, 비공개 평가 비중을 크게 늘린 AI 역량 지수 AAII v5도 함께 올라왔다. 한국어를 포함한 40개 언어를 지원하는 NVIDIA의 공개 음성 인식 모델과, AI가 만든 코드를 매번 새 컨테이너에서 돌리는 경량 런타임 kern까지 다섯 개를 정리한다.

## 1. Flamerix AI 분석: Claude Code가 백그라운드 에이전트마다 대화 기록 전체를 주기적으로 모델에 보낸다

Flamerix AI가 GitHub Gist에 올린 분석에 따르면, Claude Code는 백그라운드 에이전트마다 약 30초 간격으로 그 에이전트의 전체 대화 기록을 해당 모델(주로 Opus)에 보내 "최근 행동을 3~5단어로 설명하라"고 요청하며, 그 답은 에이전트 패널의 상태 줄에만 쓰인다. 필자 측 OpenTelemetry 측정에서 이 요청(`query_source = agent_summary`)은 Claude Code 전체 비용 추정치의 16.4%로 메인 대화(15.7%)보다 많았고, API 요청의 약 19.7%를 차지했다. 이 기능은 2.1.232(2026년 8월)부터 기본으로 켜져 있고 끄는 설정이 없으며, 간격은 서버 플래그로 30~240초 사이에서 정해진다고 한다. 이 요청은 디스크의 세션 로그에 남지 않아 기록 기반 비용 도구로는 보이지 않는다는 점도 지적한다. 필자는 바이너리를 고치지 않고 Bun preload 스크립트로 요약 타이머만 무력화하는 방법을 MIT 라이선스로 공개했지만, Linux에서만 시험했고 업데이트 후 조용히 무효가 될 수 있다고 경고한다.

**왜 중요한가:** 에이전트 도구의 비용 가운데 상당 부분이 사용자가 보지도, 끄지도 못하는 부가 요청에서 나올 수 있다는 점을 측정으로 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36213) · [원문 (GitHub Gist)](https://gist.github.com/flamerix-ai/c3905705cc4205e5de3011fa2e74efce)

## 2. Qwenputer: Qwen3.5 내부에서 작동하는 결정론적 RISC-V CPU

Divyansh Agrawal은 Qwen3.5 4B에 32비트 RISC-V CPU를 가중치로 '컴파일'해 넣어, 외부 도구나 런타임 없이 모델의 순전파 안에서 산술, C, MicroPython 코드를 실행하는 실험 모델을 공개했다. 학습 없이 컴파일러가 가중치를 직접 설정하며, Gated DeltaNet 층의 게이트와 쓰기 강도를 1로 두고 원-핫 키를 쓰면 상태 행렬이 정확한 RAM처럼 동작한다는 점을 이용했다. CPU는 Qwen의 32개 층 앞에 11개 층으로 붙고 원래 가중치는 그대로이며, 공식 riscv-tests를 통과하고 1,800만 명령을 오류 없이 실행했다. NUPA 장정수 산술 정확도는 48.6%에서 100%로 올랐고, 일반 텍스트 출력은 기본 Qwen과 노이즈 수준의 차이(KL 6e-4)라고 한다. 다만 층이 늘고 은닉 차원이 넓어져 체크포인트가 기본 Qwen의 약 두 배인 18.8GB이고(대부분은 0 패딩), 전용 드라이버(RvChat)가 필요하며, 명령마다 토큰 몇 개를 생성해야 해 느리다는 한계도 밝혔다.

**왜 중요한가:** 정확한 계산을 외부 도구에 맡기는 대신 모델 구조 안에 결정론적 실행 장치를 심을 수 있다는 새로운 방향을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36206) · [원문 (divagr.com)](https://divagr.com/blog/qwenputer)

## 3. AAII v5 공개 - 비공개 평가 비중을 60%로 높인 AI 모델 역량 지수

Artificial Analysis가 Intelligence Index v5를 공개했다. 지수의 60%를 비공개 테스트 세트나 비공개 정답 기반 평가로 구성했고, FrontierCode 2.0과 Terminal-Bench-Science를 새로 넣고 HLE-Diamond, AA-Omniscience v1.1, CritPt v2를 개편했으며, 지식 노동, 코딩, 과학, 일반 영역에 각각 25%씩 가중치를 준다. 결과는 Claude Opus 5.5(max) 58점, GPT-6 Astra(max) 57점, GPT-6.1 Sol(max) 55점 순이고 Gemini 4 Argon(high)은 50점이다. 오픈 웨이트와의 격차는 3점에서 12점으로 벌어졌는데, 최고 오픈 웨이트로 분류된 Kimi K3.1 Pro(가중치는 아직 공개 전)가 46점, 가중치가 실제로 공개된 모델 중에서는 DeepSeek V4.1 Flash 1017과 GLM-5.3이 32점이다. 상위 모델 간 과제당 비용은 13배 이상(GPT-6.1 Terra 0.96달러, Claude Fable 5.1 13.04달러) 차이가 났고, 모델 능력을 시간 축에 놓는 Progress Index v1도 함께 나왔다.

**왜 중요한가:** 공개 벤치마크가 학습 데이터에 오염되기 쉬운 상황에서 비공개 평가 중심으로 다시 측정하니 최상위 모델과 오픈 모델의 격차가 오히려 크게 벌어졌다.

- [GeekNews](https://news.hada.io/topic?id=36197) · [원문 (Artificial Analysis)](https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5)

## 4. NVIDIA Nemotron 3.5 Transcribe - 한국어 포함 40개 언어를 지원하는 공개 음성 인식 모델

NVIDIA가 전사, 화자 구분, 번역, 오디오 질의응답을 하나의 공개 가중치 모델로 제공하는 Nemotron 3.5 Transcribe를 공개했다. 40개 언어 전사, 31개 언어와 영어 사이의 양방향 번역, 13개 언어 화자 구분을 지원하며, 최대 1시간 녹음과 화자 8명까지 처리한다. "화자를 표시해 전사해 줘", "회의에서 어떤 결정이 내려졌나?"처럼 자연어 지시로 출력 형태를 바꿀 수 있고 단어 단위 타임스탬프도 지원하지만, 실시간 스트리밍이 아니라 녹음된 오디오용이다. Hugging Face Open ASR 리더보드(영어)에서 공개 가중치 모델 중 1위(평균 WER 5.33%)이며, 전체 300억 파라미터 중 토큰당 약 40억만 활성화되는 하이브리드 Mamba–Transformer MoE 구조다. 함께 공개한 Granary v2 데이터는 48개 언어, 46만 3,062시간 분량이고, 지금은 vLLM이나 SGLang-Omni로 쓸 수 있으며 양자화 버전으로 RTX, DGX Spark 등에서의 로컬 실행도 예고했다.

**왜 중요한가:** 한국어 전사와 화자 구분, 회의 요약형 질의까지 하나의 공개 모델로 처리할 수 있어, 상용 API 없이 음성 기록을 다루는 선택지가 넓어진다.

- [GeekNews](https://news.hada.io/topic?id=36196) · [원문 (Hugging Face 블로그)](https://huggingface.co/blog/nvidia/nemotron-transcribe-granary)

## 5. kern - AI 생성 코드를 매번 새 컨테이너에서 실행하는 경량 루트리스 런타임

kern은 데몬이나 소켓 없이 정적 바이너리 하나로 실행되는 루트리스 컨테이너 런타임이자 샌드박스로, 에이전트의 도구 호출과 LLM이 만든 코드를 커널이 강제하는 컨테이너 안에서 실행한다. 유휴 상태에서 메모리 사용량은 0이고, 실제 OCI 이미지를 다루며(pull, build, push 등) 컨테이너가 수 밀리초 안에 뜨고 기존 `docker-compose.yml`도 그대로 쓸 수 있다고 한다. Python·Node용 kern-sandbox SDK와 Claude Code, Cursor, Claude Desktop, LM Studio용 MCP 서버를 제공해, 파일과 네트워크는 명시적으로 허용할 때만 쓸 수 있게 한다. 자체 벤치마크로는 단일 컨테이너 실행이 `docker run --rm`보다 80배, 200개 동시 실행은 130배 빠르다고 주장한다. 네임스페이스 6종, seccomp 허용 목록, cgroup v2 제한을 기본 적용하고 공개된 컨테이너 런타임 탈출 취약점 25건을 재현해 점검한다고 밝히며, 라이선스는 Apache-2.0이다.

**왜 중요한가:** 에이전트가 만든 코드를 그대로 실행하는 일이 늘면서, 가볍고 빠르면서도 격리가 확실한 실행 환경이 에이전트 도구의 기본 부품이 되어 가고 있다.

- [GeekNews](https://news.hada.io/topic?id=36200) · [원문 (GitHub)](https://github.com/getkern/kern)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
