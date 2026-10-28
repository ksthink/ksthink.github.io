---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 28일 — 에이전트 시대, 사람이 알아야 할 것"
date: 2026-10-28
slug: geeknews-daily-2026-10-28
tags: [GeekNews, 기술뉴스, 데일리요약, AI, 에이전트, 저작권]
published: true
---

오늘 GeekNews에서는 에이전트가 코드를 대신 쓰는 시대에 개발자가 여전히 알아야 할 것이 무엇인지 묻는 글이 가장 눈에 띄었다. Claude로 신약 개발을 앞당기고 있다는 Anthropic의 중간 보고와, 팀 맞춤형 에이전트를 코드로 만들어 배포하는 Cursor Agent SDK도 함께 올라왔다. AI 학습 데이터를 둘러싼 Stanford 교수들의 소송, AI가 쓴 글을 찾아 정리하는 위키백과 편집자들의 이야기까지 다섯 개를 정리한다.

## 1. 여기엔 괴물이 있다: 에이전트가 일을 할 때도 무엇을 알아야 할까?

필자는 Codex가 만든 `App.tsx`가 SonarQube에서 순환 복잡도 문제로 걸린 일을 계기로, 직접 보지 않은 코드를 책임져야 하는 상황을 이야기한다. 그 코드는 결국 문제가 없었고 리팩터링을 거쳐 배포됐다. 필자는 앞으로 시스템을 '소유'하는 데 중요한 것은 코드를 직접 썼느냐가 아니라, 무언가 잘못됐을 때 알아챌 만큼 알고 필요할 때 깊이 파고들 수 있는 능력이라고 주장한다. "모든 줄을 읽어라"와 "코드는 보지도 말라"는 양극단은 모두 틀렸고, 손으로 부딪히며 배우던 기존 성장 경로는 주니어에게 경제적으로 더는 가능하지 않다고 지적한다. 대안으로 자료구조·알고리즘, 네트워크, 동시성, 분산 시스템 같은 기초와 폭넓은 교양, 필요할 때 바로 깊이 들어가는 'just-in-time depth'라는 세 기둥을 제시하며, 쿠버네티스 책에서 읽은 '레벨 트리거 상태 머신' 개념으로 불안정하던 자신의 에이전트 오케스트레이터를 다시 설계한 경험을 예로 든다.

**왜 중요한가:** 에이전트에게 일을 맡길수록 개발자의 역량을 코드 작성량이 아니라 이상을 알아채고 파고드는 능력으로 다시 정의해야 한다는 점을 구체적으로 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36162) · [원문 (adrq.dev)](https://blog.adrq.dev/here-be-monsters-what-do-you-still-need-to-know-when-agents-do-the-work)

## 2. Claude를 활용한 신약 개발 가속화의 초기 진전

Anthropic은 BigHat Biosciences, Bristol Myers Squibb, Divergence Labs, Enveda, Generate Biomedicines, The Column Group 등 6곳과 신약 개발 연구 협력을 진행했고 자체 신약 탐색도 시작했다고 밝혔다. Generate Biomedicines에서는 Claude Code가 CAR-T 치료의 유전 지시 일부를 약 70% 짧게 설계했고, 실험에서 수용체 생성이 약 10배 늘었다고 한다. Divergence Labs에서는 약 한 달 동안 항체 설계 약 3만 5천 개를 거의 자율적으로 만들었고, Enveda에서는 제조 문서 1,061쪽을 검토하며 사람이 찾은 문제 11건을 모두 잡았고 사람이 놓친 7건도 추가로 짚어 검토 시간을 89%(25시간 이상에서 3시간 미만) 줄였다. 1인 회사 Mithril Medicine도 인수했는데, 이 회사의 근이영양증 치료 후보는 18개월이 안 돼 아이디어에서 쥐 실험 성과까지 갔고 순조로우면 이르면 2028년 말 임상시험을 시작할 수 있다고 본다. 다만 Anthropic은 연구 대부분이 아직 전임상 단계라고 스스로 밝혔다.

**왜 중요한가:** AI 모델 회사가 협력 연구를 넘어 회사 인수와 자체 신약 탐색까지 나서며, 생명과학을 직접 사업 영역으로 삼기 시작했다는 신호다.

- [GeekNews](https://news.hada.io/topic?id=36156) · [원문 (Anthropic)](https://www.anthropic.com/research/early-progress-drug-development)

## 3. Cursor Agent SDK, 팀 맞춤형 AI 에이전트를 코드로 만들고 배포하는 프레임워크

Cursor가 자사 관리형 에이전트인 Bugbot, Security Reviewer, Rollouts를 만들 때 쓰는 프레임워크를 Agent SDK로 공개했고, 정식 출시(GA) 상태라고 밝혔다. 에이전트는 코드로 정의하는데, 프롬프트는 Markdown으로, 도구는 TypeScript 함수로 작성해 일반 소프트웨어처럼 버전 관리와 리뷰를 거칠 수 있다. `agent-sdk deploy` 한 번으로 Cursor 인프라에 배포돼 URL이 부여되고, 단일 Node 프로세스로 돌기 때문에 컨테이너에 담아 자체 인프라에서 실행할 수도 있다. GitHub·GitLab·Bitbucket PR 이벤트에 반응하는 코드 리뷰 에이전트, 서브에이전트 병렬 분담, eval과 이벤트 재생 기능을 기본으로 지원하며, Cursor 내부 팀이 하루 만에 만든 kb-reviewer와 PGA Tour의 활용 사례도 소개했다.

**왜 중요한가:** 팀마다 필요한 에이전트를 프롬프트 설정이 아니라 리뷰 가능한 코드로 관리하는 방식이 개발 도구 회사의 정식 제품으로 자리 잡고 있다.

- [GeekNews](https://news.hada.io/topic?id=36138) · [원문 (Cursor)](https://cursor.com/blog/agent-sdk)

## 4. Stanford Daily "Anthropic, 불법 입수한 Stanford 교수들의 책으로 Claude 학습"

Stanford Daily는 Anthropic이 Tobias Wolff, Abraham Verghese, Chang-rae Lee 등 Stanford 교수 10여 명의 책을 불법으로 입수해 Claude 학습에 썼다고 전했다. 기사에 따르면 Bartz v. Anthropic 사건에서 William Alsup 판사는 해적판으로 영구적인 중앙 도서관을 만드는 것은 허용하지 않았지만, 합법적으로 산 책으로 학습하는 것은 공정 이용으로 봤고, 합의금은 약 50만 건의 저작물에 대해 15억 달러였다. Wolff와 Chang-rae Lee는 합의에서 빠져 2026년 5월 별도 소송인 Cruz v. Anthropic을 냈고, 합의 기준인 저작물당 약 3,000달러 대신 최대 15만 달러의 법정 손해배상을 배심 재판으로 구하고 있다. 원고들은 Anthropic이 LibGen, PiLiMi 같은 '섀도 라이브러리'에서 책을 내려받아 중앙 도서관에 저장했다고 주장한다. Stanford 법대의 Paul Goldstein은 미국에 저작자의 귀속권이 없다는 점을 문제로 짚었고, Authors Guild는 라이선스를 의무화하는 법 제정을 의회와 함께 추진하고 있다고 밝혔다.

**왜 중요한가:** 대규모 합의 이후에도 합의에서 빠진 저자들이 따로 소송을 이어 가면서, AI 학습 데이터의 출처 문제가 쉽게 끝나지 않을 것임을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36123) · [원문 (Stanford Daily)](https://stanforddaily.com/2026/10/27/professors-books-pirated-to-train-claude/)

## 5. 위키백과 편집자들이 AI 생성 글을 찾아내고 정리하는 방법

IEEE Spectrum이 2023년 시작된 자원봉사 활동 WikiProject AI Cleanup의 공동 창립자 Ellia Lebleu를 인터뷰했다. 이 프로젝트는 위키백과 지침을 어기는 AI 생성 글을 찾아 지운다. 초기에는 "stands as a testament" 같은 상투어로 쉽게 잡아냈지만, 2025년부터는 '셋의 법칙'이나 부정 병렬 구문 같은 구조적 신호와 비정상적인 작성 속도를 함께 본다고 한다. Lebleu가 가장 걱정하는 것은 출처 문제로, 아예 지어낸 인용보다 실제 출처를 찾고도 내용을 틀리게 옮기는 경우가 매우 흔하다고 말한다. Pangram으로 추정한 AI 생성 신규 글 비율은 2025년 말 약 20%에서 2026년 초 15~16%로 줄었지만 정책 효과인지 모델이 좋아진 결과인지는 아직 알 수 없다. 영어 위키백과는 LLM으로 글을 생성하는 것을 금지했고 위키미디어 재단은 Paste Check 도구와 AI 답변에 문서 정보를 보여 주는 출처 표시 체계를 개발하고 있다.

**왜 중요한가:** 가짜 인용보다 그럴듯하게 잘못 옮긴 출처가 더 흔하다는 현장의 증언은, AI 시대의 지식 검증이 출처를 직접 확인하는 일에 달려 있음을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36115) · [원문 (IEEE Spectrum)](https://spectrum.ieee.org/wikipedia-wikiproject-ai-writing-cleanup)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
