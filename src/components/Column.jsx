import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";

export default function Column({
  title,
  tasks,
  columnId,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <div className="column">
      <h2>{title}</h2>
      <button onClick={() => onAddTask(columnId)}>+ Add Task</button>
      <Droppable droppableId={columnId}>
        {(provided) => (
          <div
            className="task-list"
            {...provided.droppableProps}
            ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                columnId={columnId}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
