---
layout: post
title: "Solar Embedding: Upstage가 공개한 한국어 특화 임베딩 모델"
date: 2026-05-04
tags: [Solar, Upstage, 한국어임베딩, 문장임베딩, MTEB, LLM기반임베딩, 한국어NLP]
---

국내 AI 스타트업 Upstage는 Solar LLM 시리즈로 널리 알려져 있지만, 임베딩 분야에서도 주목할 만한 오픈소스 모델을 공개했다. **solar-embedding-1-large**는 한국어와 영어 모두에서 높은 성능을 보이며, HuggingFace에 오픈소스로 공개되어 있다.

## Solar Embedding의 배경

Upstage는 2024년 MTEB 리더보드에서 영어 임베딩 1위를 기록한 바 있는 `E5-mistral-7b-instruct`와 유사한 방향성을 취한다. LLM(Large Language Model)의 디코더 아키텍처를 임베딩 용도로 파인튜닝하는 방식이다.

기존 BERT 계열 임베딩 모델과의 가장 큰 차이는 **백본 아키텍처**다. BERT가 인코더-온리(encoder-only) 트랜스포머인 반면, Solar Embedding은 디코더 기반 모델을 임베딩 태스크에 맞게 조정했다. 이를 통해 LLM이 학습한 풍부한 언어 표현을 임베딩에 활용한다.

## HuggingFace에서 사용하기

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    'Upstage/solar-embedding-1-large',
    trust_remote_code=True
)

# 쿼리와 문서는 역할에 따라 인코딩 방식을 구분
query = "태양광 발전의 경제성은 어떻게 되나요?"
documents = [
    "태양광 발전 비용은 최근 10년간 90% 이상 하락하여 화력발전과 비슷한 수준에 도달했습니다.",
    "태양은 지구로부터 약 1억 5천만 킬로미터 떨어진 별입니다.",
    "재생에너지 투자는 장기적으로 탄소 배출 감소와 에너지 자립에 기여합니다.",
]

# query 인코딩
query_embedding = model.encode(query, prompt_name="query")

# document 인코딩
doc_embeddings = model.encode(documents)

# 유사도 계산
import numpy as np
scores = np.dot(query_embedding, doc_embeddings.T)
print(scores)
```

## 아키텍처 특징: LLM-based 임베딩

디코더 기반 LLM을 임베딩 모델로 변환하는 핵심 기법은 **마지막 토큰 풀링(Last Token Pooling)**이다. BERT의 [CLS] 토큰에 해당하는 역할을 디코더 모델에서는 시퀀스의 마지막 토큰이 수행하도록 한다.

```
입력: "한국어 임베딩 모델 [EOS]"
         ↓
   디코더 레이어들
         ↓
마지막 토큰([EOS])의 hidden state → 문장 벡터
```

이 방식은 양방향 어텐션이 아닌 단방향(causal) 어텐션을 사용하지만, 실제 임베딩 품질은 충분히 높다는 것이 여러 벤치마크를 통해 검증되었다.

## 한국어 성능

solar-embedding-1-large는 한국어 MTEB에서 다음과 같은 성능을 보인다.

| 태스크 유형 | 점수 | 비고 |
|-------------|------|------|
| Retrieval | 73.1 | 한국어 문서 검색 |
| STS | 87.4 | 문장 의미 유사도 |
| Classification | 71.8 | 텍스트 분류 |
| Clustering | 52.3 | 문서 군집화 |

STS 태스크에서의 87.4는 앞서 소개한 모델들과 비교해도 최상위권에 해당한다.

## 모델 크기와 추론 비용

디코더 기반이라는 특성상 BERT 계열 모델보다 파라미터 수가 많다. solar-embedding-1-large의 파라미터 수는 약 4B 수준으로, GPU 없이 CPU만으로 실시간 추론하기에는 무거운 편이다.

| 모델 | 파라미터 | VRAM (fp16) | 추론 속도 |
|------|----------|-------------|-----------|
| ko-sroberta-multitask | 125M | ~0.25GB | 매우 빠름 |
| multilingual-e5-large | 560M | ~1.1GB | 빠름 |
| BGE-M3 | 570M | ~1.1GB | 빠름 |
| solar-embedding-1-large | ~4B | ~8GB | 느림 |

성능과 속도의 트레이드오프가 명확하다. 오프라인 배치 처리나 GPU 인프라가 충분한 환경에서는 최고 품질의 임베딩을 얻을 수 있지만, 실시간 검색 API에서는 추론 지연이 문제가 될 수 있다.

## 배치 임베딩 최적화

대량 문서를 처리할 때는 배치 크기와 fp16 설정을 활용해 처리 속도를 높일 수 있다.

```python
from sentence_transformers import SentenceTransformer
import torch

model = SentenceTransformer(
    'Upstage/solar-embedding-1-large',
    trust_remote_code=True,
    model_kwargs={"torch_dtype": torch.float16}
)

large_corpus = [...]  # 수천~수만 개의 문장

embeddings = model.encode(
    large_corpus,
    batch_size=32,       # GPU 메모리에 맞게 조정
    show_progress_bar=True,
    normalize_embeddings=True,
)
```

## 마치며

Solar Embedding은 LLM 기반 임베딩이 BERT 계열 모델의 성능 상한을 넘어설 수 있다는 것을 보여준다. 한국어를 잘 이해하는 LLM 백본을 활용했기 때문에 특히 복잡한 한국어 문장의 의미 파악에서 강점이 있다. 다음 글에서는 국내 학술계에서 나온 검색 특화 임베딩 모델인 KURE를 소개한다.

---

`#Solar` `#Upstage` `#LLM임베딩` `#한국어임베딩` `#MTEB` `#문장임베딩` `#한국어NLP` `#시맨틱검색`
