# blog.metaphr.dev

metaphr의 블로그. 만든 것들의 제작기와 기술 정리, 읽은 것들의 기록을 올린다.

- 주소: https://blog.metaphr.dev
- 본 사이트: https://metaphr.dev

## 구조

- `_posts/` — 글. 파일 이름(`YYYY-MM-DD-slug.md`)이 곧 주소(`/YYYY-MM-DD/slug`)라서, 올린 글의 날짜나 슬러그를 바꾸면 기존 링크가 깨진다.
- `images/` — 글에 들어가는 이미지.
- `_layouts/`, `_includes/`, `_sass/`, `assets/` — 테마.
- `.pages.yml` — [Pages CMS](https://pagescms.org) 편집 화면 설정.

## 배포

`main`에 커밋하면 GitHub Pages가 Jekyll로 다시 빌드한다. 별도 빌드 스크립트는 없다.

로컬 미리보기:

```bash
bundle install
bundle exec jekyll serve
```

## 테마

[Rain](https://github.com/inelaah/rain)(MIT)을 바탕으로 고쳐 쓴다. 라이선스는 `LICENSE` 참고.
