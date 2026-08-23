---
layout: post
title: "한국어 문장 임베딩과 RAG: KoSimCSE부터 실전 검색까지"
date: 2026-02-20
slug: korean-sentence-embedding-rag
tags: [문장임베딩, RAG, KoSimCSE, 시맨틱검색, 벡터DB, 한국어NLP]
published: true
---

단어 임베딩이 개별 단어의 의미를 벡터로 표현한다면, **문장 임베딩(Sentence Embedding)**은 문장 전체의 의미를 하나의 벡터로 압축한다. 최근 RAG(Retrieval-Augmented Generation) 아키텍처가 확산되면서 고품질 한국어 문장 임베딩의 중요성이 더욱 커졌다.

## 문장 임베딩의 필요성

BERT 계열 모델은 [CLS] 토큰의 벡터를 문장 표현으로 쓰는 경우가 많지만, 이 방법은 의미적 유사도 측정에 적합하지 않다는 것이 실증 연구를 통해 밝혀졌다. 의미가 비슷한 두 문장의 [CLS] 벡터가 코사인 유사도 기준으로 오히려 낮은 값을 보이는 경우가 흔하다.

이 문제를 해결하기 위해 등장한 것이 **Sentence-BERT(SBERT)** 방식이다. Siamese 네트워크 구조로 두 문장을 동시에 학습시켜, 의미적으로 유사한 문장끼리 벡터 공간에서 가까이 위치하도록 만든다.

## KoSimCSE

**KoSimCSE**는 SimCSE(Simple Contrastive Learning of Sentence Embeddings) 방법론을 한국어에 적용한 모델이다. SimCSE는 동일한 문장을 두 번 인코딩할 때 드롭아웃(dropout)의 랜덤성을 이용해 자연스러운 positive pair를 생성하고, 다른 문장들을 negative로 대조 학습한다.

unsupervised SimCSE 방식은 레이블 없는 대규모 텍스트만으로도 좋은 문장 임베딩을 학습할 수 있다는 장점이 있다.

```python
from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F

model_name = 'BM-K/KoSimCSE-roberta-multitask'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def get_embedding(text):
    inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :]  # CLS token

sent1 = "한국어 자연어처리 모델을 비교합니다."
sent2 = "국어 NLP 모델들을 살펴봅니다."
sent3 = "오늘 점심 메뉴는 무엇인가요?"

emb1 = get_embedding(sent1)
emb2 = get_embedding(sent2)
emb3 = get_embedding(sent3)

print(F.cosine_similarity(emb1, emb2))  # 높은 유사도
print(F.cosine_similarity(emb1, emb3))  # 낮은 유사도
```

## RAG에서 한국어 임베딩 활용

RAG는 LLM의 할루시네이션 문제를 줄이고 최신 정보를 반영하기 위해, 외부 문서를 검색해 프롬프트에 주입하는 아키텍처다. 이때 **검색(Retrieval)** 단계의 품질이 전체 시스템 성능을 좌우한다.

한국어 RAG 파이프라인의 일반적인 구성은 다음과 같다.

1. **문서 청킹(Chunking)**: 긴 문서를 의미 단위로 분할. 한국어는 문단 경계와 문장 경계를 구분해서 청킹하는 것이 좋다.
2. **임베딩**: 각 청크를 한국어 문장 임베딩 모델로 벡터화.
3. **벡터 저장**: FAISS, Chroma, Weaviate, Qdrant 등 벡터 데이터베이스에 저장.
4. **검색**: 쿼리를 동일한 임베딩 모델로 벡터화하고 코사인 유사도로 top-k 청크 검색.
5. **생성**: 검색된 청크를 컨텍스트로 LLM에 전달해 답변 생성.

## 임베딩 모델 선택 시 고려 사항

한국어 RAG에 쓸 임베딩 모델을 고를 때 체크해야 할 항목이 있다.

- **최대 토큰 길이**: BERT 계열은 512 토큰이 상한이다. 긴 청크를 처리하려면 Longformer 계열이나 API 기반 모델을 검토해야 한다.
- **도메인 적합성**: 법률·의료·금융 등 전문 도메인은 범용 임베딩 모델보다 도메인 특화 모델이 유리하다.
- **추론 속도**: 실시간 검색이 필요한 경우 경량 모델(small, base)이 적합하다.
- **MTEB 한국어 벤치마크**: Massive Text Embedding Benchmark에 한국어 태스크가 포함되어 있어 모델 간 성능 비교에 활용할 수 있다.

## 마치며

한국어 문장 임베딩 기술은 빠르게 발전하고 있다. KoSimCSE 외에도 KURE(Korea University Retrieval Embeddings), Upstage의 Solar Embedding 등 새로운 모델이 지속적으로 공개되고 있다. RAG 파이프라인을 구축할 때는 단일 모델에 고착되지 않고, 실제 도메인 데이터로 검색 품질을 직접 평가해 보는 과정이 필수적이다.

---

`#문장임베딩` `#RAG` `#KoSimCSE` `#시맨틱검색` `#벡터DB` `#한국어NLP` `#LLM` `#FAISS`
