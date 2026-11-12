import { useRef, useState } from 'react';

// 손잡이를 누른 채로 위아래로 움직이면 목록 순서를 바꾼다.
// 모바일 터치에서도 동작하도록 HTML5 드래그 대신 포인터 이벤트를 사용한다.
export const useDragSort = (items, onReorder) => {
  const [draggingId, setDraggingId] = useState(null);
  const itemNodes = useRef(new Map());

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

  const endDrag = () => setDraggingId(null);

  const getHandleProps = (id) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingId(id);
    },
    onPointerMove: (event) => {
      if (draggingId === id) moveTo(id, event.clientY);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  });

  return { draggingId, registerItem, getHandleProps };
};
