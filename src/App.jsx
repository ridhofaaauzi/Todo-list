import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./App.css";

const initialData = {
  todo: [],
  inProgress: [],
  done: [],
};

export default function App() {
  const [tasks, setTasks] = useState(initialData);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks({
        todo: Array.isArray(parsed.todo) ? parsed.todo : [],
        inProgress: Array.isArray(parsed.inProgress) ? parsed.inProgress : [],
        done: Array.isArray(parsed.done) ? parsed.done : [],
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const id = Date.now().toString();
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, { id, text: newTask }],
    }));
    setNewTask("");
  };

  const handleEditTask = (columnId, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: prev[columnId].map((task) =>
        task.id === taskId ? { ...task, text: editText } : task
      ),
    }));
    setEditingTask(null);
    setEditText("");
  };

  const handleDeleteTask = (columnId, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((task) => task.id !== taskId),
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = Array.from(tasks[source.droppableId]);
      const [moved] = column.splice(source.index, 1);
      column.splice(destination.index, 0, moved);

      setTasks((prev) => ({
        ...prev,
        [source.droppableId]: column,
      }));
    } else {
      const sourceColumn = Array.from(tasks[source.droppableId]);
      const destColumn = Array.from(tasks[destination.droppableId]);
      const [moved] = sourceColumn.splice(source.index, 1);
      destColumn.splice(destination.index, 0, moved);

      setTasks((prev) => ({
        ...prev,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-center mb-6">📋 To Do List</h1>

      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Tambah todo..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto">
          Tambah
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(tasks).map(([columnId, items]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps}
                  ref={innerRef}
                  className="bg-white rounded-lg p-4 shadow min-h-[300px] flex flex-col">
                  <h2 className="text-lg font-semibold mb-3">
                    {columnId === "todo"
                      ? "To Do"
                      : columnId === "inProgress"
                      ? "On Progress"
                      : "Done"}
                  </h2>
                  <div className="flex-1">
                    {items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={String(item.id)}
                        index={index}>
                        {({ innerRef, draggableProps, dragHandleProps }) => (
                          <div
                            ref={innerRef}
                            {...draggableProps}
                            {...dragHandleProps}
                            className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
                            {editingTask === item.id ? (
                              <div className="flex gap-2 w-full">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                  onClick={() =>
                                    handleEditTask(columnId, item.id)
                                  }
                                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition">
                                  💾
                                </button>
                                <button
                                  onClick={() => setEditingTask(null)}
                                  className="bg-gray-400 text-white p-2 rounded-full hover:bg-gray-500 transition">
                                  ❌
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 break-words">
                                  {item.text}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingTask(item.id);
                                      setEditText(item.text);
                                    }}
                                    className="bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-500 transition">
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteTask(columnId, item.id)
                                    }
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                                    <FaTrash />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
