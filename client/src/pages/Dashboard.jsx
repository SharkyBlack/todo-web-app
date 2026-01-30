import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const userEmail = localStorage.getItem("userEmail");

  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);

  const [boardName, setBoardName] = useState("");

  const [todos, setTodos] = useState([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDesc, setTodoDesc] = useState("");

  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingTodos, setLoadingTodos] = useState(false);

  const [err, setErr] = useState("");

  const fetchBoards = async () => {
  try {
    setLoadingBoards(true);
    const res = await api.get("/boards");

    const data = Array.isArray(res.data) ? res.data : [];
    setBoards(data);

    if (data.length > 0 && !selectedBoard) {
      setSelectedBoard(data[0]);
    }
  } catch (error) {
    setErr(error?.response?.data?.message || "Failed to load boards");
    setBoards([]); // ✅ important
  } finally {
    setLoadingBoards(false);
  }
};


  const fetchTodos = async (boardId) => {
    try {
      setLoadingTodos(true);
      const res = await api.get(`/boards/${boardId}/todos`);
      setTodos(res.data);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to load todos");
    } finally {
      setLoadingTodos(false);
    }
  };

  useEffect(() => {
    fetchBoards();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedBoard?._id) {
      fetchTodos(selectedBoard._id);
    }
  }, [selectedBoard]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setErr("");

    if (!boardName.trim()) return;

    try {
      const res = await api.post("/boards", { name: boardName.trim() });
      setBoards([res.data, ...boards]);
      setBoardName("");
      setSelectedBoard(res.data);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to create board");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const ok = confirm("Delete this board?");
    if (!ok) return;

    try {
      await api.delete(`/boards/${boardId}`);
      const updated = boards.filter((b) => b._id !== boardId);
      setBoards(updated);

      if (selectedBoard?._id === boardId) {
        setSelectedBoard(updated.length > 0 ? updated[0] : null);
        setTodos([]);
      }
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to delete board");
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    setErr("");

    if (!selectedBoard?._id) return;
    if (!todoTitle.trim()) return;

    try {
      const res = await api.post(`/boards/${selectedBoard._id}/todos`, {
        title: todoTitle.trim(),
        description: todoDesc.trim(),
      });

      setTodos([res.data, ...todos]);
      setTodoTitle("");
      setTodoDesc("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to create todo");
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const res = await api.put(`/todos/${todo._id}`, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t._id === todo._id ? res.data : t)));
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to update todo");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos(todos.filter((t) => t._id !== todoId));
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to delete todo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">ToDo Boards</h1>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Logout
        </button>
      </div>

      {err && (
        <div className="mx-6 mt-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          {err}
        </div>
      )}

      {/* Layout */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Boards */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:col-span-1 h-[75vh] overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Boards</h2>
            <span className="text-xs text-gray-500">{boards.length} total</span>
          </div>

          <form onSubmit={handleCreateBoard} className="space-y-2 mb-4">
            <input
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              placeholder="New board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
            />
            <button className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:opacity-90">
              Add Board
            </button>
          </form>

          {loadingBoards ? (
            <p className="text-sm text-gray-500">Loading boards...</p>
          ) : boards.length === 0 ? (
            <p className="text-sm text-gray-500">No boards yet</p>
          ) : (
            <div className="space-y-2">
              {boards.map((b) => (
                <div
                  key={b._id}
                  onClick={() => setSelectedBoard(b)}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg border cursor-pointer ${
                    selectedBoard?._id === b._id
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-medium">{b.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(b._id);
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todos */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:col-span-3 h-[75vh] overflow-auto">
          {!selectedBoard ? (
            <div className="text-gray-500">
              Create a board to start adding todos.
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedBoard.name}</h2>
                  <p className="text-xs text-gray-500">
                    Manage todos for this board
                  </p>
                </div>
              </div>

              {/* Create Todo */}
              <form
                onSubmit={handleCreateTodo}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
              >
                <input
                  className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  placeholder="Todo title"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                />
                <input
                  className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                  placeholder="Description (optional)"
                  value={todoDesc}
                  onChange={(e) => setTodoDesc(e.target.value)}
                />
                <button className="bg-black text-white rounded-lg font-semibold hover:opacity-90">
                  Add Todo
                </button>
              </form>

              {/* Todo List */}
              {loadingTodos ? (
                <p className="text-sm text-gray-500">Loading todos...</p>
              ) : todos.length === 0 ? (
                <p className="text-sm text-gray-500">No todos yet</p>
              ) : (
                <div className="space-y-2">
                  {todos.map((t) => (
                    <div
                      key={t._id}
                      className="flex justify-between items-start border rounded-xl p-3 hover:bg-gray-50"
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => handleToggleTodo(t)}
                          className="mt-1"
                        />

                        <div>
                          <div
                            className={`font-semibold ${
                              t.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {t.title}
                          </div>
                          {t.description && (
                            <div className="text-sm text-gray-500">
                              {t.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTodo(t._id)}
                        className="text-xs px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
