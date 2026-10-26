---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 26일 — 싸지는 AI와 코딩 에이전트의 진화"
date: 2026-10-26
slug: geeknews-daily-2026-10-26
tags: [GeekNews, 기술뉴스, 데일리요약, AI, 코딩에이전트, 오픈모델]
published: true
---

오늘 GeekNews에서는 AI가 빠르게 싸지고 있다는 소식이 두드러졌다. OpenAI와 Anthropic이 몇 달 만에 모델 가격을 최대 80% 내렸고, IBM CEO는 오픈 웨이트 모델이면 온프레미스에서도 충분하다고 말했다. Codex가 실패를 딛고 OpenAI의 핵심 제품이 되기까지의 과정, 명세를 중심에 둔 JetBrains의 에이전트 IDE, mRNA 맞춤형 암 백신의 3상 결과도 함께 정리한다.

## 1. OpenAI와 Anthropic, 몇 달 만에 LLM 가격을 최대 80% 인하

OpenAI와 Anthropic이 6월부터 9월 사이 주력 모델과 소형 모델의 가격을 잇달아 내렸다. OpenAI는 7월 GPT-5.6 Luna 가격을 80% 낮췄고, 9월에는 GPT-6 Sol과 GPT-6.1 Sol로 입력·출력 단가를 다시 절반 수준으로 끌어내렸다. Anthropic도 Opus 5.5를 Opus 5보다 싼 가격에 내놓으며 서비스에 필요한 연산량이 줄었다고 밝혔다. 글쓴이는 코딩 에이전트 비용의 대부분이 대화 이력을 반복해서 읽는 캐시 읽기에서 나오므로, 캐시 읽기 단가 인하가 실질 비용을 70~75%까지 줄였다고 분석한다. 그 배경으로는 DeepSeek와 Kimi 같은 공개 가중치 모델과, 이를 호스팅하는 여러 추론 업체 사이의 경쟁을 꼽는다. 그러면서, 전환 비용이 낮은 한, 고객을 묶어 둔 뒤 가격을 급격히 올리기는 어렵다고 본다.

**왜 중요한가:** 고객을 붙잡은 뒤 가격을 올릴 것이라는 예상과 달리, 오픈 모델과 추론 업체 간 경쟁이 대형 연구소의 가격을 실제로 끌어내리고 있음을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36009) · [원문 (minimaxir.com)](https://minimaxir.com/2026/10/cheap-llms/)

## 2. IBM CEO "오픈 웨이트 모델, 이제 온프레미스에서 성능도 좋고 싸다"

IBM CEO Arvind Krishna는 3분기 실적 발표에서 오픈 웨이트 모델이 최첨단 모델의 약 90% 효과를 내면서도 토큰 비용은 10~25% 수준이라고 말했다. 이메일 요약과 작성, 계약서 검토, 고객 전화 응대 같은 대부분의 기업 업무는 이런 저렴한 모델로도 충분히 처리할 수 있다는 것이다. IBM은 온프레미스 AI 인프라에 대한 관심이 급증하고 있으며, 대부분의 기업이 랙 2~3개로 쓸 만한 인프라를 꾸릴 수 있다고 본다. 다만 커널과 네트워크 전문 인력, GPU 배치를 고려한 클러스터 구성, 결과 캐싱 등 실제 운영은 쉽지 않을 것이라고 덧붙였다. IBM의 분기 매출은 171억 달러로 5% 늘었고, Red Hat을 중심으로 한 소프트웨어 부문이 성장을 이끌었다.

**왜 중요한가:** 오픈 모델의 성능 격차가 좁혀지면서, 기업들이 비싼 클라우드 API 대신 자체 인프라로 AI를 돌리는 선택지가 현실적인 대안이 되고 있다.

- [GeekNews](https://news.hada.io/topic?id=36024) · [원문 (The Register)](https://www.theregister.com/systems/2026/10/22/ibm-ceo-says-open-weight-models-are-now-irresistibly-good-and-cheap-on-prem/5304640)

## 3. Codex는 어떻게 탄생했나

Every가 OpenAI Codex의 개발 과정을 정리했다. 2025년 5월 출시한 클라우드 에이전트 Codex Cloud는 사용자가 개발 환경을 클라우드에 다시 꾸려야 하고 작업 도중 개입할 수 없으며 모델 성능도 부족해 시장에서 자리를 잡지 못했다. 팀은 로컬에서 실행하는 에이전트로 방향을 틀고, 공통 엔진을 Rust로 다시 작성해 터미널과 편집기, 데스크톱 등 여러 인터페이스에서 쓸 수 있게 했다. 2026년 2월 공개한 데스크톱 앱은 내장 코드 편집기를 과감히 빼고 여러 에이전트에 작업을 맡기는 방식에 집중했으며, 전용 모델의 성능 향상이 이 설계를 실용적으로 만들었다. Codex는 6월 주간 활성 사용자 500만 명을 넘었고, 7월에는 새 ChatGPT 데스크톱 앱의 기반이 됐다.

**왜 중요한가:** 모델 성능이 바뀌면 그에 맞는 인터페이스도 달라진다는 점을 보여 주며, 코딩 에이전트 제품이 어떻게 진화해 왔는지 이해하는 데 좋은 사례다.

- [GeekNews](https://news.hada.io/topic?id=36004) · [원문 (Every)](https://every.to/p/how-codex-happened)

## 4. JetBrains Thinkrail, 명세로 프로젝트 지식을 이어 가는 에이전트 IDE

JetBrains가 `pi` 코딩 에이전트를 중심에 둔 실험적 IDE ThinkRail을 Apache 2.0 라이선스로 공개했다. 코드 옆에 `SPEC.md` 파일 그래프를 두고 에이전트가 전용 도구로 이를 읽고 갱신하게 해, 세션이 끝나도 프로젝트의 의도와 결정이 남도록 했다. git worktree 기반 작업공간마다 브랜치를 분리해 여러 에이전트를 병렬로 돌리고, 변경 검토부터 GitHub PR 생성, CI 확인, 병합까지 한곳에서 처리한다. 세션별 모델과 토큰 사용량, 비용을 따로 볼 수 있고, 기존 Agent Skills와 MCP 서버도 그대로 연결할 수 있다. Hacker News에서는 AI가 쓴 듯한 README와 JetBrains Air 등 비슷한 제품이 잇따르는 데 대한 비판도 나왔다.

**왜 중요한가:** 에이전트가 세션마다 맥락을 잃는 문제를 명세 문서로 풀려는 시도로, 전통 IDE 업체가 에이전트 중심 개발 환경에 어떻게 대응하는지 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=35994) · [원문 (GitHub)](https://github.com/JetBrains/thinkrail)

## 5. Moderna와 Merck의 mRNA 암 백신, 흑색종 재발·사망 위험 42% 감소

Moderna와 Merck가 개인 맞춤형 mRNA 암 백신 intismeran(mRNA-4157)의 흑색종 3상 임상 결과를 발표했다. 수술로 종양을 제거한 IIB~IV기 환자 1,137명을 대상으로, 백신과 면역항암제 Keytruda를 함께 투여한 군은 Keytruda와 위약을 받은 군보다 재발 또는 사망 위험이 42% 낮았다. 2년 뒤 재발 없이 생존한 비율은 병용군 82%, 대조군 70%였고, 원격 전이 또는 사망 위험도 38% 줄었다. 백신은 환자의 암세포와 정상세포 유전자를 비교해 고른 암 특이적 변이를 최대 34개까지 담는다. 효과 크기는 2상보다 작았으며, 두 회사는 승인을 위해 규제 당국과 협의하고 있다.

**왜 중요한가:** 환자마다 다르게 설계하는 mRNA 치료제가 대규모 3상에서 표준 치료보다 의미 있는 개선을 보이며, 맞춤형 암 치료가 현실에 한 걸음 더 다가섰다.

- [GeekNews](https://news.hada.io/topic?id=35995) · [원문 (Ars Technica)](https://arstechnica.com/health/2026/10/personalized-mrna-cancer-vaccine-cut-melanoma-death-recurrence-by-42/)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
