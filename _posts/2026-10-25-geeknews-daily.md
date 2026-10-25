---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 25일 — 의존성 보안 경보와 흔들리는 표준"
date: 2026-10-25
slug: geeknews-daily-2026-10-25
tags: [GeekNews, 기술뉴스, 데일리요약, 보안, AI, 오픈소스]
published: true
---

오늘 GeekNews에서는 보안과 표준, 플랫폼 책임을 둘러싼 소식이 눈에 띄었다. Brotli 압축 해제 취약점이 Node.js를 넘어 Python과 Bun, Envoy까지 번졌고, C++26 표준안은 ISO 투표에서 부결됐다. 조 단위 매개변수 모델을 웨이퍼에 나눠 돌리는 Cerebras의 배포 방식, 덴마크 부처의 MS Office 대체 실험 중단, 브라질 선거법원과 Meta의 공방도 함께 정리한다.

## 1. Node2Shell, Brotli 원격 코드 실행 취약점이 Python과 Bun, Envoy로 번져

Node.js에서 Node2Shell로 처음 알려진 Brotli 압축 해제 취약점(CVE-2026-111497)이 같은 디코더를 쓰는 Python 패키지와 Bun, Envoy, Istio에서도 확인됐다. 조작된 압축 데이터를 처리하면 메모리 경계 밖 쓰기가 일어나 정보 유출이나 충돌, 원격 코드 실행으로 이어질 수 있으며, 서버가 받는 요청 본문뿐 아니라 HTTP 클라이언트가 받아 오는 외부 응답도 공격 경로가 된다. Python에서는 다른 패키지와 함께 설치된 Brotli를 urllib3나 requests 같은 HTTP 라이브러리가 자동으로 사용하므로, 코드에서 직접 불러오지 않아도 영향을 받을 수 있다. 원문 작성 시점에는 취약점 데이터베이스에 PyPI 패키지 정보가 빠져 있어 pip-audit나 Dependabot도 이를 잡아내지 못했다. 수정 버전은 Python Brotli 1.2.1, brotlicffi 1.2.1.0, Bun 1.4.4 등이며, 요청 헤더에서 `Accept-Encoding: br`을 빼는 것만으로는 방어할 수 없다.

**왜 중요한가:** 직접 쓰지도 않는 압축 라이브러리 하나가 여러 언어와 인프라에 걸친 원격 코드 실행 경로가 될 수 있다는 점에서, 실제 설치된 의존성 트리 전체를 점검해야 할 이유가 생겼다.

- [GeekNews](https://news.hada.io/topic?id=35927) · [원문 (Aikido 블로그)](https://www.aikido.dev/blog/python-packages-vulnerable-node2shell-brotli-cve-2026-111497)

## 2. C++26 표준안, ISO 투표에서 부결

C++26 표준안 투표가 끝났지만, 찬성률과 반대율 모두 승인 조건을 충족하지 못해 부결됐다. 정회원(P-Member) 투표에서는 20곳 중 12곳이 찬성해 찬성률이 60%에 그쳤는데, 승인에 필요한 기준은 66.66% 이상이다. 회원 기관 투표에서는 22곳 중 9곳이 반대해 반대율이 41%로, 허용 기준인 25% 이하를 크게 넘었다. 결과를 전한 Robert Seacord는 C++ 커뮤니티로서는 안타까운 일이라면서도, 이를 딛고 생산적으로 나아가기를 바란다고 밝혔다.

**왜 중요한가:** C++ 표준의 확정이 늦어지면서, 새 기능을 기다리던 컴파일러 개발자와 사용자들의 일정에도 영향이 갈 수 있다.

- [GeekNews](https://news.hada.io/topic?id=35960) · [원문 (Robert Seacord의 LinkedIn 글)](https://www.linkedin.com/posts/robertseacord_balloting-has-completed-for-c26-unfortunately-activity-7519795140887035918-5PWL)

## 3. Cerebras, 조 단위 매개변수 모델을 웨이퍼 여러 장에 나눠 배포하는 방법 공개

Cerebras가 수조 개 매개변수 모델을 여러 장의 WSE-3T 웨이퍼 온칩 메모리에 나눠 싣고 파이프라인으로 실행하는 방식을 설명했다. 웨이퍼 한 장의 온칩 SRAM은 44GB로, 약 16GB인 레이어 하나를 통째로 담을 수 있어 대부분의 가중치는 움직이지 않고 활성화 값만 웨이퍼 사이를 오간다. 약 3조 매개변수인 Kimi K3를 예로 들면, 4비트 가중치 양자화와 요청당 평균 256k 토큰을 가정할 때 선형 어텐션 레이어용 35장과 밀집 레이어용 24장, 모두 59장의 웨이퍼가 필요하다. 각 파이프라인 단계가 서로 다른 요청을 동시에 처리하며, 이 방식으로 초당 1,000~2,000개 이상의 토큰을 생성한다고 밝혔다. Cerebras는 시스템 효율을 동시성이나 배치 크기가 아니라, 같은 출력 속도에서 전력당 처리하는 토큰 수로 평가해야 한다고 강조했다.

**왜 중요한가:** GPU 중심의 추론과 다른 방식으로 초대형 오픈 모델을 빠르게 서비스하는 구체적인 설계가 공개되면서, 추론 인프라 선택지에 대한 비교 기준도 늘었다.

- [GeekNews](https://news.hada.io/topic?id=35965) · [원문 (Cerebras 블로그)](https://www.cerebras.ai/blog/how-we-deploy-trillion-parameter-frontier-models-on-cerebras)

## 4. 덴마크 디지털화부, MS Office 대체 시범사업 조용히 중단

덴마크 디지털화부가 Microsoft Office를 오픈소스 Collabora로 대체할 수 있는지 시험하던 시범사업을 중단했다. 2025년 여름 시작한 이 사업에는 직원 38명이 참여해, 덴마크 기업 cBrain의 업무 시스템 F2에 연결한 Collabora로 문서를 다뤘다. 후속 보도에 따르면 사업은 2026년 봄 총선이 공고되면서 멈췄고, 대변인은 재개 계획이 없다고 확인했다. 시험 중에는 문서 서식과 빈 페이지, 변경 내용 추적 기능에서 문제가 보고됐지만, 예정된 평가가 이뤄지지 않아 이 문제가 해결됐는지는 확인되지 않았다. 이번에 중단된 것은 이 부처의 시범사업이며, 덴마크 정부 전체의 소프트웨어 전환 사업은 아니다.

**왜 중요한가:** 유럽에서 디지털 주권 논의가 커지는 가운데, 평가 결과조차 남기지 않고 끝난 실험은 다른 공공기관이 참고할 근거를 남기지 못한다.

- [GeekNews](https://news.hada.io/topic?id=35939) · [원문 (Computerworld Denmark)](https://www.computerworld.dk/art/297226/digitaliseringsministeriet-har-i-al-stilhed-droppet-stort-anlagt-forsoeg-med-open-source-alternativ-til-microsoft)

## 5. 브라질 선거법원, Meta에 후보 간 동등 대우 입증 요구

브라질 시민단체 Sleeping Giants Brasil과 CTRL+Z가 Meta 플랫폼이 Lula 대통령과 Flávio Bolsonaro 상원의원 캠프를 불평등하게 대한다는 정황을 담은 새 자료를 고등선거법원에 냈다. 자료에 따르면 WhatsApp과 Instagram의 GIF 검색과 해시태그 추천에서 Bolsonaro에게 유리한 콘텐츠가 위에 오르고, Lula는 비하 콘텐츠와 연결되는 경우가 많았다. 두 단체는 편향을 입증했다고 단정하지 않고, 순위와 AI 답변을 정하는 기준을 공개하라고 요구했다. 법원은 Meta에 두 캠프에 같은 기준을 적용했음을 증명하라고 명령했으며, 이행하지 않으면 하루 벌금을 50만 헤알에서 100만 헤알로 올릴 수 있다고 경고했다. Meta는 앞선 문제를 기술적 오류 탓으로 돌리며 의도적 우대를 부인했지만, 새 자료에는 아직 답하지 않았다.

**왜 중요한가:** 검색 순위와 추천 같은 자동화 시스템이 선거에 미치는 영향을 법원이 직접 따지기 시작하면서, 플랫폼 알고리듬의 투명성 요구가 더 구체적인 의무로 바뀌고 있다.

- [GeekNews](https://news.hada.io/topic?id=35969) · [원문 (Pan American Dispatch)](https://www.panamericandispatch.org/p/meta-ignores-brazilian-court-order)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
