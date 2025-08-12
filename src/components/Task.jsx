import { Draggable } from "react-beautiful-dnd";

export default function Task({
  task,
  index,
  columnId,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="task"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}>
          <textarea
            value={task.content}
            onChange={(e) => onEditTask(columnId, task.id, e.target.value)}
            placeholder="Write something..."
          />
          <button onClick={() => onDeleteTask(columnId, task.id)}>❌</button>
        </div>
      )}
    </Draggable>
  );
}
