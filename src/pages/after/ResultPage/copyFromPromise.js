// 서버 응답으로 받을 글을 클립보드에 복사한다.
// Safari는 누른 뒤 응답을 기다렸다가 클립보드에 쓰면 막으므로,
// 누르자마자 쓰기를 시작하고 내용은 응답(Promise)으로 넘긴다.
export const copyFromPromise = async (textPromise) => {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      const item = new ClipboardItem({
        'text/plain': textPromise.then(
          (text) => new Blob([text], { type: 'text/plain' }),
        ),
      });
      await navigator.clipboard.write([item]);
      return;
    } catch {
      // 글을 받지 못했으면 다시 시도하지 않는다. 받았으면 아래에서 한 번 더 쓴다.
    }
  }
  await navigator.clipboard.writeText(await textPromise);
};
