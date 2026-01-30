import { useEffect, useMemo, useState } from "react";
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
  const [filter, setFilter] = useState("all");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // ✅ Always get safe board name
  const getBoardName = (b) => {
    const nm = (b?.name || "").trim();
    if (!nm) return "Untitled Board";
    return nm;
  };

  const fetchBoards = async () => {
    try {
      setErr("");
      setLoadingBoards(true);

      const res = await api.get("/boards");
      const data = Array.isArray(res.data.boards) ? res.data.boards : [];

      setBoards(data);

      // auto select first board if none selected
      if (data.length > 0) {
        setSelectedBoard((prev) => prev || data[0]);
      } else {
        setSelectedBoard(null);
        setTodos([]);
      }
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to load boards");
      setBoards([]);
      setSelectedBoard(null);
      setTodos([]);
    } finally {
      setLoadingBoards(false);
    }
  };

  const fetchTodos = async (boardId) => {
    try {
      setErr("");
      setLoadingTodos(true);
      const res = await api.get(`/boards/${boardId}/todos`);
      const data = Array.isArray(res.data) ? res.data : [];
      setTodos(data);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to load todos");
      setTodos([]);
    } finally {
      setLoadingTodos(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard?._id) {
      fetchTodos(selectedBoard._id);
    }
  }, [selectedBoard?._id]); // ✅ only depend on id

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  // ---------------- EDIT TODO ----------------
  const openEditModal = (todo) => {
    setEditTodoId(todo._id);
    setEditTitle(todo.title || "");
    setEditDesc(todo.description || "");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditTodoId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setErr("");

    if (!editTodoId) return;

    if (!editTitle.trim()) {
      setErr("Todo title cannot be empty");
      return;
    }

    try {
      const res = await api.put(`/todos/${editTodoId}`, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });

      setTodos((prev) =>
        prev.map((t) => (t._id === editTodoId ? res.data : t)),
      );
      closeEditModal();
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to update todo");
    }
  };

  // ---------------- FILTER TODOS ----------------
  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (filter === "pending") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    });
  }, [todos, filter]);

  // ---------------- BOARDS ----------------
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setErr("");

    const name = boardName.trim();
    if (!name) return;

    try {
      const res = await api.post("/boards", { name });

      // ✅ functional state update avoids stale boards issue
      setBoards((prev) => [res.data.board, ...prev]); // Access the .board property
      setSelectedBoard(res.data.board);

      setBoardName("");
      setTodos([]); // optional: clear until fetchTodos runs
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to create board");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const ok = confirm("Delete this board?");
    if (!ok) return;

    try {
      await api.delete(`/boards/${boardId}`);

      setBoards((prev) => prev.filter((b) => b._id !== boardId));

      // if deleting current selected board
      if (selectedBoard?._id === boardId) {
        // select next available
        const remaining = boards.filter((b) => b._id !== boardId);
        setSelectedBoard(remaining.length > 0 ? remaining[0] : null);
        setTodos([]);
      }
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to delete board");
    }
  };

  // ---------------- TODOS ----------------
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    setErr("");

    if (!selectedBoard?._id) return;

    const title = todoTitle.trim();
    const description = todoDesc.trim();

    if (!title) return;

    try {
      const res = await api.post(`/boards/${selectedBoard._id}/todos`, {
        title,
        description,
      });

      setTodos((prev) => [res.data, ...prev]);

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

      setTodos((prev) => prev.map((t) => (t._id === todo._id ? res.data : t)));
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to update todo");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos((prev) => prev.filter((t) => t._id !== todoId));
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
                  className={`flex justify-between items-center px-3 py-2 min-h-[42px] rounded-lg border cursor-pointer ${
                    selectedBoard?._id === b._id
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {getBoardName(b)}
                  </span>

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
                  <h2 className="text-xl font-bold">
                    {getBoardName(selectedBoard)}
                  </h2>
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
                <button
                  disabled={!selectedBoard?._id} // Disable if no board is selected
                  className={`bg-black text-white rounded-lg font-semibold hover:opacity-90 ${!selectedBoard?._id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Add Todo
                </button>
              </form>

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    filter === "all" ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setFilter("pending")}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    filter === "pending" ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  Pending
                </button>

                <button
                  onClick={() => setFilter("completed")}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    filter === "completed" ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Todo List */}
              {loadingTodos ? (
                <p className="text-sm text-gray-500">Loading todos...</p>
              ) : todos.length === 0 ? (
                <p className="text-sm text-gray-500">No todos yet</p>
              ) : (
                <div className="space-y-2">
                  {filteredTodos.map((t) => (
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

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="text-xs px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteTodo(t._id)}
                          className="text-xs px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EDIT MODAL */}
              {isEditOpen && (
                <div
                  className="fixed inset-0 bg-black/40 flex items-center justify-center px-4"
                  onClick={closeEditModal}
                >
                  <div
                    className="w-full max-w-md bg-white rounded-xl shadow-lg p-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold">Edit Todo</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Update title and description
                    </p>

                    <form onSubmit={handleEditSave} className="mt-4 space-y-3">
                      <input
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Todo title"
                      />

                      <textarea
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black min-h-[90px]"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                      />

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={closeEditModal}
                          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-semibold"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:opacity-90"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
