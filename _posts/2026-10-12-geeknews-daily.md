---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 12일 — Zod 악성 커밋 소동, LLM 인식 격차, 1~2명이 떠받치는 오픈소스"
date: 2026-10-12
slug: geeknews-daily-2026-10-12
tags: [GeekNews, 기술뉴스, 데일리요약, 보안, 오픈소스, AI]
published: true
---

오늘 GeekNews에서는 오픈소스 공급망과 AI 시대의 일하는 방식이 함께 화제가 됐다. 널리 쓰이는 TypeScript 검증 라이브러리 Zod의 저장소에서 외부 코드를 내려받아 실행하는 커밋이 발견됐고, 핵심 오픈소스의 절반 가까이가 한두 사람에게 기대고 있다는 분석도 나왔다. 한편 Karpathy는 LLM 능력을 둘러싼 인식 격차가 벌어지고 있다고 짚었고, AI에 코드를 맡겨도 설계 판단은 사람 몫이라는 글과 Uber의 MCP 플랫폼 설계기도 주목받았다.

## 1. Zod 4.6.6, 악성코드에 감염됐나?

TypeScript 스키마 검증 라이브러리 Zod의 GitHub 저장소에서 버전을 4.6.5에서 4.6.6으로 올리는 커밋에 수상한 파일이 섞여 있었다는 사실이 알려졌다. “버그 수정 및 성능 개선”이라는 제목의 이 커밋은 zod와 @zod/mini에 `meta.test.mjs`를 추가했다. 이 코드는 Ethereum RPC로 특정 컨트랙트를 조회해 도메인 목록을 얻고, 각 도메인의 `/loader`에서 받은 Base64 데이터를 임시 디렉터리에 풀어 JavaScript로 실행한 뒤 흔적을 지운다. package.json에는 `"preinstall": "node meta.test.mjs"`가 들어갔고(scripts 안이 아닌 최상위 필드), 릴리스 워크플로에는 main 브랜치 푸시만으로 배포가 돌도록 하는 조건이 추가됐고, “유지보수자가 수동으로 실행하고 승인한다”는 주석은 지워졌다. Zod 이슈 #6658에 따르면 이 커밋은 기록상 9월 21일 ‘Cleanup bad commits’ PR로 되돌려졌고, 10월 12일 새벽(KST) npm에 올라온 4.6.6에는 해당 파일과 preinstall 스크립트가 없다. 다만 계정 탈취 여부나 외부 페이로드의 실제 동작은 아직 공식 확인되지 않았다.

**왜 중요한가:** 주간 npm 다운로드가 3억 건을 넘는 패키지라도 저장소에 악성 코드가 버젓이 커밋될 수 있다. 배포 승인 절차를 없애려는 시도까지 함께 들어 있었다는 점에서 공급망 방어선을 다시 점검하게 만든다.

- [GeekNews](https://news.hada.io/topic?id=35238) · [원문 (GitHub 커밋)](https://github.com/colinhacks/zod/commit/d821685ea6732436fcdf786a81d076958471e467)

## 2. LLM의 능력에 대한 인식 격차가 커지고 있다

Andrej Karpathy가 4월에 쓴 트윗을 다시 꺼내며, LLM 능력에 대한 사람들의 이해 차이가 ‘서로 말이 엇갈리는 두 집단’을 넘어 가파른 깔때기 모양으로 벌어지고 있다고 진단했다. 그의 대략적 추산으로 약 60억 명(인구의 75%)은 LLM을 거의 써 보지 않았고, 10억~20억 명은 무료 챗봇을 조금 나은 검색이나 글쓰기 보조로 가끔 쓴다. 수학·코드 분야에서 최첨단 모델을 전문적으로 쓰는 약 2,000만 명은 몇 주에서 몇 달 걸리던 작업을 에이전트가 끝내는 모습을 직접 보고 있다. 내부 최첨단 시스템에 접근하는 약 5,000명은 수천 개 에이전트가 몇 주씩 협업하는 모습을 보고 있으며, 사람의 검토가 그 속도를 따라가지 못하는 단계에 와 있다. 그는 격차의 원인으로 다루는 문제의 규모와 기간, 검증 가능한 디지털 분야에 쏠린 능력, 무료·유료·내부 시스템 사이의 접근 차이를 꼽았다.

**왜 중요한가:** 같은 ‘AI’를 두고 경험한 수준이 이렇게 다르면 정책, 투자, 조직 내 도입 논의가 서로 다른 전제 위에서 진행될 수밖에 없다.

- [GeekNews](https://news.hada.io/topic?id=35202) · [원문 (X, @karpathy)](https://twitter.com/karpathy/status/2109361546505966046)

## 3. 핵심 오픈소스 프로젝트 23개 중 11개, 1~2명이 운영

휴대전화, 브라우저, 서버가 의존하는 오픈소스 23개의 공개 이력을 분석한 결과, 11개 프로젝트는 지난 1년(2025년 10월 7일~2026년 10월 7일) 동안 변경을 10회 이상 올린 정기 기여자가 1~2명뿐이었다. 2024년 백도어 사건을 겪은 xz는 지금도 Lasse Collin 혼자 변경의 97%를 맡고 있고, 새 자금 지원은 확인되지 않았다. 시간대 데이터베이스는 UCLA의 Paul Eggert와 대체 담당자 한 명이 수십억 대 기기의 시계를 책임진다. Sovereign Tech Agency, Alpha-Omega, Open Collective, GitHub Sponsors 네 경로를 살펴본 결과 SQLite, zlib, bash 등 8개 프로젝트에서는 공개 보조금을 찾지 못했다. 반면 OpenSSL은 Heartbleed 이후 유급 개발자와 감사를 확보해 정기 기여자가 2013년 6명에서 2026년 32명으로 늘었다. 커밋 수가 검토·버그 분류·보안 대응 같은 일을 담지 못한다는 한계는 분석 글도 인정한다.

**왜 중요한가:** 모두가 쓰는 기반 소프트웨어가 한 사람의 여력에 기대는 구조는 공정성 문제이자, xz 사례가 보여 준 것처럼 그대로 보안 위험이 된다.

- [GeekNews](https://news.hada.io/topic?id=35196) · [원문 (Linux Stans)](https://linuxstans.com/11-of-23-core-open-source-projects-run-on-1-or-2-people/)

## 4. 미안하지만, 여전히 직접 생각해야 합니다

DHH가 AI 에이전트에 맡겨 Campfire Once를 Rails에서 Rust, Elixir 등으로 재작성한 사례를 Piotr Sarnacki가 뜯어봤다. Rust 버전은 CSRF 토큰을 빼고 Redis를 프로세스 내부 큐로 바꾸는 등 하위 호환성을 지키지 않은 반면 Elixir 버전은 원본에 가까워, 결과를 언어 간 성능 비교로 보기 어렵다고 지적한다. 생성된 코드에도 SQL 쿼리를 한 프로세스가 순차 처리하거나 비동기 작업 안에서 블로킹 호출을 하는 문제가 있었다. 요청이 일정한 속도로 들어오는 방식으로 그가 직접 다시 측정해 보니, Rust의 이벤트 버퍼를 256에서 16384로 늘리자 전달률은 약 14%에서 약 90%로 올랐지만 최대 전달 지연도 11초에서 130초 이상으로 늘었다. 프롬프트가 구체적이지 않으면 호환성, 지연과 처리량, 메모리 한도 같은 선택을 모델이 대신 정해 버리므로, 실패 방식과 자원 한도는 여전히 사람이 설계해야 한다는 결론이다.

**왜 중요한가:** “이제 코드를 안 읽어도 된다”는 흐름 속에서, 단일 지표 벤치마크와 AI 생성 코드를 비판적으로 읽어야 하는 이유를 구체적인 수치로 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=35189) · [원문 (It's all about the bit)](https://itsallaboutthebit.com/i-am-sorry-but-you-still-have-to-think/)

## 5. MCP Gateway - 기존 API를 MCP 도구로 통합하는 Uber의 플랫폼 설계

Uber가 팀마다 따로 만들던 MCP 연동을 하나로 묶은 MCP Gateway의 설계를 공개했다. 제어 평면인 MCP Registry가 서버와 도구의 검색·소유권·활성화를 관리하고, 데이터 평면인 Proxy Gateway가 MCP 요청을 HTTP, gRPC, TChannel 호출로 바꿔 기존 백엔드를 고치지 않고 실행한다. 현재 800개 이상의 서버와 5,000개 이상의 도구를 운영한다. AutoCrawler는 Protobuf·Thrift 정의와 네이티브 MCP 서버에서 도구를 자동으로 찾아 LLM으로 설명을 만들되, ‘발견이 곧 노출은 아니다’라는 원칙에 따라 기본 비활성 상태로 등록하고 소유 팀이 검토해야 켜진다. 도구 단위 접근 제어와 응답의 개인정보 제거를 공통으로 적용하며, 단계적 도구 탐색(Omni MCP), 필요한 필드만 돌려받는 Response Projection, 결과를 파일로 다루는 Code Mode로 컨텍스트 사용량을 줄였다.

**왜 중요한가:** 수천 개 내부 API를 에이전트에 안전하게 열어 주려는 조직에, 거버넌스와 컨텍스트 비용을 함께 다루는 구체적인 참고 설계가 된다.

- [GeekNews](https://news.hada.io/topic?id=35213) · [원문 (Uber Engineering Blog)](https://www.uber.com/in/en/blog/designing-mcp-gateway/)

---

이 글은 [GeekNews](https://news.hada.io)에 오늘 올라온 소식 가운데 다섯 편을 골라 요약한 것이다. 자세한 내용과 토론은 각 GeekNews 링크와 원문에서 볼 수 있다.

`#GeekNews` `#기술뉴스` `#데일리요약` `#보안` `#오픈소스` `#AI`
