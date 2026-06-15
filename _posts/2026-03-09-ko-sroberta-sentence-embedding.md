---
layout: post
title: "ko-sroberta-multitask: NLI와 STS로 파인튜닝한 한국어 문장 임베딩"
date: 2026-03-09
tags: [ko-sroberta, 문장임베딩, STS, NLI, RoBERTa, 한국어NLP, HuggingFace]
---

한국어 문장 임베딩 오픈소스 모델 중 실무에서 가장 널리 쓰이는 것 중 하나가 **jhgan/ko-sroberta-multitask**다. KLUE-RoBERTa를 백본으로 사용해 STS(Semantic Textual Similarity)와 NLI(Natural Language Inference) 데이터를 동시에 학습한 멀티태스크 모델이다.

## 모델 개요

`ko-sroberta-multitask`는 Sentence-BERT(SBERT)의 학습 방식을 한국어에 적용한 모델이다. 원본 SBERT는 두 문장을 Siamese 네트워크에 통과시켜 코사인 유사도를 최대화하거나 NLI 레이블로 학습하는데, 이 모델은 두 방식을 병행하는 멀티태스크 학습으로 표현력을 높였다.

- **백본**: klue/roberta-base
- **학습 데이터**: KLUE-STS, KorNLI
- **풀링 방식**: Mean Pooling
- **출력 차원**: 768

## 설치 및 기본 사용

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('jhgan/ko-sroberta-multitask')

sentences = [
    "스마트폰 배터리가 빨리 소모됩니다.",
    "휴대폰 배터리가 금방 닳아요.",
    "오늘 날씨가 정말 좋네요.",
]

embeddings = model.encode(sentences)

# 코사인 유사도 계산
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print(cosine_similarity(embeddings[0], embeddings[1]))  # 약 0.91
print(cosine_similarity(embeddings[0], embeddings[2]))  # 약 0.32
```

의미가 유사한 두 문장(배터리 관련)은 높은 유사도를, 의미가 다른 문장(날씨)은 낮은 유사도를 보인다.

## Mean Pooling의 역할

BERT 계열 모델에서 문장 벡터를 추출하는 방법은 여러 가지가 있다.

| 방법 | 설명 | 단점 |
|------|------|------|
| [CLS] 토큰 사용 | 첫 번째 토큰의 벡터를 문장 표현으로 사용 | 의미론적 유사도에 부적합 |
| Max Pooling | 각 차원의 최댓값 취합 | 정보 손실 가능성 |
| Mean Pooling | 모든 토큰 벡터의 평균 | 안정적이고 균형 잡힌 표현 |

SBERT 계열 모델은 대부분 Mean Pooling을 채택한다. 어텐션 마스크를 반영해 패딩 토큰을 제외하고 평균을 내는 것이 핵심이다.

```python
import torch
from transformers import AutoTokenizer, AutoModel

tokenizer = AutoTokenizer.from_pretrained('jhgan/ko-sroberta-multitask')
model = AutoModel.from_pretrained('jhgan/ko-sroberta-multitask')

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(
        token_embeddings.size()
    ).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / \
           torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def encode(text):
    encoded = tokenizer(text, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        output = model(**encoded)
    return mean_pooling(output, encoded['attention_mask'])
```

## KLUE-STS 벤치마크 성능

KLUE-STS 태스크는 두 문장 쌍의 유사도를 0~5 점수로 레이블한 데이터셋이다. 모델 성능은 피어슨 상관계수(Pearson's r)로 평가한다.

| 모델 | Pearson's r |
|------|-------------|
| KoBERT + [CLS] | 0.652 |
| ko-sroberta-nli | 0.854 |
| **ko-sroberta-multitask** | **0.897** |
| KLUE-RoBERTa-large (파인튜닝) | 0.921 |

멀티태스크 학습이 단일 태스크 NLI 학습보다 STS 성능을 유의미하게 끌어올린 것을 확인할 수 있다.

## 같은 계열의 다른 모델

jhgan이 공개한 한국어 문장 임베딩 시리즈는 다음과 같다.

- `jhgan/ko-sbert-nli`: KoBERT 기반, NLI만 학습
- `jhgan/ko-sbert-sts`: KoBERT 기반, STS만 학습
- `jhgan/ko-sroberta-nli`: KLUE-RoBERTa 기반, NLI 학습
- `jhgan/ko-sroberta-sts`: KLUE-RoBERTa 기반, STS 학습
- `jhgan/ko-sroberta-multitask`: KLUE-RoBERTa 기반, NLI + STS 동시 학습 **(권장)**

일반적으로 multitask 버전이 가장 범용적인 성능을 보이므로, 특별한 이유가 없다면 이 모델을 기본값으로 선택하는 것이 합리적이다.

## 실무 활용 팁

문서 검색이나 중복 감지 파이프라인에 이 모델을 쓸 때 고려할 점이 있다.

**배치 처리**: 대량의 문서를 인코딩할 때는 `batch_size` 파라미터를 활용하면 속도가 크게 개선된다.

```python
embeddings = model.encode(
    large_corpus,
    batch_size=64,
    show_progress_bar=True,
    convert_to_tensor=True
)
```

**정규화**: 코사인 유사도 대신 내적(dot product)으로 검색 속도를 높이려면 벡터를 L2 정규화해야 한다.

```python
from sentence_transformers import util
embeddings_normalized = util.normalize_embeddings(embeddings)
```

## 마치며

`ko-sroberta-multitask`는 공개된 지 수 년이 지났음에도 한국어 시맨틱 검색 파이프라인의 베이스라인으로 자주 선택된다. 구현이 간단하고 레퍼런스가 풍부하며 성능이 검증되어 있다는 것이 강점이다. 다음 글에서는 동일한 대조 학습 패러다임을 다른 방식으로 구현한 KoSimCSE를 더 깊이 살펴본다.

---

`#ko-sroberta` `#문장임베딩` `#STS` `#NLI` `#Sentence-BERT` `#KLUE` `#한국어NLP` `#HuggingFace`
