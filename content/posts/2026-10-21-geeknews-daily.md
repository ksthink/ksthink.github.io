---
title: "[뉴스] GeekNews 데일리 요약: 2026년 10월 21일 — 인증서 키 유출과 PHP 긴급 패치, 흔들리는 신뢰"
date: 2026-10-21
slug: geeknews-daily-2026-10-21
tags: [GeekNews, 기술뉴스, 데일리요약, 보안, AI, 오픈소스]
---

오늘 GeekNews에서는 우리가 당연하게 믿어 온 기반이 흔들리는 소식이 많았다. 브라우저가 신뢰하던 eMudhra 중간 인증서 8개의 개인 키가 유출됐고, PHP는 치명적 취약점 2건을 고치는 보안 릴리스를 예고했다. AI가 지어낸 가짜 통계가 ChatGPT를 거쳐 논문과 금융 보고서에까지 인용된 실험도 화제가 됐다. 여기에 Microsoft 의존을 줄이려는 네덜란드 정부의 자체 Linux 업무 환경과 PyTorch 모델을 TPU에서 돌리는 Google의 TorchTPU 공개 소식도 함께 정리한다.

## 1. eMudhra 중간 CA 개인 키 유출, 주요 브라우저와 OS가 긴급 차단

인증기관 eMudhra의 중간 CA 인증서 8개에 해당하는 개인 키가 유출됐다. 이 인증서들은 Mozilla, Microsoft, Apple, Chrome이 신뢰하는 루트로 이어져 있어, 키를 가진 공격자는 어떤 웹사이트나 서비스든 사칭하는 위조 HTTPS 인증서를 만들 수 있다. 최초 신고자는 10월 17일 각 개인 키로 같은 메시지에 서명해 유출을 입증했고, Firefox와 Chrome은 같은 날, Apple은 19일, Microsoft는 20일부터 해당 인증서를 차단했다. Mozilla는 신고를 받은 지 3시간이 안 돼 OneCRL로 모든 표준 설정 Firefox 사용자에게 차단을 배포했고, NSS 3.131.1에서는 문제 인증서에 서명한 루트를 신뢰 목록에서 뺐다. 폐기 정보를 확인하지 않는 클라이언트는 별도 업데이트가 필요해서 Go, Electron, Python certifi, rustls 등이 패치를 냈고, Node.js와 Composer ca-bundle은 아직 패치가 나오지 않았다.

**왜 중요한가:** 브라우저 밖에서 자체 인증서 묶음을 쓰는 서버, 앱, 개발 도구는 저절로 보호되지 않으므로, 사용하는 런타임과 인증서 패키지를 직접 점검해야 한다.

- [GeekNews](https://news.hada.io/topic?id=35722) · [원문 (we-have-a-problem.com)](https://emudhra.we-have-a-problem.com/) · [Mozilla 보안 블로그](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/)

## 2. PHP, 치명적 취약점 2건 수정하는 보안 릴리스 예고

PHP 보안팀이 치명적 취약점 2건을 고치는 보안 릴리스를 미리 공지했다. 두 취약점 모두 CVSS v4.0 기준 9.2점의 Critical 등급이며, 공개 예정 시각은 한국 시간 10월 21일 오후 11시(UTC 오후 2시)다. 취약점의 자세한 내용과 영향받는 버전, 수정 버전은 릴리스와 함께 공개되며, 세부 정보가 먼저 새어 나가거나 실제 악용 증거가 나오면 예정보다 일찍 배포할 수 있다고 밝혔다. 보안팀은 모든 사용자에게 공개 즉시 업데이트할 수 있도록 미리 준비하라고 권고했다. Hacker News에는 CVSS 10.0짜리 원격 코드 실행 취약점이라는 소문도 올라왔지만, 글쓴이의 주장 말고는 뒷받침할 근거가 없다.

**왜 중요한가:** PHP는 여전히 웹의 상당 부분을 떠받치고 있어, PHP 서버를 운영한다면 오늘 밤 릴리스에 맞춰 바로 업데이트할 수 있게 일정을 잡아 두는 것이 좋다.

- [GeekNews](https://news.hada.io/topic?id=35742) · [원문 (PHP 공지)](https://news-web.php.net/php.announce/509)

## 3. 가짜 통계 5만 페이지를 올렸더니 ChatGPT와 논문, 은행 보고서가 인용했다

한 마케터가 GPT-4.1로 하루 만에 지어낸 국가별 통계 페이지 5만 개를 새 도메인에 올리고 7개월 동안 지켜본 실험 결과를 공개했다. 수치는 하나도 검증하지 않았고 총비용은 약 50달러였다. Google 검색 노출은 두 차례 업데이트 뒤 급감했지만, ChatGPT가 답변을 위해 페이지를 여는 요청은 최근 30일 동안에만 약 7만 2,000건에 달했고, ChatGPT 유입 세션은 1만 건을 넘었다. 330개가 넘는 도메인이 이 사이트에 링크했고, 허위 수치는 학술 논문과 카타르 최대 금융그룹의 투자 리서치에도 인용됐다. 작성자는 권위 있는 곳에 한 번 인용되면 가짜 통계가 더 믿을 만해 보이는 '인용 세탁'을 경고하면서, 후속 실험에서는 출처를 확인한 진짜 통계로도 인용을 얻을 수 있었다고 덧붙였다.

**왜 중요한가:** 검색 순위와 AI가 근거로 끌어오는 자료는 별개라는 점, 그리고 AI 답변 속 숫자는 반드시 원출처까지 확인해야 한다는 점을 실제 데이터로 보여 준다.

- [GeekNews](https://news.hada.io/topic?id=35721) · [원문 (Peec AI 블로그)](https://peec.ai/blog/publish-stats-get-cited-the-tactic-that-put-my-data-all-over-the-web)

## 4. 네덜란드, Microsoft 의존에서 벗어나려 NixOS 기반 정부 업무 환경 개발

네덜란드 정부가 Windows와 Office 같은 Microsoft 제품 의존을 줄이기 위해 공공 업무 환경 DAWO를 만들고 있다. NixOS를 바탕으로 운영체제뿐 아니라 문서 작업과 협업 도구, 클라우드, 관리 도구까지 함께 구성하는 프로젝트다. 미국의 국제형사재판소(ICC) 제재 이후 핵심 IT 서비스 이용이 미국 정부 정책에 좌우될 수 있다는 우려가 커진 것이 추진을 앞당겼다. 현재 일부 기관과 8개 지방자치단체에서 소규모 시범 운영 중이며, Windows 관리자도 쓸 수 있는 GUI 관리 도구를 만들고 있고, Windows 11 요구 사양을 충족하지 못하는 오래된 노트북도 활용한다. 전체 전환 일정은 정해지지 않았고, 개발진은 2027년 1.0 버전 공개를 바라고 있다.

**왜 중요한가:** 유럽의 디지털 주권 논의가 선언을 넘어 실제 운영체제와 업무 도구 교체 단계로 들어서고 있음을 보여 주는 사례다.

- [GeekNews](https://news.hada.io/topic?id=35718) · [원문 (TechSpot)](https://www.techspot.com/news/114018-netherlands-building-own-linux-os-break-free-microsoft.html)

## 5. Google, PyTorch 모델을 TPU에서 돌리는 TorchTPU 오픈소스 공개

Google이 Meta의 PyTorch 팀과 함께 만든 TPU용 PyTorch 네이티브 백엔드 TorchTPU를 공개했다. 기존 PyTorch의 동작 방식을 그대로 유지하는 것이 핵심 원칙이어서, 코드 이전은 `device="cuda"`를 `device="tpu"`로, 분산 통신 백엔드 `nccl`을 `tpu_dist`로 바꾸는 데서 시작한다. 연산을 하나씩 실행하는 즉시 실행 모드를 기본으로 지원하고, `torch.compile()`로 연산 그래프를 StableHLO로 바꿔 OpenXLA로 컴파일하며 결과를 캐시한다. DDP, FSDP2, DTensor 같은 분산 학습 구성으로 단일 칩에서 여러 TPU Pod 슬라이스까지 확장할 수 있고, Llama, Qwen, ResNet 등의 예제가 들어 있다. 현재 버전은 0.2.0으로 Apache 2.0 라이선스이며, 동적 형태 처리와 일부 분산 실행에는 아직 제약이 있다.

**왜 중요한가:** JAX를 배우지 않고도 PyTorch 코드를 거의 그대로 TPU로 옮길 길이 열리면서, GPU에 쏠린 AI 학습·추론 인프라에 실질적인 대안이 하나 더 생겼다.

- [GeekNews](https://news.hada.io/topic?id=35728) · [원문 (GitHub)](https://github.com/google-pytorch/torch_tpu)

---

*이 글은 [GeekNews](https://news.hada.io)에 올라온 오늘의 소식 가운데 다섯 개를 골라 요약한 데일리 다이제스트다. 각 항목의 자세한 내용과 토론은 GeekNews와 원문 링크에서 확인할 수 있다.*
