import { useState, useEffect } from "react";
import { Boxes } from "./components/ui/background-boxes";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Trash2,
  Pencil,
  Plus,
  Search,
  ClipboardList,
  AlertCircle,
  X,
  Save,
} from "lucide-react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deletingIds, setDeletingIds] = useState([]);
  const [addingIds, setAddingIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [dateError, setDateError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("https://kaiii.pythonanywhere.com/api/tasks/")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  const validateDate = (date) => {
    if (!date) return true;
    return date >= today;
  };

  const addTask = () => {
    if (!title) return;
    if (!validateDate(dueDate)) {
      setDateError("Due date cannot be in the past.");
      return;
    }
    setDateError("");

    fetch("https://kaiii.pythonanywhere.com/api/tasks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        is_completed: false,
        due_date: dueDate || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAddingIds((prev) => [...prev, data.id]);
        setTasks((prev) => [...prev, data]);
        setTitle("");
        setDueDate("");
        setTimeout(() => {
          setAddingIds((prev) => prev.filter((id) => id !== data.id));
        }, 500);
      });
  };

  const deleteTask = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;
    setDeletingIds((prev) => [...prev, id]);
    setTimeout(() => {
      fetch(`https://kaiii.pythonanywhere.com/api/tasks/${id}/`, { method: "DELETE" }).then(() => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        setDeletingIds((prev) => prev.filter((d) => d !== id));
      });
    }, 600);
  };

  const markAsDone = (task) => {
    fetch(`https://kaiii.pythonanywhere.com/api/tasks/${task.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        is_completed: true,
        due_date: task.due_date || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
      });
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.due_date || "");
  };

  const saveEdit = (task) => {
    if (!editTitle) return;
    if (!validateDate(editDueDate)) {
      setDateError("Due date cannot be in the past.");
      return;
    }
    setDateError("");
    fetch(`https://kaiii.pythonanywhere.com/api/tasks/${task.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        is_completed: task.is_completed,
        due_date: editDueDate || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
        setEditingId(null);
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const created = new Date(dateStr);
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isOverdue = (due_date, is_completed) => {
    if (!due_date || is_completed) return false;
    return due_date < today;
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "pending") return !task.is_completed;
      if (filter === "completed") return task.is_completed;
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;

  return (
    <div className="page-wrapper">
      <Boxes />

      <div className="content-overlay" />

      <div className="content">
        <h1 className="title">Serious Task Manager</h1>

        {/* Task Counter */}
        <div className="task-counter">
          <div className="counter-text">
            <CheckCircle2 size={14} style={{ display: "inline", marginRight: 5 }} />
            {completedCount} / {totalCount} tasks completed
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        {/* Add Task */}
        <div className="add-task-row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Enter task title"
            className="task-input"
          />
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => { setDueDate(e.target.value); setDateError(""); }}
            className="task-input date-input"
          />
          <button onClick={addTask} className="btn btn-add">
            <Plus size={16} style={{ display: "inline", marginRight: 4 }} />
            Add
          </button>
        </div>
        {dateError && (
          <p className="date-error">
            <AlertCircle size={13} style={{ display: "inline", marginRight: 4 }} />
            {dateError}
          </p>
        )}

        {/* Search and Filter */}
        <div className="search-filter-row">
          <div className="search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="task-input search-input"
            />
          </div>
          <div className="filter-buttons">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-filter ${filter === f ? "active" : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <ClipboardList size={48} className="empty-icon" />
            <p className="empty-text">
              {searchQuery
                ? "No tasks match your search."
                : "No tasks yet. Add one above!"}
            </p>
          </div>
        )}

        {/* Task List */}
        <div className="task-list">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-card
                ${deletingIds.includes(task.id) ? "vaporizing" : ""}
                ${addingIds.includes(task.id) ? "slide-in" : ""}
                ${task.is_completed ? "task-card-done" : ""}
                ${isOverdue(task.due_date, task.is_completed) ? "task-card-overdue" : ""}
              `}
            >
              {editingId === task.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="task-input"
                  />
                  <input
                    type="date"
                    value={editDueDate}
                    min={today}
                    onChange={(e) => { setEditDueDate(e.target.value); setDateError(""); }}
                    className="task-input date-input"
                  />
                  {dateError && (
                    <p className="date-error">
                      <AlertCircle size={13} style={{ display: "inline", marginRight: 4 }} />
                      {dateError}
                    </p>
                  )}
                  <div className="edit-actions">
                    <button onClick={() => saveEdit(task)} className="btn btn-add">
                      <Save size={14} style={{ display: "inline", marginRight: 4 }} />
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-filter active">
                      <X size={14} style={{ display: "inline", marginRight: 4 }} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-info">
                    <p className={`task-title ${task.is_completed ? "task-done" : ""}`}>
                      {task.title}
                    </p>
                    <div className="task-meta">
                      {task.due_date && (
                        <span className={`due-date ${isOverdue(task.due_date, task.is_completed) ? "overdue" : ""}`}>
                          <Calendar size={12} style={{ display: "inline", marginRight: 3 }} />
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date, task.is_completed) && " — Overdue!"}
                        </span>
                      )}
                      <span className="timestamp">
                        <Clock size={12} style={{ display: "inline", marginRight: 3 }} />
                        {timeAgo(task.created_at)}
                      </span>
                      <span className={`task-status ${task.is_completed ? "status-done" : "status-pending"}`}>
                        {task.is_completed
                          ? <><CheckCircle2 size={12} style={{ display: "inline", marginRight: 3 }} />Done</>
                          : <><Clock size={12} style={{ display: "inline", marginRight: 3 }} />Pending</>
                        }
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => markAsDone(task)}
                      disabled={task.is_completed}
                      className="btn btn-done"
                    >
                      <CheckCircle2 size={14} style={{ display: "inline", marginRight: 4 }} />
                      Done
                    </button>
                    <button onClick={() => startEdit(task)} className="btn btn-edit">
                      <Pencil size={14} style={{ display: "inline", marginRight: 4 }} />
                      Edit
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="btn btn-delete">
                      <Trash2 size={14} style={{ display: "inline", marginRight: 4 }} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;