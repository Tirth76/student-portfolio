import React, { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'completed'
  const [apiLog, setApiLog] = useState(null);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pingLatency, setPingLatency] = useState(null);

  // Fetch tasks from backend API
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const startTime = performance.now();

    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const endTime = performance.now();
      setPingLatency(Math.round(endTime - startTime));

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch tasks`);
      }
      const json = await res.json();
      setTasks(json.data || []);
      setServerOnline(true);
      setApiLog({ status: res.status, action: "GET /tasks", latency: Math.round(endTime - startTime), data: json });
    } catch (err) {
      setServerOnline(false);
      setErrorMsg("Unable to connect to Node/Express server on http://localhost:5000. Please run 'npm start' inside task-manager-api.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), completed: false })
      });
      const json = await res.json();
      const endTime = performance.now();
      setApiLog({ status: res.status, action: "POST /tasks", latency: Math.round(endTime - startTime), data: json });

      if (res.ok) {
        setNewTitle("");
        fetchTasks();
      } else {
        alert(json.error || "Failed to create task");
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (task) => {
    const taskId = task._id || task.id;
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          completed: !task.completed,
          priority: task.priority || "medium"
        })
      });
      const json = await res.json();
      const endTime = performance.now();
      setApiLog({ status: res.status, action: `PUT /tasks/${taskId}`, latency: Math.round(endTime - startTime), data: json });

      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      alert(`Failed to update task: ${err.message}`);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      const endTime = performance.now();
      setApiLog({ status: res.status, action: `DELETE /tasks/${id}`, latency: Math.round(endTime - startTime), data: json });

      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  // Test endpoint utility for API testing buttons
  const testEndpoint = async (urlPath, description) => {
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}${urlPath}`);
      const json = await res.json();
      const endTime = performance.now();
      setApiLog({ status: res.status, action: `${description} (${urlPath})`, latency: Math.round(endTime - startTime), data: json });
    } catch (err) {
      setApiLog({ status: 500, action: `${description} (${urlPath})`, latency: 0, data: { error: err.message } });
    }
  };

  // Filter tasks based on selected filter pill
  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="page-shell section-spacer">
      {/* Header Section */}
      <div className="section-heading">
        <p className="eyebrow">Express REST API</p>
        <h1>Task Management System</h1>
        <p className="section-copy">
          Clean RESTful backend architecture with logging middleware, ID validation, 404 handler, and global error handling.
        </p>
      </div>

      {/* 1. Server Metrics & Status Banner */}
      <div className="tm-metrics-grid">
        <div className="tm-metric-card">
          <div className={`tm-metric-icon ${serverOnline ? "tm-icon-green" : "tm-icon-red"}`}>
            {serverOnline ? "⚡" : "⚠️"}
          </div>
          <div className="tm-metric-info">
            <span className="tm-metric-label">Backend Express Status</span>
            <span className="tm-metric-value" style={{ fontSize: "1.1rem" }}>
              {serverOnline ? `Online (${pingLatency !== null ? pingLatency + "ms" : "Active"})` : "Offline"}
            </span>
          </div>
        </div>

        <div className="tm-metric-card">
          <div className="tm-metric-icon tm-icon-blue">📋</div>
          <div className="tm-metric-info">
            <span className="tm-metric-label">Total Tasks</span>
            <span className="tm-metric-value">{tasks.length}</span>
          </div>
        </div>

        <div className="tm-metric-card">
          <div className="tm-metric-icon tm-icon-green">✅</div>
          <div className="tm-metric-info">
            <span className="tm-metric-label">Completed</span>
            <span className="tm-metric-value">{completedCount}</span>
          </div>
        </div>

        <div className="tm-metric-card">
          <div className="tm-metric-icon tm-icon-orange">⏳</div>
          <div className="tm-metric-info">
            <span className="tm-metric-label">Pending</span>
            <span className="tm-metric-value">{pendingCount}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: "14px 18px",
          backgroundColor: "rgba(245, 158, 11, 0.12)",
          color: "#b45309",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* 2. Task Management Card (CRUD Engine) */}
      <div className="tm-card">
        <div className="tm-card-header">
          <div className="tm-card-title">
            <span>📋</span> Task Operations
          </div>
          <div className="tm-filter-pills">
            <button
              className={`tm-pill-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({tasks.length})
            </button>
            <button
              className={`tm-pill-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`tm-pill-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleCreateTask} className="tm-add-form" style={{ marginBottom: "20px" }}>
          <input
            type="text"
            className="tm-input"
            placeholder="Enter new task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={!serverOnline}
          />
          <button
            type="submit"
            className="tm-btn-primary"
            disabled={!serverOnline || !newTitle.trim()}
          >
            <span>➕</span> Add Task
          </button>
        </form>

        {/* Task List */}
        {loading ? (
          <p style={{ color: "var(--text-muted)", padding: "12px 0" }}>Loading tasks from Express server...</p>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlignment: "center", padding: "24px 0", color: "var(--text-subtle)", textAlign: "center" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>📦</span>
            No {filter !== "all" ? filter : ""} tasks found. Add a task above!
          </div>
        ) : (
          <div className="tm-task-list">
            {filteredTasks.map((task) => {
              const taskId = task._id || task.id;
              const shortId = taskId ? taskId.toString().slice(-4) : "item";
              return (
                <div key={taskId} className="tm-task-item">
                  <div className="tm-task-left">
                    <input
                      type="checkbox"
                      className="tm-checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task)}
                    />
                    <span className={`tm-task-text ${task.completed ? "completed" : ""}`}>
                      {task.title}
                    </span>
                    <span className={`tm-badge ${task.completed ? "tm-badge-completed" : "tm-badge-pending"}`}>
                      {task.completed ? "✓ Done" : "⏳ Pending"} ({shortId})
                    </span>
                  </div>
                  <button
                    className="tm-btn-delete"
                    onClick={() => handleDeleteTask(taskId)}
                    title="Delete task"
                  >
                    🗑️ Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Middleware & Error Handler Testing Suite */}
      <div className="tm-card">
        <div className="tm-card-header">
          <div className="tm-card-title">
            <span>🧪</span> Middleware Pipeline & Error Handler Tests
          </div>
        </div>

        <div className="tm-test-grid" style={{ marginBottom: apiLog ? "20px" : "0" }}>
          <button
            className="tm-test-btn tm-test-amber"
            onClick={() => testEndpoint("/tasks/invalid-id-xyz", "Test ID Validator")}
            disabled={!serverOnline}
          >
            <div>
              <div style={{ fontWeight: 800 }}>ID Validation Guard</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.8, marginTop: "2px" }}>GET /tasks/invalid-id-xyz</div>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", background: "rgba(245,158,11,0.15)" }}>400 Bad Req</span>
          </button>

          <button
            className="tm-test-btn tm-test-purple"
            onClick={() => testEndpoint("/non-existent-route-path", "Test 404 Route Handler")}
            disabled={!serverOnline}
          >
            <div>
              <div style={{ fontWeight: 800 }}>404 Route Guard</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.8, marginTop: "2px" }}>GET /undefined-route-path</div>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", background: "rgba(139,92,246,0.15)" }}>404 Not Found</span>
          </button>

          <button
            className="tm-test-btn tm-test-red"
            onClick={() => testEndpoint("/error-test", "Test Global Error Handler")}
            disabled={!serverOnline}
          >
            <div>
              <div style={{ fontWeight: 800 }}>Global Error Handler</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.8, marginTop: "2px" }}>GET /error-test</div>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", background: "rgba(239,68,68,0.15)" }}>500 Server Err</span>
          </button>
        </div>

        {/* Live Response Code Block Inspector */}
        {apiLog && (
          <div className="tm-code-block">
            <div className="tm-code-header">
              <span>📡 API Response Inspector</span>
              <span className={`tm-status-pill tm-status-${apiLog.status}`}>
                HTTP {apiLog.status} ({apiLog.latency}ms)
              </span>
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(apiLog.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 4. Theory & Analysis Accordion */}
      <div className="theory-box">
        <button className="theory-toggle-btn" onClick={() => setTheoryOpen(!theoryOpen)}>
          <span>{theoryOpen ? "📖 Hide Theory & Analysis Answers" : "📖 View Theory & Analysis Answers"}</span>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </button>

        {theoryOpen && (
          <div className="theory-content">
            <div className="qa-item">
              <h4 className="qa-question">
                <span className="qa-num">Q1.</span> Why must the error handling middleware be defined last in the middleware chain?
              </h4>
              <p className="qa-answer">
                Express identifies error-handling middleware specifically by its 4-parameter signature <code>(err, req, res, next)</code>. When an error is passed via <code>next(err)</code>, Express bypasses all standard 3-parameter middleware until it reaches the next error handler. Defining it last ensures it catches errors thrown anywhere in preceding routes and middleware.
              </p>
            </div>
            <div className="qa-item">
              <h4 className="qa-question">
                <span className="qa-num">Q2.</span> What is the difference between app.use() and a route-specific middleware?
              </h4>
              <p className="qa-answer">
                <code>app.use()</code> mounts middleware globally (or on a path prefix) for all HTTP verbs matching that route pattern. A route-specific middleware is passed directly as an argument inside a specific endpoint definition (e.g. <code>app.put('/tasks/:id', validateTaskId, handler)</code>), executing only for that specific endpoint and method.
              </p>
            </div>
            <div className="qa-item">
              <h4 className="qa-question">
                <span className="qa-num">Q3.</span> Why is it considered bad practice to send raw error stack traces to the client?
              </h4>
              <p className="qa-answer">
                Exposing raw stack traces exposes internal server architecture, directory paths, dependency versions, and code structure, creating potential security vulnerabilities for malicious exploitation. It also damages user experience by displaying technical debug traces instead of user-friendly structured error messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManager;
