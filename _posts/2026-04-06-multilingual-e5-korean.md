---
layout: post
title: "multilingual-e5: 명령어 기반 다국어 임베딩 모델로 한국어 처리하기"
date: 2026-04-06
tags: [multilingual-e5, 다국어임베딩, intfloat, E5, 한국어NLP, 시맨틱검색, MTEB]
---

한국어 전용 임베딩 모델이 아니면서도 한국어 검색·유사도 태스크에서 뛰어난 성능을 보이는 모델이 있다. Microsoft Research에서 공개한 **multilingual-e5** 시리즈다. MTEB(Massive Text Embedding Benchmark) 한국어 태스크에서 일관되게 상위권을 유지하며, 한국어와 다른 언어를 동시에 처리해야 하는 다국어 파이프라인에서 특히 강점을 발휘한다.

## E5란 무엇인가

E5는 **EmbEddings from bidirEctional Encoder rEpresentations**의 약자로, 텍스트 임베딩에 특화된 인코더 모델이다. 일반적인 BERT 파인튜닝과 다른 핵심 특징이 하나 있다.

**쿼리(query)와 패시지(passage)를 구분해서 인코딩한다.**

```python
# 쿼리에는 "query: " 프리픽스
query = "query: 한국어 임베딩 모델 추천해줘"

# 패시지(문서)에는 "passage: " 프리픽스
passage = "passage: ko-sroberta-multitask는 KLUE-RoBERTa 기반의 한국어 문장 임베딩 모델입니다."
```

이 비대칭 인코딩 방식은 검색 태스크에서 쿼리와 문서의 역할 차이를 명시적으로 학습에 반영한다. 단순 의미 유사도 계산이 아니라 **정보 검색(Information Retrieval)** 에 최적화된 설계다.

## 모델 종류와 선택

intfloat가 공개한 multilingual-e5 시리즈는 세 가지 크기로 제공된다.

| 모델 | 파라미터 | 출력 차원 | 특징 |
|------|----------|-----------|------|
| `intfloat/multilingual-e5-small` | 117M | 384 | 빠른 추론, 경량 |
| `intfloat/multilingual-e5-base` | 278M | 768 | 균형잡힌 성능 |
| `intfloat/multilingual-e5-large` | 560M | 1024 | 최고 성능, 무거움 |
| `intfloat/multilingual-e5-large-instruct` | 560M | 1024 | 명령어 기반, 태스크 명시 가능 |

지원 언어는 100개 이상이며, 한국어는 학습 데이터에 명시적으로 포함된다.

## 기본 사용법

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('intfloat/multilingual-e5-base')

# 검색 파이프라인에서의 사용
queries = [
    "query: 전기차 배터리 수명 늘리는 방법",
    "query: 파이썬으로 REST API 만들기",
]

passages = [
    "passage: 전기차 배터리를 오래 쓰려면 완전 방전을 피하고 20~80% 사이를 유지하는 것이 좋습니다.",
    "passage: FastAPI는 파이썬으로 REST API를 빠르게 개발할 수 있는 현대적인 웹 프레임워크입니다.",
    "passage: 오늘 점심 메뉴로 김치찌개를 선택했습니다.",
]

query_embeddings = model.encode(queries, normalize_embeddings=True)
passage_embeddings = model.encode(passages, normalize_embeddings=True)

# 내적 = 코사인 유사도 (L2 정규화된 경우)
scores = query_embeddings @ passage_embeddings.T
print(scores)
```

## instruct 버전: 태스크를 명시적으로 지정

`multilingual-e5-large-instruct`는 태스크 설명을 직접 프롬프트에 넣는 방식을 지원한다. 동일한 모델로 검색, 분류, 클러스터링 등 다양한 태스크를 전환할 수 있다.

```python
model = SentenceTransformer('intfloat/multilingual-e5-large-instruct')

def get_detailed_instruct(task_description, query):
    return f'Instruct: {task_description}\nQuery: {query}'

# 검색 태스크
retrieval_queries = [
    get_detailed_instruct(
        '관련 문서를 검색하세요',
        '한국 역사에서 조선시대의 과학 발전'
    )
]

# 클러스터링 태스크
clustering_queries = [
    get_detailed_instruct(
        '비슷한 주제의 뉴스 기사를 묶으세요',
        '삼성전자 3분기 실적 발표'
    )
]
```

태스크 설명이 없어도 기본 동작하지만, 명시적으로 태스크를 지정하면 성능이 소폭 향상된다.

## 한국어 MTEB 성능 비교

MTEB 한국어 벤치마크(`ko-MTEB`)에서의 multilingual-e5 성능은 다음과 같다. (2024년 기준 주요 모델 비교)

| 모델 | 평균 점수 | 검색(Retrieval) | STS |
|------|-----------|-----------------|-----|
| ko-sroberta-multitask | 55.2 | 52.1 | 84.3 |
| multilingual-e5-base | 61.8 | 64.2 | 83.7 |
| multilingual-e5-large | 65.4 | 68.9 | 85.1 |
| multilingual-e5-large-instruct | 67.2 | 71.3 | 85.8 |

특히 **Retrieval 태스크**에서의 격차가 크다. query/passage 비대칭 학습의 효과가 정보 검색 태스크에서 직접 반영된다.

## 한국어 전용 vs 다국어 모델 선택 기준

multilingual-e5를 한국어 전용 모델 대신 선택하는 경우를 정리하면 다음과 같다.

- **한국어 + 영어 혼합 문서**: 두 언어가 섞인 문서를 동일한 벡터 공간에서 검색해야 할 때
- **다국어 고객 지원**: 한국어, 영어, 일본어 쿼리를 하나의 파이프라인으로 처리할 때
- **번역 없는 크로스링구얼 검색**: 한국어 쿼리로 영어 문서를 검색하거나 그 반대의 경우

반면 순수 한국어 도메인에서 속도 최적화가 중요하다면, 파라미터가 작은 한국어 전용 모델이 유리할 수 있다.

## 마치며

multilingual-e5는 한국어 전용 모델이 아님에도 한국어 검색 파이프라인에서 경쟁력 있는 성능을 보여준다. 특히 다국어 환경이나 쿼리-문서 비대칭 검색 시나리오에서는 한국어 전용 모델보다 우수한 결과를 내는 경우가 많다. 다음 글에서는 또 다른 강력한 다국어 임베딩 모델인 BAAI의 BGE-M3를 살펴본다.

---

`#multilingual-e5` `#intfloat` `#다국어임베딩` `#E5` `#정보검색` `#MTEB` `#한국어NLP` `#시맨틱검색`
