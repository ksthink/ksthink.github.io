---
layout: post
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 24일 — 열리는 앱 생태계와 AI의 비즈니스"
date: 2026-10-24
slug: geeknews-daily-2026-10-24
tags: [GeekNews, 기술뉴스, 데일리요약, AI, 플랫폼규제, 보안]
published: true
---

오늘 GeekNews에서는 플랫폼과 AI를 둘러싼 규칙이 바뀌는 소식이 눈에 띄었다. 호주 법원은 Apple에 iOS 대체 앱 스토어와 대체 결제를 허용하라고 명령했고, Google은 Gmail과 Photos 데이터를 광고에 쓸 수 있는 예외를 개인정보처리방침에 넣었다. 3조 매개변수급 오픈 웨이트 모델 Kimi K3.1 Pro, AI가 SaaS 실적에 미친 영향을 분석한 글, DTLS 1.3을 지원하는 OpenSSL 4.1.0도 함께 정리한다.

## 1. 호주 법원, Apple에 iOS 대체 배포와 대체 결제 허용 명령

Epic Games가 Apple을 상대로 낸 소송에서 호주 연방법원이 Apple의 시장지배력 남용을 인정하고 구제명령을 내렸다. 법원은 iOS 앱 배포와 인앱 결제를 별개 시장으로 보고, Apple이 2017년 11월부터 경쟁법을 위반했다고 선언했다. 이에 따라 Apple은 호주 계정 이용자에게 앱 직접 다운로드와 대체 앱 스토어, 대체 결제를 허용하고, 그에 필요한 도구와 API를 실질적으로 같은 조건으로 제공해야 한다. 대체 경로에 수수료를 매기거나 추가 결제 단계로 이용을 억제하는 것도 제한되며, 개발자는 외부 구매 링크와 더 싼 가격을 안내할 수 있다. 주요 명령은 2027년 3월 1일 발효되며, Epic이 신청하면 Fortnite도 호주 App Store로 돌아올 수 있다.

**왜 중요한가:** 유럽에 이어 호주에서도 iOS의 폐쇄적 배포 구조가 법으로 열리면서, 앱 개발자의 유통과 결제 선택지가 넓어지는 흐름이 이어지고 있다.

- [GeekNews](https://news.hada.io/topic?id=35872) · [원문 (호주 연방법원 판결문)](https://www.judgments.fedcourt.gov.au/judgments/Judgments/fca/single/2026/2026fca1552)

## 2. Google, Gmail과 Photos 데이터를 타깃 광고에 쓸 수 있는 예외 추가

Google이 10월 16일부터 개인정보처리방침에 Gmail, Drive, Google Photos 데이터를 맞춤형 광고에 쓰지 않는다는 기존 약속의 예외를 넣었다. 사용자가 Personal Intelligence 기능으로 이 데이터를 AI Mode 같은 검색 도구에 연결하면, 그 콘텐츠에 기반한 광고가 보일 수 있다는 내용이다. 이 변경은 Android Authority가 처음 발견했다. Google은 광고주가 메일이나 사진, 이름, 이메일 주소에 접근할 수 없고, 인종이나 건강 같은 민감한 범주에 기반한 광고도 하지 않는다고 설명했다. 원하지 않으면 검색 개인화 설정에서 앱 연결을 끊거나 맞춤 추천을 아예 끌 수 있다.

**왜 중요한가:** AI 개인화를 위해 넘긴 데이터가 광고에도 쓰일 수 있다는 점이 드러나, AI 기능에 어떤 데이터를 연결할지 다시 따져 볼 이유가 생겼다.

- [GeekNews](https://news.hada.io/topic?id=35889) · [원문 (The Verge)](https://www.theverge.com/tech/1017600/google-personal-intelligence-privacy-policy-ads-update)

## 3. Kimi K3.1 Pro 공개, 100만 토큰 문맥의 3조 매개변수급 오픈 웨이트 모델

Kimi가 K3를 바탕으로 사후 학습을 크게 늘린 3조 매개변수급 모델 K3.1 Pro를 내놓았다. 문맥 창은 100만 토큰이고, 실제 터미널 작업을 평가하는 Terminal-Bench 4.0에서 65.7%를 기록해 Claude Opus 5.5(66.4%)에 근접했다. 설명이나 스케치로 3D 모델을 만들고 Blender와 CAD용 스크립트를 쓰는 기능, 금융 문서를 교차 검증하는 기능도 강화했으며, 내부 사실 확인 평가에서 주장 단위 환각률은 23.4%에서 8.3%로 줄었다고 밝혔다. 일반 Pro보다 2~3배 빠른 Highspeed 버전도 함께 나왔고, 전체 가중치는 11월 4일까지 공개할 예정이다. 공개 가중치의 악용을 줄이려고 학습 과정에서 사이버 보안 관련 데이터를 뺀 점도 눈에 띈다.

**왜 중요한가:** 최상위 상용 모델에 근접한 성능의 모델이 가중치까지 공개되면, 오픈 모델로 할 수 있는 일의 범위가 다시 한 번 넓어진다.

- [GeekNews](https://news.hada.io/topic?id=35879) · [원문 (Kimi 블로그)](https://www.kimi.ai/blog/kimi-k3-1-pro)

## 4. AI가 SaaS를 무너뜨린다고? 67개 기업의 실적 발표는 달랐다

Blossom Street Ventures가 상장 SaaS 기업 67곳의 실적 발표를 검토한 결과, 거의 모든 기업이 전망 초과나 전망 상향, 성장 가속, 수익성 개선 중 하나 이상을 기록했다. AI는 대형 계약의 기본 요건이 됐고, Workday는 분기 신규 수주의 절반 이상에, Five9은 100만 달러 규모 계약 모두에 AI 제품이 포함됐다고 밝혔다. 글은 경쟁력의 중심이 범용 모델보다 기업 고유의 맥락과 데이터, 업무 흐름, 통합, 신뢰에 있다고 정리한다. 성과 기반 과금은 좌석 과금을 대체하기보다 보완하는 형태로 퍼지고 있다. 67곳 가운데 AI를 핵심 제품의 구조적 위협으로 꼽은 곳은 없었다. 다만 검색 유입에는 AI가 영향을 주고 있다.

**왜 중요한가:** "AI가 SaaS를 대체한다"는 전망과 달리, 지금까지의 실적은 데이터와 업무 흐름을 가진 기업이 AI로 오히려 시장을 넓히고 있음을 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=35888) · [원문 (Medium)](https://blossomstreetventures.medium.com/the-15-themes-on-ai-from-saas-earnings-calls-f9607b073dc5)

## 5. OpenSSL 4.1.0 출시, DTLS 1.3과 GREASE 지원

OpenSSL 4.1.0이 RFC 9147에 따른 DTLS 1.3과 RFC 8701의 GREASE 지원을 더한 기능 릴리스로 나왔다. SSL 리스너 API도 DTLS를 지원하게 됐고, x86_64와 ppc64le에서 ML-DSA, ML-KEM 같은 양자내성 암호와 AES-CBC 복호화 성능을 개선했다. tsget 유틸리티는 유지보수가 끊긴 모듈 대신 Net::Curl::Easy를 쓰게 되면서, tsget 사용자는 업그레이드 전에 이 모듈을 설치해야 한다. Windows-on-Itanium과 Windows CE 빌드 대상은 빠졌고, 실제로 기능을 끄지 못하던 no-ecdsa와 no-ecdh 옵션도 삭제됐다. 다만 DTLS 1.3에는 재전송 누락이나 핸드셰이크 중단 같은 알려진 문제가 남아 있다.

**왜 중요한가:** 널리 쓰이는 암호 라이브러리가 최신 DTLS와 양자내성 암호 최적화를 갖췄지만, DTLS 1.3을 바로 쓰려면 알려진 문제부터 확인해야 한다.

- [GeekNews](https://news.hada.io/topic?id=35885) · [원문 (GitHub 릴리스 노트)](https://github.com/openssl/openssl/releases/tag/openssl-4.1.0)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
