---
layout: post
title: "KURE: 한국어 검색에 최적화된 고려대 오픈소스 임베딩 모델"
date: 2026-05-18
tags: [KURE, 한국어임베딩, 검색특화, 고려대, RAG, 한국어NLP, 오픈소스, MTEB]
---

지금까지 소개한 모델들이 범용 문장 임베딩이나 다국어 임베딩에 초점을 맞췄다면, **KURE(KoRean Understanding Retrieval Embeddings)**는 처음부터 **한국어 정보 검색(IR)** 에 목적을 두고 개발된 모델이다. 고려대학교 NLP 연구팀이 개발하고 HuggingFace에 공개했으며, 한국어 검색 특화 벤치마크에서 두드러진 성능을 보인다.

## KURE가 기존 모델과 다른 이유

STS(의미 유사도) 벤치마크와 IR(정보 검색) 벤치마크는 요구하는 능력이 다르다.

- **STS**: "이 두 문장이 얼마나 비슷한가?" — 대칭적(symmetric) 유사도 측정
- **IR**: "이 문서가 쿼리에 대한 답을 담고 있는가?" — 비대칭적(asymmetric) 관련성 판단

대부분의 한국어 임베딩 모델은 STS 데이터로 학습되어 대칭적 유사도 측정에 최적화되어 있다. 반면 실제 RAG나 검색 엔진에서 필요한 것은 비대칭적 관련성 판단이다.

KURE는 이 간극을 메우기 위해 한국어 IR 특화 데이터로 학습되었다.

## 모델 아키텍처와 학습 방식

KURE는 klue/roberta-large를 백본으로 사용한다. 학습 데이터는 다음 세 종류를 혼합했다.

1. **KorQuAD**: 한국어 기계 독해 데이터셋. 질문-문서 쌍을 positive pair로 활용
2. **AI Hub 한국어 QA 데이터**: 다양한 도메인의 질문-답변-문서 세트
3. **합성 데이터(Synthetic Data)**: LLM을 이용해 기존 문서에서 질문을 자동 생성한 쌍

학습 손실 함수는 **InfoNCE(In-batch Negative Cross-Entropy)**를 사용하며, Hard Negative Mining을 통해 구별하기 어려운 negative 샘플을 추가해 학습 품질을 높였다.

```
쿼리: "조선 후기 실학의 대표적인 학자는 누구인가?"
Positive: "정약용은 조선 후기 실학을 집대성한 학자로 목민심서, 경세유표 등을 저술했다."
Hard Negative: "이황은 조선 중기 성리학의 대가로 도산서원을 세웠다."
Easy Negative: "오늘 서울의 날씨는 맑고 기온은 25도입니다."
```

Hard Negative 없이 Easy Negative만 사용하면 모델이 너무 쉽게 학습되어 어려운 검색 케이스에서 실패한다. KURE는 Hard Negative를 명시적으로 포함해 이 문제를 다룬다.

## 설치 및 기본 사용

```python
from sentence_transformers import SentenceTransformer
import torch
import torch.nn.functional as F

model = SentenceTransformer('nlpai-lab/KURE-v1')

# IR 파이프라인에서의 사용
queries = [
    "세종대왕이 훈민정음을 창제한 이유",
    "파이썬 리스트와 튜플의 차이점",
]

corpus = [
    "훈민정음은 1443년 세종대왕이 창제했으며, 백성이 쉽게 글을 익힐 수 있도록 하기 위해 만들어졌다.",
    "파이썬에서 리스트는 변경 가능(mutable)하고 튜플은 변경 불가능(immutable)한 자료형이다.",
    "대한민국의 수도는 서울이며 인구는 약 950만 명이다.",
    "세종대왕은 집현전을 설치하고 과학 기술 발전에도 크게 기여했다.",
]

query_embeddings = model.encode(queries, normalize_embeddings=True)
corpus_embeddings = model.encode(corpus, normalize_embeddings=True)

# 코사인 유사도 행렬 (쿼리 수 × 코퍼스 수)
scores = query_embeddings @ corpus_embeddings.T

for i, query in enumerate(queries):
    top_idx = scores[i].argmax()
    print(f"쿼리: {query}")
    print(f"최상위 문서: {corpus[top_idx]}")
    print()
```

## 한국어 MTEB Retrieval 성능 비교

KURE-v1은 한국어 IR 태스크에서 다음과 같은 성능을 보인다.

| 모델 | Ko-MTEB Retrieval | Ko-MTEB 전체 평균 |
|------|-------------------|-------------------|
| ko-sroberta-multitask | 52.1 | 55.2 |
| multilingual-e5-large | 68.9 | 65.4 |
| BGE-M3 (dense) | 69.5 | 64.8 |
| KURE-v1 | **74.2** | 68.7 |
| solar-embedding-1-large | 73.1 | 70.3 |

Retrieval 특화 태스크에서 KURE-v1은 범용 다국어 모델들을 능가한다. 반면 STS나 분류 태스크에서는 solar-embedding-1-large 대비 낮은 성능을 보이는데, 이는 검색 특화 학습의 자연스러운 트레이드오프다.

## FAISS와 결합한 실전 검색 파이프라인

```python
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('nlpai-lab/KURE-v1')

# 코퍼스 인덱싱
corpus = [...]  # 수만 개의 한국어 문서
corpus_embeddings = model.encode(
    corpus,
    batch_size=256,
    normalize_embeddings=True,
    show_progress_bar=True,
    convert_to_numpy=True
)

# FAISS 인덱스 생성 (내적 검색 = L2 정규화 후 코사인 유사도)
dim = corpus_embeddings.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(corpus_embeddings)

# 검색
def search(query, top_k=5):
    q_emb = model.encode([query], normalize_embeddings=True)
    scores, indices = index.search(q_emb, top_k)
    return [(corpus[i], scores[0][j]) for j, i in enumerate(indices[0])]

results = search("한국어 임베딩 모델 비교")
for doc, score in results:
    print(f"[{score:.4f}] {doc[:80]}...")
```

## 모델 선택 가이드 정리

지금까지 소개한 6개 모델을 사용 목적에 따라 정리하면 다음과 같다.

| 목적 | 추천 모델 | 이유 |
|------|-----------|------|
| 빠른 프로토타이핑 | ko-sroberta-multitask | 경량, 레퍼런스 풍부 |
| 한국어 검색/RAG | KURE-v1 | Retrieval 특화 학습 |
| 다국어 환경 | multilingual-e5-large | 100+ 언어 지원 |
| 하이브리드 검색 | BGE-M3 | Dense+Sparse 동시 지원 |
| 최고 품질 (GPU 여유) | solar-embedding-1-large | LLM 기반 고품질 |
| 도메인 특화 학습 | KoSimCSE (직접 학습) | 레이블 없이 파인튜닝 가능 |

## 마치며

한국어 임베딩 오픈소스 생태계는 빠르게 성숙하고 있다. 2019년 KoBERT 공개 이후 KoELECTRA, KLUE, KoSimCSE를 거쳐 이제는 LLM 기반 임베딩과 검색 특화 모델까지 등장했다. 중요한 것은 모델 선택보다 실제 도메인 데이터로 검색 품질을 직접 평가해 보는 과정이다. 이 시리즈에서 소개한 6개 모델을 출발점으로 삼아, 자신의 서비스에 맞는 모델을 찾아가길 권한다.

---

`#KURE` `#한국어임베딩` `#검색특화` `#RAG` `#FAISS` `#정보검색` `#MTEB` `#한국어NLP` `#오픈소스`
