import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import TodoForm from "../components/TodoForm";

function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const navigate = useNavigate();

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
    } catch (err) {
      alert("Error fetching todos");
    }
  };

  // Add todo (triggered from TodoForm)
  const handleAdd = async (text) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/todos",
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, res.data]);
    } catch (err) {
      alert("Error adding todo");
    }
  };

  // Delete todo
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      alert("Error deleting todo");
    }
  };

  // Start editing todo
  const startEdit = (todo) => {
    setEditId(todo._id);
    setEditText(todo.text);
  };

  // Update todo
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/todos/${editId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map((t) => (t._id === editId ? res.data : t)));
      setEditId(null);
      setEditText("");
    } catch (err) {
      alert("Error updating todo");
    }
  };

  // Toggle done/undo
  const toggleDone = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.patch(
        `/todos/${id}/done`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      alert("Error toggling todo");
    }
  };

  // Download CSV
  const handleDownload = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/todos/download?date=${date}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `todos-${date}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Error downloading file");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      <h2>My Todos</h2>
      <button onClick={handleLogout}>Logout</button>

      {/* Todo Form */}
      <TodoForm onAdd={handleAdd} />

      {/* Todo List */}
      <ul>
        {todos.map((t) => (
          <li key={t._id}>
            {editId === t._id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  style={{
                    textDecoration: t.completed ? "line-through" : "none",
                  }}
                >
                  {t.text}
                </span>
                <button onClick={() => startEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
                <button onClick={() => toggleDone(t._id)}>
                  {t.completed ? "Undo" : "Done"}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Download Section */}
      <div>
        <h3>Download Day-wise Todos</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleDownload}>Download CSV</button>
      </div>
    </div>
  );
}

export default Dashboard;
