import { infoGray, joinGray, people } from '@/assets';
import { BackHeader } from '@/components/common/BackHeader/BackHeader';
import { BottomBar } from '@/components/common/BottomBar/BottomBar';
import styles from './JoinPage.module.scss';

// TODO: 회의 조회 API 연동 후 링크 코드(useParams의 code)로 받아온 값으로 교체
const meeting = { title: '회의 제목', participantCount: 3 };

export const JoinPage = () => {
  return (
    <div className={styles.page}>
      <BackHeader title="회의 입장하기" />

      <main className={styles.content}>
        <div className={styles.headline}>
          <div className={styles.headlineText}>
            <h1 className={styles.title}>{meeting.title}</h1>
            <p className={styles.description}>
              이름을 입력하고 회의에 참여해요.
            </p>
          </div>
          <div className={styles.participants}>
            <img src={people} alt="" />
            <span>{meeting.participantCount}명 참여</span>
          </div>
        </div>

        <div className={styles.form}></div>

        <div className={styles.note}>
          <img className={styles.noteIcon} src={infoGray} alt="" />
          <p>
            이름과 비밀번호는 이 회의에서만 사용돼요.
            <br />
            처음이라면 새 비밀번호를 정하고, 다시 들어온다면 같은 이름과
            비밀번호를 입력해주세요.
          </p>
        </div>
      </main>

      <BottomBar icon={joinGray} disabled>
        회의 입장하기
      </BottomBar>
    </div>
  );
};
