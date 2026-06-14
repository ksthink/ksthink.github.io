---
layout: post
title: "한국어 임베딩의 기초: 형태소 분석부터 Word2Vec까지"
date: 2025-09-15
tags: [한국어NLP, 임베딩, Word2Vec, 형태소분석, 자연어처리]
---

자연어처리(NLP)에서 텍스트를 벡터로 변환하는 과정을 **임베딩(Embedding)**이라고 한다. 영어와 달리 한국어는 교착어(agglutinative language)의 특성을 가지기 때문에, 임베딩 전에 반드시 형태소 분석 단계가 필요하다.

## 왜 한국어 임베딩은 어려운가

한국어는 하나의 어근에 조사, 어미, 접사가 결합하여 의미를 이루는 교착어다. 예를 들어 "먹었겠습니다"는 "먹-" + "-었-" + "-겠-" + "-습니다"로 분해되며, 이를 통째로 하나의 토큰으로 처리하면 어휘 폭발(vocabulary explosion) 문제가 발생한다.

영어 기반의 Word2Vec을 한국어에 그대로 적용하면 같은 의미의 단어가 형태 변화에 따라 전혀 다른 벡터를 가지게 된다. "학교가", "학교를", "학교에서"가 각각 다른 단어로 인식되는 것이다.

## 형태소 분석기 선택

한국어 NLP 파이프라인의 첫 단계는 형태소 분석이다. 대표적인 오픈소스 형태소 분석기로는 다음이 있다.

- **KoNLPy**: 파이썬 기반 한국어 형태소 분석 라이브러리. Okt, Komoran, Hannanum, Kkma, Mecab 등의 분석기를 통일된 인터페이스로 사용할 수 있다.
- **Mecab-ko**: 일본어용 Mecab을 한국어에 맞게 이식한 분석기. 속도가 빠르고 정확도가 높아 실무에서 자주 쓰인다.
- **Kiwi**: 2021년 공개된 분석기로, 별도 설치 없이 pip만으로 사용 가능하고 성능이 우수하다.

## Word2Vec for Korean

형태소 분석을 마친 후에는 Word2Vec을 적용할 수 있다. Word2Vec은 주변 단어의 맥락을 이용해 단어 벡터를 학습하는 모델로, Skip-gram과 CBOW 두 가지 방식이 있다.

```python
from konlpy.tag import Mecab
from gensim.models import Word2Vec

mecab = Mecab()
sentences = [mecab.morphs(sent) for sent in corpus]

model = Word2Vec(
    sentences,
    vector_size=300,
    window=5,
    min_count=5,
    sg=1  # Skip-gram
)
```

한국어 Word2Vec을 학습할 때는 뉴스, 위키피디아, 웹 크롤링 데이터 등 대용량 코퍼스를 사용할수록 품질이 높아진다. 국립국어원이 제공하는 말뭉치나 AIHub에서 공개한 데이터셋을 활용하는 것도 좋은 방법이다.

## FastText의 장점

한국어에는 Word2Vec보다 **FastText**가 더 유리한 경우가 많다. FastText는 단어를 문자 단위 n-gram의 합으로 표현하기 때문에, 학습 데이터에 등장하지 않은 단어(OOV, Out-of-Vocabulary)에 대해서도 벡터를 생성할 수 있다.

교착어 특성상 새로운 활용형이 끊임없이 생성되는 한국어에서 이 특성은 특히 유용하다. "공부하다"를 학습했다면, "공부해봤는데"처럼 처음 보는 형태에도 유사한 벡터를 부여할 수 있다.

## 마치며

형태소 분석 → 토크나이징 → 임베딩 학습의 3단계 파이프라인은 한국어 NLP의 기본 중의 기본이다. 다음 글에서는 이 기초 위에서 발전한 사전학습 언어 모델(KoBERT, KLUE-BERT 등)을 비교해 보겠다.

---

`#한국어NLP` `#임베딩` `#Word2Vec` `#FastText` `#형태소분석` `#KoNLPy` `#자연어처리`
