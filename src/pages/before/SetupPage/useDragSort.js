import { useRef, useState } from 'react';

const DRAG_START_DISTANCE = 4;

// 카드를 누른 채로 위아래로 움직이면 목록 순서를 바꾼다.
// 마우스는 카드 어디든(입력칸·버튼 제외) 잡을 수 있고,
// 터치는 화면 스크롤과 겹치지 않도록 손잡이(data-drag-handle)를 잡았을 때만 끈다.
export const useDragSort = (items, onReorder) => {
  const [draggingId, setDraggingId] = useState(null);
  const itemNodes = useRef(new Map());
  const drag = useRef(null);

  const registerItem = (id) => (node) => {
    if (node) itemNodes.current.set(id, node);
    else itemNodes.current.delete(id);
  };

  const moveTo = (id, pointerY) => {
    const dragged = items.find((item) => item.id === id);
    const others = items.filter((item) => item.id !== id);
    const targetIndex = others.filter((item) => {
      const rect = itemNodes.current.get(item.id)?.getBoundingClientRect();
      return rect && rect.top + rect.height / 2 < pointerY;
    }).length;

    if (targetIndex === items.indexOf(dragged)) return;
    onReorder([
      ...others.slice(0, targetIndex),
      dragged,
      ...others.slice(targetIndex),
    ]);
  };

  const endDrag = () => {
    drag.current = null;
    setDraggingId(null);
  };

  const getDragProps = (id) => ({
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      const onHandle = event.target.closest('[data-drag-handle]');
      if (!onHandle && event.target.closest('input, button')) return;
      if (!onHandle && event.pointerType === 'touch') return;

      if (onHandle) event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id, startY: event.clientY, isMoving: false };
    },
    onPointerMove: (event) => {
      if (drag.current?.id !== id) return;
      if (!drag.current.isMoving) {
        if (Math.abs(event.clientY - drag.current.startY) < DRAG_START_DISTANCE)
          return;
        drag.current.isMoving = true;
        setDraggingId(id);
      }
      moveTo(id, event.clientY);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  });

  return { draggingId, registerItem, getDragProps };
};
