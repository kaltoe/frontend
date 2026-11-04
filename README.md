# 칼퇴 frontend

실시간 회의 페이스메이커 **칼퇴**의 웹 클라이언트입니다.

> 프론트 스택(프레임워크, 패키지 매니저)이 정해지면 프로젝트를 초기화하고, 이 README와 CI(`.github/workflows/ci.yml`)를 채워 주세요.

## 백엔드 연동

- API 문서: 백엔드 실행 후 `http://localhost:8000/docs` ([kaltoe/backend](https://github.com/kaltoe/backend))
- 회의룸 실시간 연결: `ws://localhost:8000/ws/meetings/{meeting_id}`

## 지키는 것

- **main 에는 PR 로만.** 직접 push 는 막혀 있습니다 (브랜치 보호로 강제). 리뷰 승인은 필수가 아니며 작성자가 직접 병합합니다. CI를 추가하면 CI 통과를 필수로 등록합니다.
- **Squash merge 만 사용**하므로 PR 제목이 main 의 커밋 메시지가 됩니다. `feat: 회의 셋업 화면 추가` 형식을 지켜 주세요.
- **비밀값은 `.env` 에만.** 공개 저장소입니다.

브랜치·커밋 규칙 전체는 [CONTRIBUTING.md](https://github.com/kaltoe/.github/blob/main/CONTRIBUTING.md)에 있습니다.
