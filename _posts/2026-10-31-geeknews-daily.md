---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 31일 — 도구를 믿는 대가"
date: 2026-10-31
slug: geeknews-daily-2026-10-31
tags: [GeekNews, 기술뉴스, 데일리요약, AI, 보안, 오픈소스]
published: true
---

오늘 GeekNews에서는 Cursor 마켓플레이스에 올라온 Claude Code 확장 번들에 SSH 백도어가 숨어 있었다는 분석이 가장 먼저 눈에 띄었다. 직원들에게 AI 활용을 해명하게 하려던 Proton CEO의 '재면접' 취소, AI가 SRE의 숙련도를 갉아먹는다는 경고, 젊은 엔지니어에게 토큰을 무제한으로 주고 레거시 코드를 다시 쓰게 한 Cisco, 그리고 Qwen 가중치 안에 NES를 통째로 컴파일해 넣은 프로젝트까지 다섯 개를 정리한다.

## 1. Phorion 분석: Cursor 마켓플레이스의 Claude Code 확장에 SSH 백도어

Phorion에 따르면 Cursor 마켓플레이스에 올라온 공식 Claude Code for VS Code 확장 번들 2.1.312와 2.1.313 버전에 macOS, Linux, Windows용 지속형 SSH 백도어가 들어 있었고, Cursor는 해당 버전을 마켓플레이스에서 내렸다. 변조된 extension.js 앞부분에는 즉시 실행 함수가 붙어 있어 사용자가 아무것도 하지 않아도 파일이 로드되는 순간 실행되며, 공격자 공개키를 ~/.ssh/authorized_keys에 추가하고 SSH 서버를 켜려고 시도한다. 이어 공격자 서버로 역방향 SSH 터널을 열고, macOS에서는 com.apple.sysmond.plist라는 LaunchAgent로 위장해 재부팅 후에도 살아남으며, 호스트명, 사용자명, Git 이메일, 공인 IP 같은 정보도 보낸다. macOS에서는 코드의 버그로 SSH 활성화 단계가 실행되지 않지만, 원격 로그인이 이미 켜져 있으면 백도어가 그대로 작동하므로 이를 방어책으로 기대면 안 된다고 지적한다. Phorion은 이 버전을 쓴 조직에 즉시 점검과 사고 대응을 권고한다.

**왜 중요한가:** 개발자가 매일 쓰는 AI 코딩 도구의 확장 배포 경로가 곧바로 개발 장비 전체를 여는 공급망 공격 통로가 될 수 있음을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36295) · [원문 (Phorion)](https://phorion.io/blog/offical-claude-code-vsx-compromise/)

## 2. Proton CEO, AI 활용 '재면접' 취소

Proton CEO Andy Yen이 직원들에게 AI 활용 방식을 설명하게 하려던, 거의 전사 규모의 '재면접'을 취소했다. 404 Media는 현직 직원 6명의 증언과 약 2시간 분량의 전사 회의 녹음을 근거로 이를 보도했는데, 취소는 404 Media가 Yen의 공격적인 AI 추진을 다룬 조사 기사를 낸 다음 날 이뤄졌다. 그 기사에는 새 코드를 배포 전 며칠간 펜테스트하자는 직원 의견에 Yen이 "패배자 사고방식"이라고 답한 대화가 담겨 있었다. Yen은 회의에서 소통 실패를 인정하면서도 앞으로도 계속 밀어붙이겠다고 했고, 다음 달 조직 개편은 하되 AI로 인한 감원은 없다고 말했으며, CTO Bart Butler는 "우리가 망쳤다"고 인정했다. 한 직원은 재면접에서 보려던 항목이 성과 평가에 들어가게 됐다며 "피해 수습으로 보인다"고 말했고, Yen의 Reddit 해명 글은 1,200회 넘게 비추천을 받았다.

**왜 중요한가:** AI 도입을 위에서 밀어붙이는 방식이 보안 문화, 직원 신뢰와 어떻게 부딪히는지 프라이버시 기업의 내부 사례로 드러냈다.

- [GeekNews](https://news.hada.io/topic?id=36304) · [원문 (404 Media)](https://www.404media.co/protons-ceo-cancels-ai-re-interviews/)

## 3. AI는 SRE를 대체하는 게 아니라 숙련도를 떨어뜨리고 있다

SigNoz 뉴스레터의 이 글은 AI가 장애 대응의 95%를 처리하면 정말 중요한 나머지 5%를 다루는 사람의 능력은 떨어지지 않느냐고 묻는다. 출발점은 1983년 Lisanne Bainbridge의 논문 'Ironies of Automation'으로, 자동화할수록 드문 실패의 순간에 사람이 더 중요해지지만 연습할 기회는 줄어든다는 역설이다. 알려진 문제는 완전히 자동화되고, 부분적으로만 이해된 문제는 AI가 추천하고 사람이 검증하며, 처음 보는 복합 장애만 사람이 주도하게 되면 SRE는 직관을 쌓을 반복 경험을 잃는다는 것이다. 글은 AI 보조를 쓴 내시경 의사의 비보조 용종 발견율이 28%에서 22%로 떨어진 연구, 자동조종 의존으로 조종 능력이 떨어져 FAA가 수동 비행 시간을 더 요구하게 된 사례를 든다. 원래 있던 능력을 잃는 '디스킬링'보다 처음부터 능력을 익히지 못하는 '네버스킬링'이 더 걱정스럽다며, 사람이 날카로움을 유지하도록 설계된 AI가 필요하다고 결론짓는다.

**왜 중요한가:** AI 운영 도구의 성공 지표를 처리량만이 아니라 그 도구를 쓰는 사람의 실력이 유지되는지까지 넓혀 봐야 한다는 문제를 제기한다.

- [GeekNews](https://news.hada.io/topic?id=36299) · [원문 (SigNoz 뉴스레터)](https://newsletter.signoz.io/p/ai-isnt-replacing-sres-its-deskilling)

## 4. Cisco, 레거시 코드 재작성을 위해 엔지니어에게 AI 토큰 무제한 제공

Cisco 사장 겸 최고제품책임자 Jeetu Patel은 27세 직원 Padmanabhan Krishnamurthy에게 레거시 코드 리팩터링을 맡기며 "토큰을 무제한으로 줬다"고 Fortune에 말했다. Krishnamurthy는 Cisco가 2025년 인수한 실시간 번역 스타트업 EzDubs의 공동창업자다. 그는 두 명짜리 팀으로 Cisco의 레거시 코드를 다시 쓸 수 있다고 봤고, 4주 안에 가능성을 증명한 뒤 24개월 안에 레거시 코드의 98%를 리팩터링하는 것을 목표로 한다. Patel은 경력 초기 인재를 뽑지 않으면 새 아이디어가 들어올 곳이 없다며, 자기 팀을 숙련 운영자, 외부 시각의 시스템 사상가, AI 네이티브 창업자형 인력으로 각각 3분의 1씩 꾸린다고 설명했다. 기사는 Thrive Capital 창업자 Josh Kushner, Tastewise CEO Alon Chen, Will.i.am 등 경험이 적은 젊은 인재를 선호하는 다른 사례도 함께 소개한다.

**왜 중요한가:** 대기업이 젊은 엔지니어에게 AI 토큰을 무제한으로 주고 소수 인력으로 레거시 코드를 다시 쓰려는 시도와, 그 과정에서 신입급 인재를 어떻게 다시 보는지 구체적인 목표치와 함께 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=36324) · [원문 (Fortune)](https://fortune.com/2026/10/30/cisco-president-jeetu-patel-gen-z-27-year-old-unlimited-ai-tokens-rewrite-legacy-code-entry-level-jobs/)

## 5. 약 1GB의 Qwen 가중치 안에서 돌아가는 NES, nesformer

nesformer는 NES의 6502 CPU, 2KB 작업 RAM, 카트리지 프로그램 ROM을 일반 Qwen3.5 모델 체크포인트의 가중치 안에 '컴파일'해 넣은 프로젝트로, 가중치는 학습한 것이 아니라 컴파일러가 하나하나 계산했다. 게임을 실행하면 모델이 CPU 실행 로그를 토큰 단위로 예측하고, 작은 호스트 프로그램이 화면 그리기와 컨트롤러 입력, vblank 인터럽트를 맡는다. CHIP-8과 RISC-V CPU를 Qwen3.5-4B에 컴파일한 Qwenputer를 바탕으로, 모델의 Gated DeltaNet 상태를 기계의 메모리로 쓰는 핵심 기법을 재사용했다. Super Mario Bros. 1-1 등을 구동한 데모가 있고, 포함된 테스트 게임에서는 모든 프레임이 일반 6502 에뮬레이터의 출력과 정확히 일치했다고 밝힌다. 라이선스는 MIT다.

**왜 중요한가:** 언어 모델의 구조가 학습 없이도 정확한 범용 계산기로 쓰일 수 있음을 실제로 돌아가는 게임으로 증명해, 트랜스포머 내부를 이해하는 색다른 실험이 된다.

- [GeekNews](https://news.hada.io/topic?id=36318) · [원문 (GitHub)](https://github.com/dbreunig/nesformer)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
