---
layout: post
title: "Claude Code 베스트 프랙티스 정리: Claude가 못 보는 것을 알려주고, 확인 수단을 주고, 예외 없는 규칙은 강제하라"
date: 2026-10-29
slug: claude-code-best-practices
tags: [Claude Code, Anthropic, AI, 코딩에이전트, 베스트프랙티스]
published: true
---

Anthropic이 공식 문서로 공개한 "Best practices for Claude Code"를 한국어로 풀어 정리했다. 원문 문장을 그대로 옮긴 번역이 아니라, 원문의 구성과 제목을 따라가며 내용을 내 말로 설명한 글이다. 코드, 명령어, 파일 이름, CLI 플래그는 원문 그대로 두었다. 원문 링크는 글 끝의 출처에 있다.

## 핵심 요약

- 요즘 Claude Code는 기본값만으로도 대부분 잘 돌아간다. 이 문서는 기본값으로 부족할 때, 즉 코드만 봐서는 알 수 없는 지식·규칙·제약이 프로젝트에 있을 때 무엇을 하면 좋은지를 다룬다.
- 지시는 두 종류다. 프롬프트·`CLAUDE.md`[^1]·스킬[^2]처럼 모델이 읽고 판단하는 것(비결정적)과, 훅[^3]·deny 규칙[^4]·관리형 설정[^5]처럼 Claude Code(하네스[^6])가 매번 강제하는 것(결정적)이다. 대부분은 Claude가 판단하게 두고, 절대 예외가 없어야 하는 것만 강제한다.
- Claude에게는 저장소를 읽어서는 알 수 없는 것만 알려준다. 구체적인 프롬프트를 쓰고, `CLAUDE.md`는 짧게 유지하고, 팀 절차는 스킬로, 외부 시스템은 CLI나 MCP[^7]로 연결한다.
- Claude가 스스로 통과/실패를 확인할 수 있는 수단(테스트, 빌드, 린터, 스크린샷 등)을 주면, 고치고 확인하는 루프를 혼자 돌린다. "다 됐다"는 말보다 실행한 명령과 출력 같은 증거를 요구한다.
- 기본값(auto 모드[^8], 모델과 effort[^9], 서브에이전트[^10], 자동 압축[^11])은 작업이 시간·토큰[^12]·승인 요청을 너무 많이 쓸 때만 바꾼다. 먼저 `/usage`로 어디에 쓰였는지 본다.
- 세션은 처음 1분을 지켜보고, 엇나가면 `Esc`로 멈추고, 두 번 고쳐도 안 되면 `/clear` 후 더 나은 프롬프트로 다시 시작한다.
- 무인 실행 전에는 완료 기준, 자체 검증 수단, 접근 범위, 중단 조건(턴·비용 상한), 결과를 누가 승인하는지를 정해 둔다.
- 대문자 강조, "think harder", "끝까지 계속해" 같은 예전 요령은 이제 대부분 필요 없다.

## 들어가며: 기본값이 부족할 때

원문은 먼저 Claude Code가 새 세션의 평범한 첫 프롬프트만으로도 대개 올바르게 동작하도록 만들어져 있다고 말한다. 예로 세 가지를 든다. 새 터미널·VS Code 세션은 위험한 동작을 분류기[^13]가 미리 검토하는 auto 모드로 시작하고, 독립적인 작업은 서브에이전트에 맡겨 병렬로 처리하며, 컨텍스트[^14] 창이 차기 전에 대화를 자동으로 압축한다.

이 문서가 다루는 것은 그 기본값으로 부족한 경우다. 누군가의 머릿속에만 있는 배포 절차, 절대 읽으면 안 되는 파일, 완료로 치기 전에 반드시 통과해야 하는 검사, 지켜야 할 예산처럼 코드만 봐서는 알 수 없는 것들이다.

세션이 기대대로 안 풀릴 때 원인은 거의 넷 중 하나라고 정리한다.

- 원하던 것과 다른 결과물이 나오거나, 세션마다 같은 사실을 다시 찾아낸다. 저장소에 없는 정보가 빠진 경우다. → "Claude가 못 보는 것을 알려주기"
- 다 됐다고 했는데 덜 됐다. 스스로 확인할 수단이 없었던 경우다. → "Claude에게 실행할 검사 주기"
- 절대 하면 안 되는 일을 했거나, 반드시 해야 하는 단계를 건너뛰었다. 프롬프트만으로는 보장할 수 없다. → "예외 없는 규칙은 강제하기"
- 결과는 맞았지만 시간·토큰·승인 요청이 너무 많이 들었다. → "기본값 바꾸기"

이어서 무인 실행에 같은 원칙을 적용하는 절과, 이제 그만해도 되는 조언을 모은 절이 있다고 안내한다. 팀 전체 설정은 별도 페이지(Set up Claude Code for your organization)에서 다룬다.

## 결정적 지시와 비결정적 지시

Claude Code에 주는 지시는 두 가지 중 하나다.

1. 비결정적 지시: 사람이 쓰고 모델이 읽는다. 프롬프트, `CLAUDE.md`, 스킬이 여기에 속한다. 모델은 대개 따르지만, 따른다는 보장은 없다.
2. 결정적 지시: 사람이 설정하고 Claude Code(하네스)가 반드시 실행한다. 훅, deny 규칙, 관리형 설정이 여기에 속한다. 모델이 무엇을 판단했든 매번 적용된다.

원문은 대부분의 기능이 두 형태로 존재한다며 표로 대비한다. 요약하면 이렇다.

- 무엇을 할지: 프롬프트·`CLAUDE.md`·Claude가 알아서 쓰는 스킬 ↔ 훅, 사용자만 시작할 수 있는 스킬
- 무엇을 건드릴 수 있는지: auto 모드 분류기 ↔ deny 규칙, strict 모드 샌드박스[^15], 관리형 설정
- 언제 끝났는지: 증거 요청, `/goal`, `/code-review` ↔ 테스트, 타입체크, `Stop` 훅, CI
- 얼마나 쓰는지: effort 수준, Claude의 자체 속도 ↔ `-p`와 함께 쓰는 `--max-turns`나 `--max-budget-usd`, 설정한 지출 한도
- 최종 결정권: Claude가 쓴 작업 요약 ↔ 브랜치 보호, 머지를 승인하는 사람

대부분은 Claude가 판단하게 두는 편이 낫다고 원문은 말한다. 거의 모든 지침에는 예외가 있고, 실제 코드를 앞에 둔 모델이 미리 써 둔 규칙보다 판단을 잘하는 경우가 많기 때문이다. 결정적 지시는 무조건 일어나야 하는(또는 절대 일어나면 안 되는) 일에 쓴다. 대단한 것일 필요는 없다. 프로덕션 배포나 남의 작업 위 force push 같은 큰 위험은 auto 모드가 이미 막는다. 보통은 `src/gen/`의 생성된 클라이언트를 절대 수정하지 않기, 파일을 만든 뒤 항상 라이선스 헤더 스크립트 실행하기처럼 프로젝트 고유의 규칙이다. 이런 줄을 `CLAUDE.md`에 써도 거의 지키지만, 아무리 강하게 써도 따를지는 결국 Claude의 판단이다.

팁: `CLAUDE.md`의 한 줄을 계속 강조해도 놓친다면 그 줄은 훅으로 옮길 신호다. 반대로 단순한 선호에 훅을 걸어 두었다면 지우고 Claude에게 맡긴다.

## Claude가 못 보는 것을 알려주기

핵심은 저장소를 읽어서 찾을 수 없는 것, 또는 매 세션 다시 찾느라 시간을 쓰게 되는 것만 적으라는 것이다. Claude는 코드를 읽는 데 매우 능숙해서 파일 구조, 컨벤션, 테스트 프레임워크, 기존 컴포넌트 구성 방식을 사람이 설명하는 것보다 빨리 파악한다. 찾지 못하는 것은 회의에서 정한 결정, 한 사람 머릿속에 있는 배포 절차, 통합 테스트에 필요한 환경 변수처럼 애초에 저장소에 없던 정보다. 저장소에 있긴 하지만 찾는 데 몇 분씩 걸리는 정보도 적어 둘 가치가 있다.

적기 전에 던질 질문은 두 가지다. 코드를 읽으면 찾을 수 있는가? 실제로 찾아보러 가겠는가? 둘 다 "예"라면 적지 않는다.

### 구체적인 프롬프트 쓰기

구체적인 프롬프트가 도움이 되는 이유도 같다. Claude가 모르는 정보를 주기 때문이다. 파일을 짚고, 증상을 설명하고, "고쳐졌다"가 어떤 상태인지 처음부터 말하면 수정 왕복을 한 번 줄일 수 있다. 합리적인 두 방식 중 어느 쪽을 원하는지도 코드에서는 읽을 수 없으니, 신경 쓴다면 미리 말한다.

원문의 대비 예시는 다음과 같다(프롬프트는 원문 그대로).

| 이렇게 말하는 대신 | 이렇게 |
| :- | :- |
| *"fix the login bug"* | *"users report login fails after the session times out. look at token refresh in src/auth/, write a failing test that reproduces it, then fix it"* |
| *"add a calendar widget"* | *"follow the pattern in HotDogWidget.php and build a calendar widget that lets you pick a month and page between years. no new libraries"* |

필요한 것을 이미 갖고 있다면 설명하지 말고 건네준다.

- 파일: `@`와 경로를 입력해 파일 내용을 메시지에 포함한다.
- 이미지: 디자인이나 오류 스크린샷을 프롬프트에 붙여 넣는다.
- 명령 출력: 셸에서 `cat error.log | claude -p "what's going on here"`처럼 파이프로 넘긴다.

`think step by step`이나 `be thorough` 같은 문구는 특별한 키워드가 아니라 평범한 프롬프트 텍스트다. Claude가 얼마나 깊이 생각할지를 정하는 주된 수단은 effort 수준이다. 이런 문구는 effort 설정 안에서 살짝 밀어줄 수는 있어도 그 이상으로 끌어올리지는 못한다.

반면 `be ambitious`는 여전히 쓸모가 있다. Claude는 사용자가 얼마나 기대하는지 알 수 없어서 요청을 보수적으로 읽고 최소한으로 만드는 경향이 있다. 엣지 케이스와 자연스러운 후속 작업까지 포함한 더 완성된 버전을 원하면 그렇게 말하면 된다.

```text
build the settings page from the mockup. be ambitious: empty and error states, the save flow wired up, keyboard navigation, not just the layout
```

이는 얼마나 깊이 생각하라는 말이 아니라, 사용자만 아는 작업 범위를 알려주는 것이다. 한편 특정 문제를 고치는 게 아니라 탐색 중이라면 `what would you improve in this file?` 같은 모호한 프롬프트도 괜찮다. 중간에 조금 더 고쳐 줘야 하는 것이 그 대가다.

### 먼저 Claude와 브레인스토밍하기

무엇을 원하는지 아직 정확히 모를 때는 다 정리하고 나서 프롬프트를 쓸 필요가 없다. Claude에게 인터뷰를 요청하면 된다.

```text
I want to add rate limiting to the public API but haven't thought it through yet. Interview me until you could write the spec, then write it to SPEC.md.
```

그러면 Claude가 아직 정하지 않은 부분, 예를 들어 사용자별 제한인지 키별 제한인지, 한도를 넘은 요청은 어떻게 할지, 무엇이 범위 밖인지를 객관식 질문으로 묻고, 답이 명세가 될 때까지 계속 묻는다. `SPEC.md`가 생기면 새 세션을 열어 그 파일을 바탕으로 구현한다. 깨끗한 컨텍스트와 글로 적힌 완료 기준에서 출발할 수 있고, 나중에 리뷰어에게 기준으로 건넬 파일도 이것이다.

### CLAUDE.md는 짧게

Claude Code는 `CLAUDE.md`를 모든 세션에 불러온다. 그래서 그 안의 모든 줄은 관련이 있든 없든 모든 작업에서 Claude의 주의를 조금씩 차지한다. 따라서 코드에서 알아낼 수 없는 것만 담는 것이 좋다. 원문이 꼽는 항목은 다음과 같다.

- 이 저장소에서 작업을 확인하는 방법: 정확한 테스트·타입체크·린트 명령, 테스트 파일 하나만 돌리는 법
- 코드가 오해를 부르는 곳: 곳곳에 남아 있지만 새 코드에서는 따라 하면 안 되는 옛 패턴, 안 쓰는 것처럼 보이지만 실제로는 쓰이는 디렉터리
- 저장소에 없는 결정: 팀이 정한 에러 헬퍼, 배포 방식, 마이그레이션 리뷰가 필요한 것
- 이미 두 번 이상 고쳐 줘야 했던 것

이 기준을 통과한 `CLAUDE.md`는 짧다. 원문의 예시:

```markdown
# Commands
- Install: pnpm install
- Run one test file: pnpm vitest run path/to/file.test.ts
- Typecheck: pnpm tsc --noEmit

# Conventions
- Use the error helpers in src/lib/errors.ts, never throw raw strings
- src/legacy/ is still live but don't copy its patterns into new code

# Gotchas
- Integration tests need DATABASE_URL set, see .env.example
```

세션에서 `/context`를 실행하면 파일이 로드됐는지 확인할 수 있다.

타입체크 줄에 명령만 있다는 점에 주목하라고 원문은 짚는다. Claude가 작업하며 스스로 확인하려면 명령을 알아야 한다. 끝내기 전에 타입체크 통과를 강제하고 싶다면 그건 `Stop` 훅의 일이다. 이 파일에 `Always typecheck before you finish`라고 쓰면 대부분은 지키지만 매번은 아니다.

처음부터 쓸 필요도 없다.

- `/init`이 코드베이스를 보고 초안을 만든다. 이후 작업은 주로 줄을 지우는 것이다. 메모리 가이드는 200줄 이하를 권한다.
- `/doctor`는 Claude가 코드에서 이미 알아낼 수 있는 내용을 덜어내라고 제안한다.
- `/doctor prompt-audit`은 예전 모델용으로 쓰인 지시, 더는 없는 파일을 가리키는 지시, 서로 모순되는 지시를 찾아낸다.

개인 취향은 `CLAUDE.md` 대신 `CLAUDE.local.md`에 두고, 이 파일을 `.gitignore`에 추가해 저장소에 들어가지 않게 한다.

참고: `CLAUDE.md`에 있는 줄을 Claude가 계속 무시한다면 IMPORTANT를 붙여도 해결되지 않을 가능성이 크다. 파일이 길어져 그 줄이 묻혔거나, 예외가 없어야 하는 규칙이라서 훅으로 옮겨야 하는 경우다.

### 규칙을 코드베이스의 일부로 한정하기

특정 영역에서만 의미 있는 규칙은 `.claude/rules/`에 `paths:` 필터와 함께 둔다. 그러면 Claude가 실제로 그 영역을 작업할 때만 로드된다. 원문 예시는 `src/api/` 아래 TypeScript 파일에만 적용되는 `.claude/rules/api.md`다.

```markdown
---
paths:
  - "src/api/**/*.ts"
---
- Validate request bodies with the zod schemas in src/api/schemas/, don't hand-roll checks
- Every new endpoint needs an entry in openapi.yaml, CI fails without it
```

### 팀 절차는 스킬에 담기

모델이 똑똑해져도 우리 팀의 릴리스 방식, 장애 대응 런북, API 문서 작성 방식까지 알지는 못한다. 이런 지식은 `.claude/skills/<name>/SKILL.md`에 저장하는 스킬로 만든다.

스킬은 이런 용도에서 `CLAUDE.md`보다 컨텍스트 부담이 적다. Claude가 스스로 시작할 수 있는 스킬은 세션마다 이름과 설명만 보이고, 작업에 필요할 때만 전체 파일을 읽는다. 긴 릴리스 절차가 상관없는 버그 수정 작업에 짐이 되지 않는다. 스킬에도 `CLAUDE.md`와 같은 원칙이 적용된다. Claude가 스스로 찾을 수 없는 것만 적는다.

실제로 릴리스를 내는 것처럼 부작용이 있는 워크플로에는 `disable-model-invocation: true`를 넣는다. 그러면 Claude가 스스로 그 스킬을 시작할 수 없고, 사용자가 직접 `/release`를 입력할 때만 실행된다. 원문 예시(`.claude/skills/release/SKILL.md`):

```markdown
---
name: release
description: Cut a new release. Bumps the version, writes the changelog entry, tags it and pushes the tag so CI can publish.
disable-model-invocation: true
---
1. Make sure you're on main with a clean tree. If not, stop and ask.
2. Run `pnpm changeset version` and commit the result.
3. Summarize the PRs merged since the last tag into CHANGELOG.md, one line each, user-facing changes only.
4. Tag `v<new version>` and push the tag. CI publishes from there, never publish from your machine.
```

### 필요한 도구 연결하기

Claude가 못 보는 정보 중 일부는 이슈 트래커나 에러 대시보드처럼 아예 다른 시스템에 있다. 그 시스템에 CLI가 있다면 그게 보통 가장 쉬운 길이다. 예를 들어 `gh`가 설치되어 로그인돼 있으면 Claude는 따로 설명하지 않아도 PR을 열고 리뷰 댓글을 읽는다. 처음 보는 CLI라도 `--help`를 알려주면 충분하다.

CLI가 없는 시스템에는 MCP가 있다. 셸에서 서버를 추가한다.

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

추가한 서버는 세션 안의 `/mcp`에 나타난다. 연결된 서버는 쓰지 않을 때도 도구 이름과 설명을 컨텍스트에 더하므로, 필요 없는 서버는 거기서 꺼 두는 게 좋다. 타입이 있는 언어로 작업한다면 code intelligence 플러그인을 쓰면 Claude가 여러 파일을 뒤지지 않고 정의로 바로 이동할 수 있다.

## Claude에게 실행할 검사 주기

Claude는 작업이 끝나 보이면 멈춘다. 실제로 끝났는지 알려줄 실행 수단이 없으면 "끝나 보인다"가 판단 근거의 전부다. 그러면 사실상 사용자가 테스트 스위트 역할을 하게 되고, 실수는 사용자가 우연히 발견할 때까지 남아 있다.

통과/실패를 돌려주는 무언가를 주면 Claude가 그 루프를 스스로 닫는다. 변경하고, 검사를 돌리고, 깨졌으면 출력을 읽고 고친 뒤 다시 돌린다. 결과를 Claude가 읽을 수만 있으면 검사는 거의 무엇이든 된다. 테스트 파일, 빌드 종료 코드, 린터, 출력과 픽스처를 비교하는 스크립트, 목업 옆에 놓은 브라우저 스크린샷 등이다. 저장소에 이미 이런 것이 있다면 `CLAUDE.md`에서 가장 유용한 한 줄은 그것을 실행하는 명령이다.

검사를 얼마나 엄격하게 할지는 선택이다. 원문은 Claude가 스스로 판단하는 쪽부터 Claude Code가 강제하는 쪽까지 네 가지를 든다.

- 프롬프트로: `run the auth tests after, and keep going until they pass`. 만족 여부는 Claude가 판단한다. 설정 없이 어떤 작업에도 바로 쓸 수 있다.
- 목표로: `/goal all tests in tests/auth pass and lint is clean`은 매 턴이 끝날 때마다 별도 모델이 대화를 보고 조건 충족 여부를 확인하게 하고, 충족될 때까지 Claude가 계속한다. 직접 지켜보는 세션에서는 거의 필요 없지만, 긴 백그라운드 실행에서 Claude가 남은 항목이 있는데도 진행 요약으로 턴을 끝내 버릴 때 다시 일하게 만든다.
- `Stop` 훅으로: Claude가 턴을 끝내려 할 때마다 스크립트를 실행하고, 스크립트가 종료 코드 2로 끝나면 Claude를 다시 작업으로 돌려보낸다. 하네스가 강제하므로 타입체크가 통과하거나 차단 횟수 한도에 이를 때까지 턴이 끝나지 않는다.
- 코드를 쓰지 않은 쪽의 리뷰로: 터미널에서 `/code-review`는 대화를 본 적 없는 새 서브에이전트가 diff를 리뷰하게 한다. 코드를 만든 추론에 휩쓸리지 않는다.

어떤 방식을 쓰든 증거를 요구하라고 원문은 강조한다. 실행한 명령과 그 출력, 또는 스크린샷이다. "All tests pass"라는 말만으로는 알 수 있는 게 거의 없고, 출력을 읽는 편이 직접 다시 돌리는 것보다 빠르다. 지켜보지 않은 세션이라면 그것이 유일한 증거다.

팁: Claude가 끝났다고 하면 세션에서 `/verify`를 실행할 수도 있다. Claude가 앱을 빌드·실행하고 결과를 직접 보게 해서, 테스트나 타입체크가 놓치는 문제를 잡는다.

### 명세에 비추어 리뷰하기

일반적인 버그 찾기보다 계획대로 구현됐는지를 확인하고 싶다면 리뷰 프롬프트를 직접 쓴다.

```text
use a subagent to review the rate limiter diff against SPEC.md, check every requirement is implemented and the listed edge cases have tests, report gaps that affect correctness and skip style
```

여기서 `skip style` 부분을 빼지 말라고 원문은 당부한다. 문제를 찾으라는 요청을 받은 리뷰어는 언제나 뭔가를 찾아내고, 지적을 전부 반영하다 보면 불필요한 추상화 계층과 일어날 수 없는 경우를 위한 테스트가 늘어난다.

### Stop 훅으로 검사 강제하기

타입체크 규칙의 `Stop` 훅 버전은 `.claude/settings.json`에 몇 줄이면 된다. 종료 코드 2가 멈춤을 막고, 명령이 stderr로 출력한 내용은 아직 끝낼 수 없는 이유로 Claude에게 전달된다. 그래서 컴파일러 출력을 stderr로 돌린다.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "pnpm tsc --noEmit 1>&2 || exit 2" }
        ]
      }
    ]
  }
}
```

동작을 확인하려면 타입을 깨뜨리는 변경을 요청해 본다. Claude는 끝내는 대신 컴파일러 오류를 받아 `tsc`가 통과할 때까지 계속한다. 도구 호출 없이 훅이 연속 여덟 번 멈춤을 막으면 Claude Code가 다음 차단을 무시하고 턴을 끝낸다. 이 한도를 올리려면 `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`을 설정한다.

## 예외 없는 규칙은 강제하기

매번 반드시 일어나야 하는 것은 훅, deny 규칙, 관리형 설정으로 만든다. `CLAUDE.md`는 지침을 위한 곳이고, Claude는 지침이 이번에는 해당하지 않는다고 판단할 수 있다.

원문은 `Never read .env`, `Always run the formatter after editing`, `Don't touch the migrations folder` 세 규칙을 예로 든다. Claude는 이것들을 거의 항상 지키지만, "거의"로는 부족한 것만 `CLAUDE.md`에서 빼서 하네스가 직접 적용하는 설정으로 옮긴다. 그러면 결과가 모델의 기억이나 판단에 좌우되지 않는다.

### 훅으로 단계 강제하기

훅은 Claude 루프의 정해진 지점, 즉 도구 호출 전후, 멈추려 할 때, 세션 시작 시 등에 사용자가 지정한 것을 실행한다. 실행 대상은 셸 명령(가장 흔함), HTTP 엔드포인트로의 POST, MCP 서버의 도구 호출, 또는 모델이 판단하는 `prompt`·`agent` 훅일 수 있다.

`prompt`·`agent` 훅은 다른 모델에게 판단을 맡기므로 이것도 결정적이지 않다. 진짜로 강제하려면 `command`나 `http` 훅을 쓰고, 훅 자체가 죽거나 시간 초과될 때도 동작을 막아야 한다면 `onFailure: "block"`을 추가한다. 예를 들어 커밋에서 비밀 정보를 검사하는 훅이라면 스캐너가 멈췄을 때 검사 없이 통과시키기보다 커밋을 막는 편이 낫다.

포매터 규칙을 `PostToolUse` 훅으로 만든 원문 예시다. 모든 `Edit`·`Write` 뒤에 실행되며, 실행 주체가 Claude가 아니므로 Claude가 규칙을 기억하는지는 더 이상 상관없다.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "npx prettier --write --ignore-unknown \"$(jq -r '.tool_input.file_path')\"" }
        ]
      }
    ]
  }
}
```

확인하려면 Prettier가 포맷하는 파일에 들여쓰기가 틀린 줄을 넣어 달라고 해 본다. 저장된 파일은 들여쓰기가 고쳐진 상태로 돌아온다.

마이그레이션 규칙은 `migrations/` 아래 경로면 종료 코드 2로 끝나는 `PreToolUse` 훅이 된다. 직접 작성할 필요 없이 `write a hook that blocks edits to the migrations folder`라고 프롬프트를 주면 되고, `/hooks`에서 결과를 볼 수 있다. 다만 과용은 금물이다. 훅은 예외가 하나도 없는 규칙을 위한 것이고, `Prefer named exports`처럼 예외가 많은 규칙은 `CLAUDE.md`에 남긴다.

### 권한 규칙과 샌드박스로 접근 제한하기

권한 규칙은 Claude가 무엇을 실행하고, 읽고, 가져올 수 있는지 정한다. `deny` 규칙은 auto와 `bypassPermissions`를 포함한 모든 권한 모드에서 유지되는데, 바로 그래서 `.env` 규칙은 여기에 둬야 한다.

```json
{
  "permissions": {
    "allow": ["Bash(pnpm tsc --noEmit)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)", "Read(./.env.local)", "Read(./secrets/**)"]
  }
}
```

이렇게 저장하면 `.env` 내용을 물어도 `Read` 도구로든 `cat .env`로든 실패한다. 다만 규칙은 의도가 아니라 도구 호출을 매칭하므로 경계를 알아 둘 필요가 있다.

- `Read` 규칙은 `cat .env`를 잡는다. Claude Code가 흔한 파일 읽기 명령을 인식하기 때문이다.
- 파일을 여는 스크립트는 잡지 못한다.
- 특정 도메인에 대한 `WebFetch` deny 규칙은 샌드박스가 켜져 있지 않으면 같은 도메인으로의 `curl`을 막지 못한다.

파일 시스템이나 네트워크 접근을 OS 수준에서 제한하려면 세션에서 `/sandbox`로 샌드박스를 켠다. macOS, Linux, WSL2에서 Claude의 셸 명령을 가두고, `Read` deny 규칙과 `WebFetch(domain:...)` 규칙도 반영하므로 보안 관련이라면 둘 다 쓰는 게 좋다. 기본적으로 Claude는 막힌 명령을 샌드박스 밖에서 다시 실행하겠다고 요청할 수 있고, 이 요청은 일반 권한 흐름을 거친다. `/sandbox`의 **Overrides** 탭에 있는 strict 샌드박스 모드는 이 재시도를 끈다.

경고: auto 모드는 하드 규칙이 아니라 각 동작을 판단하는 분류기 모델이다. 판단을 잘하지만 판단인 이상 틀릴 수 있고, 무엇을 위험하게 볼지 조정할 수도 있으며, 조직이 아예 끌 수도 있다. 그러니 "절대 안 됨" 규칙은 deny 규칙이나 훅에 둔다.

### 규칙을 누구에게 적용할지 정하기

규칙이 어디에 있느냐가 적용 대상을 정한다.

- `.claude/settings.local.json`과 `~/.claude/settings.json`은 나에게만 적용된다. 명령에 대해 **Yes, and don't ask again**을 고르면 Claude Code가 그 규칙을 로컬 파일에 저장한다.
- `.claude/settings.json`과 그 안의 훅은 저장소에 속한다. 커밋하면 저장소에서 작업하는 모두에게 적용된다. deny 규칙은 바로 적용되지만, `allow` 규칙은 각자가 그 폴더의 신뢰 대화상자를 수락해야 적용되고, 훅이 언제부터 실행되는지도 워크스페이스 신뢰가 결정한다.
- 관리형 설정은 조직에 속한다. 관리 콘솔, MDM, 또는 `managed-settings.json` 파일에서 오며, 어떤 개인 설정 파일도 이를 덮어쓸 수 없다. 그래서 보안팀 정책을 둘 유일한 곳이다.

범위와 상관없이 강제 규칙의 수는 적게 유지하라고 원문은 권한다. 모든 훅과 deny 규칙은 가끔 엉뚱하게 발동하고, 누군가 하나하나 관리해야 한다. 마흔 개쯤 쌓였다면 대부분은 Claude가 스스로 판단할 수 있었던 선호일 가능성이 크다.

## 기본값 바꾸기

기본값은 작업이 시간·토큰·중단을 지나치게 많이 쓰기 전까지는 그대로 둬도 충분하다. 그런 일이 생기면 세션에서 `/usage`로 어디에 쓰였는지 먼저 본다.

원문에 따르면 새 세션은 이미 몇 가지를 정해 둔다. 대화형 터미널·VS Code 세션은 auto 모드로 시작하고, 대부분의 요금제와 제공자에서 Claude Opus 5.5를 medium effort로 쓰며, 필요하다고 보면 서브에이전트에 일을 맡기고, 대화가 길어지면 압축한다. 작업 비용이 과하다면 대개 이 넷 중 하나가 원인이다.

### 권한 모드 바꾸기

권한 범위의 양 끝에는 각각 비용이 있다.

- **Manual mode**: 읽기 전용이 아닌 모든 편집과 명령을 직접 승인한다. 안전하지만 열 번째쯤부터는 읽지 않고 승인하게 되고, 자리를 비우면 아무것도 진행되지 않는다.
- **`bypassPermissions`**: deny·ask 규칙이 다루지 않는 모든 것을 승인한다. 버려도 되는 컨테이너에서나 쓸 만하다.

auto 모드는 그 사이에 있고, 대화형 터미널·VS Code 세션의 시작 모드다. Claude는 일상적인 승인 때문에 멈추지 않고 일하며, 별도의 분류기 모델이 정해진 순서로 동작을 실행 전에 검사한다. 분류기가 주로 막는 것은 사람이라면 멈추고 싶을 일들이다: `curl | bash`, 프로덕션 배포와 마이그레이션, 남의 작업 위 force push, 민감한 데이터를 외부로 보내는 것, 사용자가 아니라 Claude가 읽은 콘텐츠에 이끌린 것으로 보이는 동작.

차단이 일어나면 알림이 오고, 그 동작은 `/permissions`의 **Recently denied**에 나타나 수동 승인으로 재시도할 수 있다. 연속 세 번(또는 총 스무 번) 차단되면 auto 모드가 멈추고 다시 사용자에게 묻는다.

auto 모드는 결정적 통제를 대체하지 않는다. 그것들보다 나중에 실행되기 때문이다. deny·ask 규칙과 `PreToolUse` 훅은 분류기보다 먼저 적용되므로 deny 규칙은 auto 모드에서도 똑같이 막고, 샌드박스도 자신이 감싸는 셸 명령을 계속 가둔다.

참고: 대화 중에 `don't push until I've reviewed`라고 말하면 분류기가 이를 차단 신호로 다룬다. 하지만 여전히 모델이 대화를 읽는 것이고, 대화가 압축되면 그 문장이 사라질 수 있으니 중요한 것은 deny 규칙에 둔다.

반대로 분류기가 내 환경에서는 일상적인 작업을 반복해서 막는 문제도 있다. 매번 수동 승인하는 대신 `autoMode.allow`에 추가하거나 auto 모드 설정에 신뢰하는 인프라를 적는다. 패턴이 아니라 평범한 영어로 쓰며, `/auto-mode-setup`이 프로젝트와 최근 세션을 보고 `environment` 부분 초안을 만들어 준다. 원문 예시(`~/.claude/settings.json`):

```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Source control: github.com/example-org and every repo under it",
      "Trusted internal domains: *.internal.example.com"
    ],
    "allow": [
      "$defaults",
      "Deploying to the staging namespace is fine, it's isolated from production and resets nightly"
    ]
  }
}
```

경고: 설정하는 모든 목록에 `"$defaults"`를 남겨야 한다. 없으면 내 항목이 내장 규칙에 추가되는 게 아니라 내장 규칙을 대체한다. `environment`와 `allow`에서는 내장 컨텍스트와 예외를 잃고, `soft_deny` 목록에서 빠지면 force push와 프로덕션 배포에 대한 내장 차단이 사라진다. 또 `autoMode` 블록은 프로젝트가 아니라 `~/.claude/settings.json`에 있어야 한다. 분류기는 프로젝트 설정의 `autoMode`를 무시한다.

모든 편집과 명령을 미리 보고 싶다면 세션에서 `Shift+Tab`으로 Manual을 포함한 권한 모드를 순환하거나, 셸에서 `claude --permission-mode manual`로 시작한다. Manual이 너무 자주 묻는다면 `/fewer-permission-prompts`가 최근 대화 기록에서 흔한 읽기 전용 Bash·MCP 호출을 찾아 `.claude/settings.json`의 허용 목록에 추가한다.

### 모델과 effort 바꾸기

effort는 Claude가 얼마나 오래 생각할지를 정하는 주된 수단이며, 예전에 프롬프트 문구로 하던 일 대부분을 대신한다. Claude Opus 5.5, Sonnet 5.5, Haiku 5.5의 기본값은 `medium`이고, 범위가 분명한 일상적 기능 작업에는 충분하다. 세션에서 `/effort`로 바꿀 만한 경우는 다음과 같다.

- `/effort high`나 `/effort xhigh`로 올리기: 놓치기 쉬운 경우를 잘 챙겨야 결과가 맞는 작업. 내가 쓰지 않은 코드의 버그, 불안정한 테스트, 옛 구조를 읽는 곳을 모두 찾아야 하는 스키마 변경 등이다. Claude가 엣지 케이스를 더 확인하고 작업을 더 검증하는 데 시간과 토큰을 쓴다.
- `/effort low`로 내리기: 빠르게 주고받으며 결과를 어차피 하나하나 검토할 때. 브레인스토밍, 첫 스케치, 몇 개 파일에 걸친 이름 변경 등이다. 시작점을 더 빨리 받고, 어차피 매 단계를 조종하니 추가 숙고로 달라질 것이 대기 시간 말고는 별로 없다.
- `max`는 보안 취약점 찾기처럼 사용자 없이 Claude가 끝까지 파고들어야 하는 어려운 문제에만 쓴다. 평범한 작업에서는 과하게 생각해서, `high`보다 나을 것 없는 답에 더 많은 비용을 치를 수 있다.
- 다음 메시지 하나에만 필요하다면, 설정을 바꾸는 대신 그 프롬프트에 `ultrathink`를 넣는다.

모델은 기본 Opus 5.5가 대부분의 코딩을 잘 처리하고, Sonnet은 일상 작업에서 더 저렴하다. Claude Fable 5.1은 `/model fable`로 명시적으로 고를 때 쓸 수 있고, Haiku는 단순한 일을 하는 서브에이전트에 잘 맞는다. 요금제·제공자별 전체 목록은 모델 설정 문서에 있다.

### 서브에이전트 비용 알기

Claude는 스스로 서브에이전트에 일을 맡긴다. 넓은 코드베이스 검색은 내장 Explore 에이전트에게 가고, fork 모드가 켜져 있으면(기본값) 곁가지 작업이 포크되며, 시작된 서브에이전트는 기본적으로 백그라운드에서 돌아 메인 대화가 계속 진행된다.

서브에이전트가 이득인 경우:

- 독립적인 작업을 동시에 돌려 전체를 더 빨리 끝낼 때
- 전체 테스트 실행이나 넓은 검색처럼 긴 출력을 메인 대화 밖에 둘 때(그렇지 않으면 세션 끝까지 따라다닌다)
- 코드가 작성되는 과정을 보지 않은 리뷰어가 필요할 때
- 읽기만 하고 편집은 못 하는 리뷰어처럼 메인 세션보다 적은 도구로 일을 시킬 때

비용은 주로 토큰이다. 서브에이전트마다 자체 요청을 보내고 메인 대화와 같은 사용량에서 차감된다. 때로는 시간도 든다. 새 서브에이전트는 메인 대화가 이미 가진 컨텍스트를 먼저 모아야 해서, 그 자리에서 하는 것보다 오히려 느릴 수 있다. 또 기본적으로 같은(또는 더 작은) 모델이 같은 작업을 하는 것이라, 병렬성이나 새로운 시각은 얻어도 더 똑똑한 답을 얻는 건 아니다.

비용을 줄이는 방법:

- 모듈을 import하는 파일 모으기나 문서 링크 확인처럼 단순한 일이라면 서브에이전트 정의에 `model: haiku`를 지정한다.
- 짧은 요약으로 돌려받게 해서 결과 스무 개가 결국 컨텍스트를 채우지 않게 한다.
- `/usage`로 서브에이전트 유형별 사용량 비중을 보고 제값을 하는지 판단한다.
- `.claude/agents/`의 커스텀 서브에이전트에 `tools: Read, Grep, Glob`만 준다. 그러면 아무것도 편집할 수 없는 리뷰어가 되고, 이 제한은 프롬프트로 부탁하는 게 아니라 Claude Code가 강제한다.

그 리뷰어는 짧은 파일 하나, `.claude/agents/reviewer.md`다.

```markdown
---
name: reviewer
description: Reviews changed files against the spec they were built from. Use after implementing a feature, before opening the PR.
tools: Read, Grep, Glob
---
You're reviewing code you didn't write. Compare the changed files against the spec you're given,
check that every requirement is implemented and the listed edge cases have tests,
and report only the gaps that affect correctness. Skip style.
```

Claude에게 `have the reviewer compare the rate limiter against SPEC.md`라고 하면 빠진 부분이 세션으로 돌아오고, Claude가 그것을 고칠 수 있다.

### 비용과 컨텍스트 줄이기

현재 대부분의 모델은 100만 토큰 창을 쓰고 그 상한 근처에서 압축하므로 컨텍스트가 바닥나는 일은 드물다. 그래도 필요 없는 컨텍스트에 비용을 낼 수는 있다. 매 요청이 대화 전체를 보내기 때문에, 서로 무관한 작업 세 개가 쌓인 세션은 네 번째 작업의 매 턴마다 앞의 세 개를 다시 읽는다. 캐시가 살아 있는 동안에는 할인되지만 만료되면 정가다.

먼저 볼 곳은 `/usage`다. Pro, Max, Team, Enterprise에서는 스킬·서브에이전트·플러그인·MCP 서버별로 사용량을 나눠 보여 주고, 긴 컨텍스트나 잦은 캐시 미스 같은 패턴이 사용량의 10%를 넘으면 표시해 준다. 흔한 해결책은 다음과 같다.

- 무관한 작업 사이에 `/clear`. 비용이 들지 않고, 다음 작업이 이전 작업 기록의 비용을 계속 치르지 않게 한다. `/clear oauth-migration`처럼 쓰면 떠나는 세션에 이름을 붙여 나중에 돌아올 수 있다.
- 초점을 준 `/compact`. 예: `/compact keep the API changes and the test commands`. 긴 세션에서는 `/compact` 자체가 대화 전체를 읽어 요약하는 큰 요청이고, 캐시가 만료된 뒤라면 더 그렇다.
- 백그라운드 작업 주시. `/loop`, 매 턴 뒤의 목표 확인, Claude 자신의 서브에이전트는 사용자가 입력하지 않는 동안에도 요청을 계속 보낸다.

참고: 프롬프트 캐시[^16]는 구독에서는 약 1시간, API 키·클라우드 제공자·사용량 크레딧에서는 5분 유지된다. 서브에이전트는 따로 바꾸지 않으면 5분이다. 1시간 캐시에서 약 200K 토큰을 넘은 세션이 유휴 상태로 있으면 캐시 만료 직전에 압축되므로, 점심 먹고 오면 요약에서 이어가게 된다. 기록이 전혀 필요 없다면 새 세션이 여전히 더 싸다.

## 세션 조종하기

처음 1분을 지켜보고, Claude가 엇나가는 순간 `Esc`를 누르고, 두 번 고쳐도 안 되면 세 번째 수정 대신 `/clear` 후 더 나은 프롬프트를 쓴다. 원문은 어떤 설정도 이것을 대신하지 못한다며, 손에 익혀 둘 몇 가지 조작을 꼽는다.

- `Esc`: 동작 중인 Claude를 멈추고 그때까지의 결과는 유지한다. 작업을 잃지 않고 방향을 바꿀 수 있다.
- `/rewind`, 또는 빈 프롬프트에서 `Esc` 두 번: 되감기 메뉴를 연다. 코드, 대화, 또는 둘 다를 이전 프롬프트 시점으로 되돌린다. 그래서 과감한 방식을 먼저 시도하고 안 되면 되감는 것이 부담이 적다. 같은 메뉴에서 오래된 대화 일부를 요약할 수도 있다.
- `/clear`: 처음부터 다시 시작한다. 같은 것을 두 번 고쳤는데도 틀리면, 세 번째 수정은 실패한 시도 두 개가 이미 담긴 대화에 더해질 뿐이다. 배운 것을 담은 새 프롬프트 하나와 `/clear`가 거의 항상 더 낫다.

경고: 체크포인트는 메인 대화에서 Claude가 자체 파일 도구로 편집한 파일만 다룬다. Bash 명령으로만 건드린 파일은 복원되지 않는다. git을 대체하는 게 아니라 함께 쓰는 것이다.

작은 기능 두 가지도 있다. `/btw`는 기록에 아무것도 남기지 않고 짧은 질문에 답한다. 며칠에 걸친 작업은 세션에서 `/rename oauth-migration`으로 이름을 붙이면 나중에 셸에서 `claude --resume oauth-migration`으로 체크포인트까지 포함해 이어갈 수 있다. `claude --continue`는 가장 최근 세션을 이어간다.

## 사용자 없이 Claude 돌리기

무인 실행 전에 확인할 것: 완료가 어떤 모습인지 아는가, 스스로 검증할 수 있는가, 건드려야 할 것만 건드릴 수 있는가. 턴이나 비용 상한을 두고, 끝에는 사람이 결과를 승인한다.

지켜보고 있을 때는 Claude가 컨텍스트를 놓쳐도 한두 메시지 안에 알아채고 말해 주면 된다. 하지만 자기 전에 걸어 둔 실행에는 말해 줄 사람이 없어서, 아침에 보니 밤새 잘못된 가정 위에 쌓아 올렸더라는 일이 생긴다. 원문은 작업을 혼자 돌리기 전에 그 작업을 염두에 두고 다섯 가지를 점검하라고 한다.

1. 완료 기준을 아는가? 목표 조건, 명세 파일, 또는 통과시켜야 할 실패 테스트.
2. 스스로 검증할 수 있는가? 테스트 스위트, `Stop` 훅, 일종의 리뷰 단계.
3. 무엇을 건드릴 수 있는가? 권한 규칙, `dontAsk`, 샌드박스, 워크트리[^17], 푸시할 수 있는 단 하나의 브랜치.
4. 무엇이 멈추게 하는가? `--max-turns`, `--max-budget-usd`, 지출 한도.
5. 결과는 어디로 가고 누가 승인하는가? PR, 댓글, 또는 요약, 그리고 머지·배포 등 되돌릴 수 없는 일을 승인하는 사람.

일단 시작되면 Claude는 긴 작업을 혼자 끝까지 끌고 간다. 사람에게 남는 일은 시작하기, 이번의 "완료"를 정하기, 마지막에 머지 승인하기다.

### 스크립트에서 Claude 실행하기

`claude -p "prompt"`[^18]는 한 번 실행하고 종료한다. Claude Code가 CI 잡, git 훅, 셸 루프에 들어가는 방식이 이것이다. 스크립트에서는 거의 항상 다음 플래그를 더 쓰게 된다.

- `--bare`: 훅, 스킬, 플러그인, MCP 서버, 그리고 저장소와 머신의 `CLAUDE.md` 파일을 모두 건너뛰어 어디서 돌려도 같은 동작을 하게 한다. claude.ai 로그인도 쓰지 않으며, 인증은 `ANTHROPIC_API_KEY`, `--settings`로 넘긴 파일의 `apiKeyHelper`, 또는 클라우드 제공자 자격 증명에서 온다.
- `--append-system-prompt`, `--mcp-config`, `--settings`: 실행에 실제로 필요한 것을 명시적으로 넘긴다.
- `--allowedTools`는 도구를 미리 승인하고, `--permission-mode dontAsk`는 그 밖에 승인 요청이 필요했을 모든 것을 거부한다.
- `--output-format json`은 파싱할 결과 객체 하나를 주고, `stream-json`을 `--verbose`와 함께 쓰면 이벤트를 실시간으로 스트리밍한다.

이를 합친 원문 예시:

```bash
for file in $(cat files.txt); do
  claude --bare -p "Migrate $file to the new logger API and commit. Reply OK or FAIL." \
    --allowedTools "Read,Edit,Bash(git add *),Bash(git commit *)" \
    --permission-mode dontAsk \
    --max-turns 20
done
```

실행이 끝나면 Claude는 `OK`나 `FAIL`로 답하고, 턴 한도에 걸린 실행은 오류로 종료된다. 먼저 파일 세 개로 시도해서 무엇이 잘못되는지 보고, 프롬프트를 고친 다음 나머지를 돌리라고 원문은 권한다.

`--permission-mode auto`를 주면 `-p`에서도 auto 모드를 쓸 수 있다. 비대화형 실행에서는 분류기 차단이 그 동작 하나만 거부하고 Claude는 계속 진행하며, 터미널에서처럼 반복 차단으로 실행이 멈추지 않는다. 원문은 이 방식에 기대기 전에 이 경우 임계값이 어떻게 적용되는지 문서를 읽어 보라고 한다.

### 일정이나 이벤트로 실행 시작하기

일단 실행되면 나머지는 Claude가 처리하지만, 시작을 스스로 결정하지는 못한다. 사람이든 타이머든, 실패한 CI 검사나 새 PR 같은 이벤트든 무언가가 시작시켜야 한다.

열린 세션 안에서는 `/loop`가 일정 간격으로 프롬프트를 반복한다.

```text
/loop 15m check CI on this branch, and if it's red pull the failing job's log, fix it and push
```

각 실행은 같은 세션의 또 다른 턴이므로 긴 대화에 걸어 두지 않는다. 노트북을 닫은 동안에도 일어나야 하는 일이라면 `/schedule`로 타이머에 따라 도는 클라우드 예약 작업을 만든다. 이것은 API 키가 아니라 claude.ai 로그인이 필요하다. Claude에게 부탁해 GitHub 이벤트 트리거를 추가하거나, claude.ai/code/routines에서 API 트리거를 추가할 수 있다.

경고: 클라우드 예약 작업을 돌려 두기 전에, 작업이 우회할 수 없는 GitHub 브랜치 규칙으로 `main`을 보호한다. 새로 만든 것은 무인으로 믿기 전에 처음 몇 번의 실행을 지켜본다.

### 세션 병렬로 돌리기

여러 작업을 동시에 진행할 때는 각각 별도의 체크아웃을 줘서 편집이 충돌하지 않게 한다. `claude -w feature-auth`는 새 워크트리에서 세션을 시작하고, 데스크톱 앱은 이런 세션 여러 개를 나란히 돌리며, 클라우드 세션은 내 머신 대신 클라우드에서 돌린다.

워크트리는 새 체크아웃이라 `.env` 같은 gitignore된 파일이 없고 의존성도 설치돼 있지 않다. 전자는 저장소 루트의 `.worktreeinclude`(문법은 `.gitignore`와 같음)에 필요한 gitignore 파일을 적어 두면 Claude Code가 만드는 모든 워크트리에 복사해 준다.

```text
.env
.env.local
config/dev-credentials.json
```

링크가 아니라 복사이므로 작은 파일만 넣는다. `node_modules`를 넣으면 워크트리마다 통째로 복사된다. 큰 디렉터리에는 `worktree.symlinkDirectories` 설정을 쓰거나, 설치 명령을 `CLAUDE.md`에 적어 새 체크아웃에서 시작할 때마다 Claude가 실행하게 한다.

정리는 대부분 직접 할 필요가 없다.

- 이름 없는 워크트리 세션을 종료하면, 안에 아무것도 없을 경우 Claude Code가 워크트리를 지운다. 이름 있는 세션이나 변경 사항이 있는 세션은 어떻게 할지 묻는다.
- 서브에이전트 워크트리는 변경 없이 끝나면 사라진다.
- 남겨진 서브에이전트·백그라운드 세션 워크트리는 `cleanupPeriodDays`보다 오래되고 작업 내용이 없으면 정리된다.

참고: `claude -p --worktree` 실행은 묻지 않고 종료하므로 직접 정리해야 한다. `git worktree remove <path>`로 지우고, 워크트리가 잠겨 있다고 git이 거부하면 먼저 `git worktree unlock <path>`를 실행한다.

여러 파일에 걸친 하나의 큰 기계적 변경에는 `/batch migrate every handler to the v2 response helpers`처럼 쓴다. 작업을 5~30개 단위로 나눠 계획을 보여 준 뒤, 각 단위를 자체 워크트리에서 실행하고 PR을 연다. 셸에서 `claude agents`(아직 리서치 프리뷰)는 내 머신의 백그라운드에서 돌고 있는 모든 것을 한 화면에 보여 준다.

두 번째 세션은 가장 쉽게 얻을 수 있는 독립 리뷰어이기도 하다. 한 세션이 rate limiter를 작성하고, 작성 과정을 보지 않은 다른 세션이 `@src/middleware/rateLimiter.ts`를 리뷰한 뒤, 그 결과를 첫 세션에 붙여 넣는다. `/code-review`와 같은 발상을 사람이 메시지를 옮기며 하는 셈이다.

## 이제 그만해도 되는 것

원문은 이 목록의 조언 모두 쓰일 당시에는 좋은 조언이었지만, 대부분 모델이 아직 안정적으로 하지 못하던 일을 우회하는 요령이었고 이제 모델이 따라잡았다고 말한다. 요약하면 다음과 같다.

- 컨텍스트 창이 주된 제약이니 적극적으로 관리하라 → 대부분의 모델이 100만 토큰 창을 갖고 자동 압축되니 바닥나는 일은 드물다. 그래도 작업 사이 `/clear`는 여전히 할 만하다. 초점 잡힌 컨텍스트가 더 좋은 답을 주고 비용도 적다.
- 자꾸 놓치는 지시에 IMPORTANT나 대문자를 붙여라 → 요즘 모델은 평이하게 쓴 줄도 따르고, 강조를 쌓으면 오히려 규칙을 과하게 적용한다. 굽힐 수 없는 규칙이면 훅이나 deny 규칙으로, 긴 파일에 묻히는 거라면 파일을 줄인다.
- 컨텍스트를 아끼려고 서브에이전트를 써라 → 컨텍스트 부족은 이제 드문 문제다. 서브에이전트는 병렬 작업, 시끄러운 출력 격리, 독립 리뷰에 여전히 좋지만 각각 토큰이 더 든다.
- 더 좋은 답을 얻으려면 서브에이전트에 맡겨라 → 같은 작업을 넘긴다고 답이 좋아지지 않는다. 추론 과정을 보지 않은 새 리뷰어가 도움이 되는 것은 위임과는 다른 이야기다.
- 프롬프트에 `think hard`, `think harder`, `be thorough` → 그건 effort의 몫이다. 이 문구들은 effort 설정 안에서 살짝 밀어주는 평범한 텍스트다. `ultrathink`는 여전히 동작하며, effort 설정을 건드리지 않고 그 한 턴만 더 깊이 추론하게 한다.
- 계속하라, 끝날 때까지 반복하라, 게으름 피우지 마라 → 요즘 모델은 합의된 작업을 말하지 않아도 이어가고, 이런 문구는 멈춤을 고치기보다 과잉 작업을 부르기 쉽다. 통과해야 할 검사를 주는 것은 다른 이야기이고 여전히 할 만하다. 실행이 중간에 멈추면 `continue`라고 하고, 아무도 지켜보지 않는 실행이라면 `/goal`이나 `Stop` 훅으로 강제한다.
- `CLAUDE.md`에 아키텍처와 파일 구조를 설명하라 → Claude는 저장소를 직접 읽는다. 저장소에 없는 것만 적는다.

그리고 이 페이지의 다른 조언도 언젠가 쓸데없는 일처럼 느껴진다면, 아마 이 목록에 들어갈 때가 된 것이라고 덧붙인다.

## 관련 자료

원문 끝에는 다음 문서들이 연결되어 있다.

- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works): 루프, 도구, 시작 시 로드되는 것
- [Explore the context window](https://code.claude.com/docs/en/context-window): 세션에서 공간을 차지하는 것과 로드 시점
- [Extend Claude Code](https://code.claude.com/docs/en/features-overview): 스킬, 훅, MCP, 서브에이전트, 플러그인 중 고르기
- [Choose a permission mode](https://code.claude.com/docs/en/permission-modes), [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Manage costs effectively](https://code.claude.com/docs/en/costs)
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless), [Automate work with cloud scheduled tasks](https://code.claude.com/docs/en/routines)
- 팀 리드·관리자용: [Set up Claude Code for your organization](https://code.claude.com/docs/en/admin-setup)

## 용어 풀이

[^1]: **CLAUDE.md**: 프로젝트 폴더에 두는 메모 파일. Claude Code가 세션을 시작할 때마다 자동으로 읽어 들이므로, 코드만 봐서는 모르는 명령어·규칙·주의 사항을 적어 두는 곳이다.
[^2]: **스킬**: 특정 절차나 팀 지식을 `.claude/skills/<name>/SKILL.md` 파일로 저장해 둔 것. Claude가 스스로 꺼내 쓸 수 있는 스킬은 평소 이름과 설명만 보이다가 필요할 때 전체 내용을 읽는다.
[^3]: **훅(hook)**: Claude가 도구를 쓰기 전후, 작업을 끝내려 할 때처럼 정해진 시점에 내가 지정한 명령이 자동으로 실행되게 하는 장치. 모델의 판단과 상관없이 매번 실행된다.
[^4]: **deny 규칙**: 권한 설정에서 특정 도구 호출(예: 특정 파일 읽기)을 금지하는 규칙. 어떤 권한 모드에서도 유지된다.
[^5]: **관리형 설정(managed settings)**: 조직 관리자가 배포하는 설정. 개인 설정으로 덮어쓸 수 없어 회사 보안 정책을 강제하는 데 쓰인다.
[^6]: **하네스(harness)**: 모델(Claude)을 감싸고 실제로 도구 실행, 권한 확인, 설정 적용을 담당하는 프로그램, 즉 Claude Code 자체를 가리킨다.
[^7]: **MCP**: Model Context Protocol. AI 도구가 외부 서비스(노션, 이슈 트래커 등)의 기능을 표준 방식으로 불러 쓸 수 있게 해 주는 연결 규약.
[^8]: **auto 모드**: 권한 모드 중 하나. 일상적인 동작은 묻지 않고 진행하되, 위험해 보이는 동작은 별도의 분류기 모델이 실행 전에 검사해 막는다.
[^9]: **effort**: Claude가 답하기 전에 얼마나 오래, 깊이 생각할지 정하는 설정값.
[^10]: **서브에이전트**: 메인 대화와 별도로 Claude가 띄우는 보조 작업자. 자기만의 컨텍스트에서 일을 처리하고 결과만 돌려준다. 병렬 작업이나 독립 리뷰에 쓰이지만 토큰을 따로 쓴다.
[^11]: **압축(compaction)**: 대화가 길어지면 지난 내용을 요약본으로 바꿔 컨텍스트 공간을 확보하는 것. 압축 뒤에는 그 요약본을 바탕으로 작업을 이어 간다.
[^12]: **토큰**: 모델이 글을 처리하는 기본 단위(단어 조각 정도). 사용량과 비용, 컨텍스트 크기가 모두 토큰 수로 계산된다.
[^13]: **분류기(classifier)**: 어떤 입력을 보고 '허용/차단'처럼 범주를 판정하는 모델. 여기서는 auto 모드에서 각 동작이 위험한지 판단하는 별도 모델을 말한다.
[^14]: **컨텍스트(컨텍스트 윈도)**: 모델이 한 번에 참고할 수 있는 대화·파일 내용의 범위. 토큰 단위로 크기가 정해져 있고, 매 요청마다 대화 전체가 다시 전송된다.
[^15]: **샌드박스**: Claude가 실행하는 셸 명령을 운영체제 수준에서 가두는 격리 환경(macOS·Linux·WSL2 지원).
[^16]: **프롬프트 캐시**: 같은 대화 앞부분을 다시 보낼 때 이전 처리 결과를 재사용해 비용을 줄여 주는 기능. 일정 시간이 지나면 만료된다.
[^17]: **워크트리(worktree)**: git 기능의 하나로, 같은 저장소를 별도 폴더에 하나 더 체크아웃한 것. 여러 작업을 서로 충돌 없이 동시에 진행할 수 있다.
[^18]: **헤드리스 실행**: 대화 화면 없이 명령 한 줄로 실행하고 결과만 받아 끝내는 방식(`claude -p`). 스크립트나 CI에서 쓴다.

## 출처

- 원문: [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) (Anthropic 공식 Claude Code 문서)
- 열람일: 2026-10-29
- 이 글은 원문을 한국어로 요약·해설한 것으로, Anthropic의 공식 번역이 아니다. 원문의 구성과 제목을 따랐고, 코드·명령어·파일 이름·CLI 플래그는 원문 그대로 옮겼다. 정확한 내용과 최신 변경 사항은 원문을 확인하길 권한다.
