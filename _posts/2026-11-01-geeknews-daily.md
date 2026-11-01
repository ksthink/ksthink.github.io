---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 11월 1일 — AI가 여는 틈, AI가 막는 문"
date: 2026-11-01
slug: geeknews-daily-2026-11-01
tags: [GeekNews, 기술뉴스, 데일리요약, AI, 보안, 데이터베이스]
published: true
---

오늘 GeekNews에서는 공개 ChatGPT 공유 링크 하나만 열어도 계정의 비공개 대화가 새어 나갈 수 있었던 취약점 분석이 가장 먼저 눈에 띄었다. Claude가 비디오 게임 역공학 작업을 조용히 제한하기 시작했다는 보도, LLM에게 피해자의 '몸값'을 매기게 하는 정보 탈취 악성코드, "Full ACID"를 내건 AI용 데이터베이스에서 96개 문제를 찾아낸 Jepsen 보고서, 그리고 작은 모델 다섯 개로 꾸린 팀이 코딩 벤치마크에서 큰 모델과 겨룬 실험까지 다섯 개를 정리한다.

## 1. ChatGPT 공유 링크 하나로 계정을 탈취한 방법

Parameter는 2026년 10월, 공개 ChatGPT 공유 링크를 연 사용자의 로그인 세션 안에서 공격자의 JavaScript가 chatgpt.com 권한으로 실행되는 취약점을 찾았다고 밝혔다. 피해자는 링크를 여는 것 외에 아무것도 할 필요가 없었다. 이 코드로 대화 목록을 나열하고 한 번도 공유하지 않은 비공개 대화 내용을 읽어 외부 서버로 보내는 것까지 확인했다. 연구진은 이 코드가 피해자 권한으로 ChatGPT의 인증된 API를 직접 호출할 수 있어 사실상 계정을 탈취할 수 있었다고 설명한다. 공격 경로는 격리된 HTML 미리보기가 보낸 postMessage를 대화 속 그래프가 불러온 수학 라이브러리 MathLive가 발신자 검증 없이 받아, 가상 키보드 레이아웃 HTML을 메인 페이지에 그대로 넣는 데서 시작한다. 여기에 샌드박스 없는 srcdoc iframe이 chatgpt.com 출처를 얻는 점과, CSP가 허용한 YouTube oEmbed 엔드포인트의 JSONP 콜백 값이 응답에 그대로 들어가는 점을 엮어 스크립트를 실행했다. OpenAI는 10월 26일 이를 수정했고 P1 등급으로 분류했다.

**왜 중요한가:** 개별로는 사소해 보이는 검증 누락 여러 개가 이어지면 링크 클릭 한 번으로 AI 서비스에 쌓인 사적인 대화 전체가 노출될 수 있음을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36338) · [원문 (Parameter)](https://www.parameter.ai/labs/we-found-a-gap-at-openai)

## 2. "Anthropic, Claude의 비디오 게임 역공학 차단 조치" 보도

Mashable은 Tom's Hardware 보도를 인용해 Claude가 비디오 게임 코드의 모딩, 디컴파일, 역공학 작업을 조용히 제한하기 시작했으며 Anthropic의 공식 발표는 아직 없다고 전했다. 배경으로는 GTA6 유출과 Take-Two가 Microsoft와 Discord에 보낸 소환장, AI 덕분에 쉬워진 게임 디컴파일과 브라우저 포팅(WoW, CoD, GTA 바이스 시티), PS5 탈옥 이후의 크로스플랫폼 실행 사례가 꼽힌다. 기사는 Tom's Hardware 기자 Bruno Ferreira의 말을 빌려, 세상의 정보와 예술을 복제해 학습한 AI 기업이 이제 저작권 침해를 걱정하는 아이러니를 지적한다. 또 한 회사가 제한을 걸어도 악의적인 사용자는 제한 없는 다른 LLM으로 옮겨 갈 수 있어, 가장 덜 윤리적인 AI가 가장 인기를 얻는 역설적인 경쟁이 생길 수 있다고 본다.

**왜 중요한가:** AI 기업이 저작권 분쟁을 피하려 모델의 쓰임새를 공지 없이 좁히기 시작했다는 신호이자, 그런 제한이 실제로 효과가 있는지에 대한 질문을 함께 던진다.

- [GeekNews](https://news.hada.io/topic?id=36377) · [원문 (Mashable)](https://mashable.com/tech/anthropic-takes-steps-to-block-video-game-cloning-and-reverse-engineering)

## 3. 악성코드, LLM으로 피해자의 금전적 가치에 따라 순위를 매김

Cisco Talos가 분석한 자가 삭제형 Windows 정보 탈취 악성코드 VOLTA-AUTODOXER는 비밀번호, 쿠키, 카드 정보, 지갑 시드, 각종 세션 토큰을 훔친 뒤 피해자 정보를 구조화된 묶음으로 만들어 LLM에 보낸다. 훔친 세션으로 Gmail 구매 영수증, UberEats와 DoorDash 주문 내역, Discord 계정을 조회해 집 주소 같은 정보도 보강한다. 이 묶음은 "포렌식 정보 분석가로서 표적 평가서를 작성하라"는 시스템 프롬프트와 함께 OpenRouter로 전송되고, 현금화 가치 순위("WHAT THEY'RE WORTH")와 보안 습관 평가("THEIR OPSEC") 항목을 돌려받는다. 응답에 "I can't" 같은 거부 문구가 있으면 최대 세 개 모델로 이어지는 체인으로 넘어가도록 만들어져, 가드레일에 걸릴 것을 처음부터 예상하고 설계했음을 보여 준다. Talos는 AI가 전통적인 악성코드 기능이 아니라 운영자 대신 정보 분석가 역할을 맡는다는 것을 새로운 점으로 꼽는다.

**왜 중요한가:** 공격자가 LLM을 탈취 기술이 아니라 '누구를 먼저 털지' 고르는 분석 업무에 쓰기 시작했고, 모델 하나의 거부만으로는 이를 막기 어렵다는 점을 드러낸다.

- [GeekNews](https://news.hada.io/topic?id=36347) · [원문 (Cisco Talos)](https://blog.talosintelligence.com/appraisal-by-ai-model-driven-victim-prioritization-in-the-volta-infostealer/)

## 4. Jepsen: ParticleDB 1.1.4, AI용 데이터베이스의 정합성 검증에서 96개 문제 발견

Jepsen은 AI 워크로드용 멀티모델 데이터베이스 ParticleDB의 1.1.4부터 1.1.18.11.rc-22까지를 검사해 96개 문제를 찾았다. 충돌, 교착, 데이터 손실부터 지워지지 않는 반쯤 보이지 않는 행, 삭제한 테이블이 뒤틀린 형태로 되살아나는 현상, 문자열이 정수로 바뀌는 문제까지 있었다. 대부분 서버 한 대, 클라이언트 하나, 장애 없는 조건에서 재현돼 "Full ACID" 주장은 시기상조였다고 평가하며, 홈페이지는 "Full ACID. 159K TPS"를 내걸면서 바로 아래에 완전 격리가 아닌 snapshot isolation을 적어 두었다고 지적한다. 1.1.18.11.rc-22 시점에는 10개를 제외한 나머지 문제가 해결된 것으로 보였지만 기본 occ 모드에서 커밋된 쓰기를 잃었고, 가장 강한 serializable 수준에서도 Lost Update를 허용했다. 제조사 Orkes는 1.1.19-rc.13에서 남은 문제를 모두 고쳤다고 주장하며, 이번 연구 비용은 Orkes가 댔다.

**왜 중요한가:** AI 붐을 타고 나온 데이터베이스의 홍보 문구와 실제 보장 사이 간극을 독립 검증이 얼마나 크게 드러낼 수 있는지 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36353) · [원문 (Jepsen)](https://jepsen.io/analyses/particledb-1.1.4)

## 5. Memdoor: Qwen3.8-27B 모델 다섯 개로 꾸린 팀, LiveCodeBench Hard에서 Fable 5와 겨루다

Memdoor의 team-solve 워크플로는 계획자, 아이디어 제안자 두 명, 해결자, 검토를 맡는 관리자, 수리 담당 같은 작은 모델 여러 개가 각자 새 컨텍스트에서 시작해 디스크의 파일로만 소통하며 문제를 푸는 구조다. 성공 판정은 모델이 아니라 샘플을 실행하는 스크립트가 하며, GVS5H(Lee, 2026) 방법을 YAML 파일 8개로 옮겼다. LiveCodeBench Hard 첫 10문제를 다섯 번씩 풀어 50회 중 49회 성공, 평균 9.8점을 기록했고, 원 연구진의 하네스는 9.6점, Fable 5 단일 호출은 8.0점이었다. 다만 저자는 표본이 작아 9.8과 9.6은 같은 수치이며 주장하는 것은 향상이 아니라 동등성이라고 밝히고, 2025년 봄 대회 문제라 학습 데이터 오염 가능성도 배제할 수 없다고 적었다. 1회 실행의 중간값은 40분, 0.39달러였고 50회 전체 비용은 35.79달러였다.

**왜 중요한가:** 작은 공개 모델도 역할을 나누고 실행 기반 검증을 붙이면 큰 모델에 견줄 수 있다는 가능성을, 과장 없이 한계까지 밝힌 실험으로 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36373) · [원문 (GitHub)](https://github.com/guregodevo/memdoor/tree/main/examples/workflows/team-solve)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
