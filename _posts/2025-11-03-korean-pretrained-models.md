---
layout: post
title: "KoBERT, KLUE-BERT, KoELECTRA: 한국어 사전학습 모델 비교"
date: 2025-11-03
tags: [KoBERT, KLUE, KoELECTRA, 사전학습모델, 한국어NLP, BERT]
---

2018년 Google의 BERT 공개 이후 한국어 NLP 생태계에도 다양한 사전학습 언어 모델이 등장했다. 이 글에서는 실무에서 가장 자주 쓰이는 세 가지 모델을 비교한다.

## KoBERT (2019, SKT)

SK텔레콤이 2019년 공개한 **KoBERT**는 한국어로 학습된 최초의 BERT 계열 모델 중 하나다. 위키피디아와 뉴스 데이터를 합산한 약 54만 문장으로 학습되었으며, 구글의 원본 BERT 아키텍처(12-layer, 768-hidden, 12-heads)를 그대로 사용한다.

KoBERT는 자체 SentencePiece 기반 토크나이저를 사용하는데, 한국어에 최적화된 8,002개의 어휘를 가진다. 덕분에 동일한 텍스트에 대해 다국어 BERT(mBERT)보다 훨씬 적은 토큰 수로 처리할 수 있다.

```python
from transformers import BertModel, BertTokenizer

tokenizer = BertTokenizer.from_pretrained('skt/kobert-base-v1')
model = BertModel.from_pretrained('skt/kobert-base-v1')
```

## KoELECTRA (2020, monologg)

**KoELECTRA**는 Google의 ELECTRA 아키텍처를 한국어에 적용한 모델이다. ELECTRA는 BERT와 달리 MLM(Masked Language Model) 대신 RTD(Replaced Token Detection) 방식으로 학습한다. Generator가 일부 토큰을 교체하면 Discriminator가 각 토큰이 원본인지 교체된 것인지 판별하는 방식으로, 같은 연산량 대비 학습 효율이 BERT보다 높다.

monologg가 공개한 KoELECTRA-base-v3는 뉴스, 위키, 나무위키 등 다양한 도메인의 약 20GB 데이터로 학습되어, 여러 다운스트림 태스크에서 KoBERT를 능가하는 성능을 보인다.

| 모델 | 학습 방식 | 어휘 크기 | 특징 |
|------|-----------|-----------|------|
| KoBERT | MLM | 8,002 | 최초의 한국어 BERT |
| KoELECTRA | RTD | 35,000 | 높은 학습 효율 |
| KLUE-BERT | MLM | 32,000 | 벤치마크 기반 평가 |

## KLUE-BERT (2021, KLUE 연구팀)

**KLUE(Korean Language Understanding Evaluation)**는 한국어 NLP의 표준 벤치마크를 목표로 카카오, 서울대, NAVER, 업스테이지 등이 공동으로 구축한 프로젝트다. KLUE 벤치마크는 8개의 태스크로 구성된다.

- **TC**: 주제 분류 (Topic Classification)
- **STS**: 의미 유사도 (Semantic Textual Similarity)
- **NLI**: 자연어 추론 (Natural Language Inference)
- **NER**: 개체명 인식 (Named Entity Recognition)
- **RE**: 관계 추출 (Relation Extraction)
- **DP**: 의존 구문 분석 (Dependency Parsing)
- **MRC**: 기계 독해 (Machine Reading Comprehension)
- **DST**: 대화 상태 추적 (Dialogue State Tracking)

KLUE-BERT와 KLUE-RoBERTa는 이 벤치마크에서 평가된 공식 베이스라인 모델로, 위키피디아·뉴스·법률문서 등 62GB의 한국어 텍스트로 학습되었다.

## 어떤 모델을 선택해야 하나

실무 선택 기준을 정리하면 다음과 같다.

- **빠른 프로토타이핑**: KoBERT — HuggingFace 연동이 잘 되어 있고 레퍼런스가 많다.
- **성능 우선**: KLUE-RoBERTa-large — 대부분의 태스크에서 가장 높은 성능을 보인다.
- **경량화 필요**: KoELECTRA-small — 파라미터 수가 적어 추론 속도가 빠르다.
- **멀티링구얼 태스크**: mBERT 또는 XLM-RoBERTa — 다국어 처리가 필요한 경우.

모델 선택 못지않게 파인튜닝 데이터의 품질과 양이 최종 성능에 결정적인 영향을 미친다는 점도 기억해야 한다.

---

`#KoBERT` `#KLUE` `#KoELECTRA` `#BERT` `#사전학습모델` `#한국어NLP` `#파인튜닝`
