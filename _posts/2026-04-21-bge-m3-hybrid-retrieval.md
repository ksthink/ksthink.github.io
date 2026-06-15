---
layout: post
title: "BGE-M3: 단일 모델로 Dense·Sparse·ColBERT 검색을 모두 지원하는 다국어 임베딩"
date: 2026-04-21
tags: [BGE-M3, BAAI, 다국어임베딩, 하이브리드검색, Dense검색, Sparse검색, ColBERT, 한국어NLP]
---

임베딩 기반 검색에는 크게 두 가지 패러다임이 있다. 밀집 벡터(Dense)를 이용한 시맨틱 검색과, BM25 같은 희소 벡터(Sparse)를 이용한 키워드 검색이다. 각각 장단점이 있어 실무에서는 두 방식을 혼합하는 하이브리드 검색이 자주 쓰인다. **BAAI/bge-m3**는 하나의 모델로 세 가지 검색 방식을 모두 지원하는 이례적인 모델이다.

## BGE-M3의 세 가지 검색 방식

BGE-M3(M3-Embedding)는 BAAI(Beijing Academy of Artificial Intelligence)가 2024년 공개했다. 이름의 M3는 **Multi-Functionality, Multi-Linguality, Multi-Granularity**를 뜻한다.

하나의 모델 가중치에서 세 가지 표현을 동시에 출력한다.

**1. Dense 임베딩 (시맨틱 검색)**
문장 전체를 하나의 고정 크기 벡터로 표현한다. 의미 유사도 기반 검색에 사용되며, FAISS 같은 벡터 인덱스와 결합한다.

**2. Sparse 임베딩 (어휘 검색)**
각 토큰에 가중치를 부여해 희소 벡터를 생성한다. BM25와 유사하지만 신경망이 학습한 토큰 중요도를 반영한다는 점이 다르다. Elasticsearch의 sparse vector 기능과 호환된다.

**3. ColBERT 스타일 다중 벡터 (세밀한 매칭)**
문서의 모든 토큰에 대해 벡터를 생성하고, 쿼리 토큰과의 최대 유사도 합산(MaxSim)으로 점수를 계산한다. 세밀한 토큰 수준의 매칭이 필요한 경우에 유리하다.

## 설치 및 사용

```bash
pip install FlagEmbedding
```

```python
from FlagEmbedding import BGEM3FlagModel

model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)

sentences = [
    "한국의 전통 발효 식품인 김치는 건강에 이롭습니다.",
    "kimchi is a traditional Korean fermented food that benefits health.",
    "오늘 날씨가 맑고 기온이 높습니다.",
]

# 세 가지 표현 동시 추출
output = model.encode(
    sentences,
    batch_size=12,
    max_length=8192,
    return_dense=True,
    return_sparse=True,
    return_colbert_vecs=True
)

dense_vecs = output['dense_vecs']       # shape: (3, 1024)
sparse_vecs = output['lexical_weights'] # dict of token: weight
colbert_vecs = output['colbert_vecs']   # list of (seq_len, 1024)
```

## 최대 8192 토큰 지원

기존 BERT 계열 임베딩 모델의 최대 입력 길이는 512 토큰이다. 이 제한은 긴 문서를 청킹해야 한다는 것을 의미한다. BGE-M3는 최대 **8192 토큰**까지 처리할 수 있어 긴 법률 문서, 논문, 계약서 등을 분할 없이 인코딩할 수 있다.

```python
# 긴 문서 처리 예시
with open('contract.txt') as f:
    long_doc = f.read()

embedding = model.encode(
    [long_doc],
    max_length=8192,
    return_dense=True
)
```

단, 긴 입력일수록 메모리 사용량과 추론 시간이 크게 증가하므로, 실시간 검색에는 적절한 길이 제한을 두는 것이 좋다.

## 한국어-영어 크로스링구얼 검색

BGE-M3의 가장 강력한 특징 중 하나는 한국어 쿼리로 영어 문서를 검색하거나, 그 반대 방향으로도 의미 있는 결과를 반환한다는 점이다.

```python
query = "query: 기후 변화가 북극 빙하에 미치는 영향"

passages = [
    "passage: Climate change is accelerating the melting of Arctic ice caps.",
    "passage: 기후 변화로 인해 북극의 빙하 면적이 매년 줄어들고 있습니다.",
    "passage: 오늘 한국 증시가 상승 마감했습니다.",
]

q_emb = model.encode([query], return_dense=True)['dense_vecs']
p_emb = model.encode(passages, return_dense=True)['dense_vecs']

scores = q_emb @ p_emb.T
# 영어 문서와 한국어 문서 모두 높은 점수, 관련 없는 문장은 낮은 점수
```

## 하이브리드 검색 구성

Dense와 Sparse를 결합하면 키워드 정확 매칭과 의미 유사도 검색의 장점을 모두 활용할 수 있다. Milvus, Qdrant 같은 벡터 데이터베이스에서 하이브리드 검색을 지원한다.

```python
# Dense와 Sparse 점수의 가중 합산
alpha = 0.5  # 0이면 순수 Sparse, 1이면 순수 Dense

def hybrid_score(dense_score, sparse_score, alpha=0.5):
    return alpha * dense_score + (1 - alpha) * sparse_score
```

alpha 값은 도메인에 따라 조정이 필요하다. 전문 용어가 많은 법률·의료 도메인은 낮은 alpha(Sparse 가중치 상향)가, 자연어 질의가 주를 이루는 일반 QA는 높은 alpha(Dense 가중치 상향)가 유리한 경향이 있다.

## 성능 및 한계

MTEB 벤치마크 기준으로 BGE-M3는 한국어 retrieval 태스크에서 multilingual-e5-large와 비슷하거나 소폭 높은 성능을 보인다. 특히 Sparse 임베딩을 활용하는 하이브리드 모드에서 dense-only 대비 명확한 성능 향상이 관찰된다.

한계는 모델 크기다. fp16 기준 약 2.2GB의 VRAM이 필요하며, CPU 추론 시 속도가 느리다. 경량 모델이 필요한 환경에서는 BGE-M3 대신 multilingual-e5-small이나 한국어 전용 base 모델이 현실적인 선택이다.

## 마치며

BGE-M3는 "하나의 모델로 모든 검색 시나리오를 커버한다"는 야심찬 목표를 가진 모델이다. 한국어 지원 품질도 충분히 검증되었으며, 특히 다국어 환경과 긴 문서 처리가 필요한 엔터프라이즈 RAG 시스템에서 강력한 선택지가 된다. 다음 글에서는 국내 AI 스타트업 Upstage가 개발한 Solar Embedding을 소개한다.

---

`#BGE-M3` `#BAAI` `#하이브리드검색` `#Dense검색` `#Sparse검색` `#ColBERT` `#다국어임베딩` `#한국어NLP` `#RAG`
