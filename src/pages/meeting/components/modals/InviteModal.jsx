import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  meetingIconCopy,
  meetingIconCopyCheck,
  meetingIconCopySmall,
  meetingIconLink,
  meetingIconTime,
} from '@/assets';
import { Toast } from '@/pages/meeting/components/common/Toast';
import styles from './InviteModal.module.scss';

const COPY_TOASTS = {
  success: {
    variant: 'success',
    icon: meetingIconCopyCheck,
    iconSize: 22,
    message: '복사되었습니다!',
  },
  fail: {
    variant: 'danger',
    message: '복사하지 못했어요. 직접 선택해서 복사해주세요.',
  },
};

const toDisplayUrl = (url) => url.replace(/^https?:\/\//, '');

// 진행자: 회의 라이브 처음 들어올 때 자동으로 뜨고, 상단 초대 버튼으로도 열림
// 복구 키는 진행자이고 키가 있을 때만 보임
export const InviteModal = ({ open, invite, recoveryKey, onClose }) => {
  const [copyToast, setCopyToast] = useState(null);
  const closeCopyToast = useCallback(() => setCopyToast(null), []);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !invite) return null;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast({ type: 'success', id: Date.now() });
    } catch {
      setCopyToast({ type: 'fail', id: Date.now() });
    }
  };

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose}>
        <section
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.content}>
            <div className={styles.invite}>
              <div className={styles.inviteMain}>
                <div className={styles.inviteInfo}>
                  <div className={styles.texts}>
                    <h2 id="invite-modal-title" className={styles.title}>
                      팀원을 초대해요.
                    </h2>
                    <p className={styles.description}>
                      코드나 링크를 공유하면 바로 들어올 수 있어요.
                    </p>
                  </div>

                  <div className={styles.codeBox}>
                    <p className={styles.codeLabel}>회의 코드</p>
                    <div className={styles.codeGroup}>
                      <p className={styles.code}>{invite.code}</p>
                      <p className={styles.url}>{toDisplayUrl(invite.url)}</p>
                    </div>
                  </div>
                </div>

                <p className={styles.expiry}>
                  <img src={meetingIconTime} alt="" width={14} height={14} />
                  코드와 링크는 2주 후 만료돼요.
                </p>
              </div>

              <div className={styles.copyButtons}>
                <button
                  type="button"
                  className={`${styles.copyButton} ${styles.codeCopy}`}
                  onClick={() => copy(invite.code)}
                >
                  <img src={meetingIconCopy} alt="" width={20} height={20} />
                  코드 복사
                </button>
                <button
                  type="button"
                  className={`${styles.copyButton} ${styles.linkCopy}`}
                  onClick={() => copy(invite.url)}
                >
                  <img src={meetingIconLink} alt="" width={20} height={20} />
                  링크 복사
                </button>
              </div>
            </div>

            {recoveryKey && (
              <>
                <hr className={styles.divider} />
                <div className={styles.recovery}>
                  <div className={styles.recoveryField}>
                    <p className={styles.recoveryLabel}>진행자 복구 키</p>
                    <div className={styles.keyBox}>
                      <p className={styles.key}>{recoveryKey}</p>
                      <button
                        type="button"
                        className={styles.keyCopy}
                        onClick={() => copy(recoveryKey)}
                        aria-label="진행자 복구 키 복사"
                      >
                        <img
                          src={meetingIconCopySmall}
                          alt=""
                          width={16}
                          height={16}
                        />
                        복사
                      </button>
                    </div>
                  </div>
                  <p className={styles.recoveryHint}>
                    회의에 다시 진행자로 들어오려면 이 키가 필요해요.
                  </p>
                </div>
              </>
            )}
          </div>

          <button type="button" className={styles.close} onClick={onClose}>
            닫기
          </button>
        </section>
      </div>

      {/* 오버레이 밖에 그려서 토스트를 눌러도 모달이 닫히지 않음 */}
      {copyToast && (
        <Toast
          key={copyToast.id}
          className={`${styles.toast} ${styles[copyToast.type]}`}
          {...COPY_TOASTS[copyToast.type]}
          onClose={closeCopyToast}
        />
      )}
    </>,
    document.body,
  );
};
