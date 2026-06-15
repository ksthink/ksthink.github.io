---
layout: post
title: "KoSimCSE 심화: 드롭아웃 기반 대조 학습으로 한국어 임베딩 만들기"
date: 2026-03-23
tags: [KoSimCSE, SimCSE, 대조학습, 문장임베딩, RoBERTa, 한국어NLP, 비지도학습]
---

지난 글에서 RAG 파이프라인의 맥락으로 KoSimCSE를 간략히 소개했다. 이 글에서는 KoSimCSE의 학습 방법론을 더 깊이 파고들고, 모델 변형 간 차이와 실전 파인튜닝 방법까지 다룬다.

## SimCSE가 해결한 문제

기존 문장 임베딩 접근법에는 두 가지 핵심 문제가 있었다.

첫 번째는 **표현의 등방성(anisotropy) 문제**다. BERT 계열 모델에서 추출한 문장 벡터는 고차원 공간의 좁은 원뿔(cone) 영역에 밀집되는 경향이 있어, 코사인 유사도가 거의 모든 쌍에서 높게 나오는 분별력 저하 현상이 발생한다.

두 번째는 **레이블 데이터 의존성**이다. NLI나 STS 레이블 데이터는 구축 비용이 높아, 특정 도메인에 적용할 때 데이터를 새로 만들기가 어렵다.

SimCSE는 이 두 문제를 한꺼번에 다루는 우아한 방법을 제시했다.

## 드롭아웃을 이용한 Positive Pair 생성

SimCSE Unsupervised의 핵심 아이디어는 **같은 문장을 두 번 인코딩해서 positive pair를 만드는 것**이다. 인코더에 드롭아웃이 적용되면 동일한 입력도 매번 다른 벡터가 출력된다. 이 두 벡터는 의미상 동일하지만 표현이 조금씩 다른 positive pair가 된다.

```
문장 x → 인코더(dropout_1) → z
문장 x → 인코더(dropout_2) → z'
positive pair: (z, z')
negative pairs: 같은 배치의 다른 문장들
```

배치 내 다른 문장들을 자동으로 negative로 사용하는 **in-batch negative** 방식은 추가적인 negative mining 없이도 대조 학습을 효율적으로 수행한다.

손실 함수는 다음과 같다.

$$\mathcal{L} = -\log \frac{e^{\text{sim}(z_i, z_i') / \tau}}{\sum_{j=1}^{N} e^{\text{sim}(z_i, z_j') / \tau}}$$

여기서 τ는 온도(temperature) 파라미터로, 유사도 분포의 날카로움을 조절한다. KoSimCSE에서는 기본값으로 0.05를 사용한다.

## KoSimCSE 모델 라인업

BM-K가 공개한 KoSimCSE 모델은 크게 두 계열로 나뉜다.

| 모델 | 백본 | 학습 방식 | 특징 |
|------|------|-----------|------|
| `BM-K/KoSimCSE-roberta` | klue/roberta-base | Unsupervised | 레이블 불필요 |
| `BM-K/KoSimCSE-roberta-multitask` | klue/roberta-base | Unsupervised + STS | STS 성능 향상 |

multitask 버전은 비지도 SimCSE 학습 후 KLUE-STS 데이터로 추가 파인튜닝해 감독 신호를 결합한 모델이다.

## 직접 학습해보기

도메인 특화 데이터가 있다면 KoSimCSE 방식으로 직접 임베딩 모델을 학습할 수 있다. SimCSE 논문 저자들이 공개한 코드와 HuggingFace의 `sentence-transformers` 라이브러리를 조합하면 비교적 간단하게 구현 가능하다.

```python
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# 레이블 없이 문장만 준비
train_sentences = [
    "신용카드 발급 신청 방법을 알려주세요.",
    "해외 송금 수수료는 얼마인가요?",
    "통장 잔액 조회는 어떻게 하나요?",
    # ... 도메인 특화 문장들
]

# 동일 문장을 anchor, positive로 사용
train_examples = [
    InputExample(texts=[s, s]) for s in train_sentences
]

model = SentenceTransformer('klue/roberta-base')
train_dataloader = DataLoader(train_examples, batch_size=64, shuffle=True)

# MultipleNegativesRankingLoss = SimCSE와 동일한 in-batch negative 방식
train_loss = losses.MultipleNegativesRankingLoss(model)

model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=3,
    warmup_steps=100,
)
model.save('my-domain-simcse')
```

이 방법으로 금융, 법률, 의료 등 특정 도메인의 문서를 이용해 도메인 최적화된 임베딩 모델을 별도 레이블 작업 없이 학습할 수 있다.

## 균일성(Uniformity)과 정렬(Alignment) 지표

SimCSE 논문은 임베딩 품질을 측정하는 두 가지 지표를 제안한다.

- **Alignment**: positive pair 간 벡터 거리가 얼마나 가까운가. 낮을수록 좋다.
- **Uniformity**: 벡터들이 단위 구(hypersphere) 위에 얼마나 고르게 분포하는가. 낮을수록 좋다.

드롭아웃 기반 SimCSE는 기존 BERT 대비 Uniformity를 크게 개선하는 것으로 나타났다. 이것이 앞서 언급한 등방성 문제를 해결하는 메커니즘이다.

## Supervised SimCSE와의 비교

레이블 데이터가 있다면 Supervised SimCSE를 사용할 수 있다. NLI 데이터의 (전제, 가설-entailment) 쌍을 positive로, (전제, 가설-contradiction) 쌍을 hard negative로 추가해 학습하면 성능이 더 높아진다.

KorNLI 데이터셋으로 Supervised KoSimCSE를 학습한 결과는 Unsupervised 대비 KLUE-STS에서 피어슨 r 기준 약 3~5% 성능 향상이 확인된다.

## 마치며

KoSimCSE의 학습 방법론은 심플하지만 효과적이다. 레이블 없는 문장 데이터만으로도 높은 품질의 임베딩을 만들 수 있다는 점은, 특히 레이블 구축 비용이 높은 한국어 특화 도메인에서 강력한 장점이 된다. 다음 글에서는 다국어 임베딩 모델 중 한국어 성능이 두드러지는 multilingual-e5를 소개한다.

---

`#KoSimCSE` `#SimCSE` `#대조학습` `#ContrastiveLearning` `#문장임베딩` `#비지도학습` `#한국어NLP` `#RAG`
