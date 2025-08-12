import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import "./App.css";

const columnsData = {
  todo: { name: "To Do", items: [] },
  inProgress: { name: "On Progress", items: [] },
  done: { name: "Done", items: [] },
};

export default function App() {
  const [columns, setColumns] = useState(columnsData);
  const [task, setTask] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const storedColumns = localStorage.getItem("kanbanData");
    const storedTheme = localStorage.getItem("themeMode");
    if (storedColumns) setColumns(JSON.parse(storedColumns));
    if (storedTheme) setDarkMode(storedTheme === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("kanbanData", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("themeMode", darkMode ? "dark" : "light");
  }, [darkMode]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems },
      });
    }
  };

  const addTask = () => {
    if (!task.trim()) return;
    const newTask = { id: Date.now().toString(), content: task };
    setColumns({
      ...columns,
      todo: { ...columns.todo, items: [...columns.todo.items, newTask] },
    });
    setTask("");
  };

  const deleteTask = (columnId, taskId) => {
    const updatedItems = columns[columnId].items.filter(
      (item) => item.id !== taskId
    );
    setColumns({
      ...columns,
      [columnId]: { ...columns[columnId], items: updatedItems },
    });
  };

  const startEditTask = (columnId, taskId, currentContent) => {
    setEditingTask({ columnId, taskId });
    setEditContent(currentContent);
  };

  const cancelEditTask = () => {
    setEditingTask(null);
    setEditContent("");
  };

  const saveEditTask = () => {
    if (!editContent.trim()) return alert("Task content cannot be empty");
    const { columnId, taskId } = editingTask;
    const updatedItems = columns[columnId].items.map((item) =>
      item.id === taskId ? { ...item, content: editContent } : item
    );
    setColumns({
      ...columns,
      [columnId]: { ...columns[columnId], items: updatedItems },
    });
    cancelEditTask();
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}>
        <header className="flex flex-col md:flex-row justify-between items-center p-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">📋 Todo Board</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new task..."
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Add
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-6 p-6">
            {Object.entries(columns).map(([id, column]) => (
              <div
                key={id}
                className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                  {column.name}
                </h2>
                <Droppable droppableId={id}>
                  {(provided) => (
                    <div
                      className="min-h-[300px] bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}>
                          {(provided) => (
                            <div
                              className="bg-blue-500 p-3 rounded shadow mb-3 cursor-grab active:cursor-grabbing flex justify-between items-center text-white"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                              {editingTask &&
                              editingTask.taskId === item.id &&
                              editingTask.columnId === id ? (
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    className="flex-grow px-2 py-1 rounded text-black"
                                    type="text"
                                    value={editContent}
                                    onChange={(e) =>
                                      setEditContent(e.target.value)
                                    }
                                  />
                                  <button
                                    onClick={saveEditTask}
                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                                    title="Save">
                                    <FaSave />
                                  </button>
                                  <button
                                    onClick={cancelEditTask}
                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                                    title="Cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span>{item.content}</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        startEditTask(id, item.id, item.content)
                                      }
                                      className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded"
                                      title="Edit">
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => deleteTask(id, item.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                                      title="Delete">
                                      <FaTrash />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
