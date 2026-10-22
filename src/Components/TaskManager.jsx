import { useEffect, useState } from "react";

import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from "../api";

import "./TaskManager.css";

function TaskManager() {

    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // --------------------------------
    // GET TASKS
    // --------------------------------

    const loadTasks = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getTasks();

            setTasks(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    // --------------------------------
    // CREATE TASK
    // --------------------------------

    const handleCreate = async (e) => {

        e.preventDefault();

        if (!title.trim()) {
            setError("Please enter a task title.");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const newTask = await createTask({
                title,
                description,
                priority
            });

            setTasks((previousTasks) => [
                newTask,
                ...previousTasks
            ]);

            setTitle("");
            setDescription("");
            setPriority("medium");

            setMessage("Task created successfully!");

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    // --------------------------------
    // UPDATE TASK
    // --------------------------------

    const handleToggle = async (task) => {

        try {

            setError("");
            setMessage("");

            const updatedTask = await updateTask(
                task._id,
                {
                    title: task.title,
                    description: task.description,
                    completed: !task.completed,
                    priority: task.priority
                }
            );

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item._id === task._id
                        ? updatedTask
                        : item
                )
            );

            setMessage(
                updatedTask.completed
                    ? "Task marked as completed!"
                    : "Task marked as pending!"
            );

        } catch (err) {

            setError(err.message);

        }
    };

    // --------------------------------
    // DELETE TASK
    // --------------------------------

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setLoading(true);
            setError("");
            setMessage("");

            await deleteTask(id);

            setTasks((previousTasks) =>
                previousTasks.filter(
                    (task) => task._id !== id
                )
            );

            setMessage("Task deleted successfully!");

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    // --------------------------------
    // STATISTICS
    // --------------------------------

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.completed
    ).length;

    const pendingTasks = totalTasks - completedTasks;

    // --------------------------------
    // COMPONENT
    // --------------------------------

    return (

        <div className="task-page">

            {/* HEADER */}

            <header className="task-header">

                <div>

                    <div className="brand">
                        TASKFLOW
                    </div>

                    <h1>
                        Task Manager
                    </h1>

                    <p>
                        Organize your work. Track your progress.
                    </p>

                </div>

                <div className="header-icon">
                    ✓
                </div>

            </header>


            <main className="task-container">

                {/* STATISTICS */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon total">
                            📋
                        </div>

                        <div>
                            <span>Total Tasks</span>
                            <strong>{totalTasks}</strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon pending">
                            ⏳
                        </div>

                        <div>
                            <span>Pending</span>
                            <strong>{pendingTasks}</strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon completed">
                            ✓
                        </div>

                        <div>
                            <span>Completed</span>
                            <strong>{completedTasks}</strong>
                        </div>

                    </div>

                </section>


                {/* CREATE TASK */}

                <section className="create-card">

                    <div className="section-title">

                        <div className="title-icon">
                            +
                        </div>

                        <div>
                            <h2>Create New Task</h2>
                            <p>
                                Add a new task to your list
                            </p>
                        </div>

                    </div>


                    <form
                        onSubmit={handleCreate}
                        className="task-form"
                    >

                        <div className="form-group">

                            <label>
                                Task Title
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Complete Practical 6"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Describe what needs to be done..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                            />

                        </div>


                        <div className="form-bottom">

                            <div className="form-group priority-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    value={priority}
                                    onChange={(e) =>
                                        setPriority(e.target.value)
                                    }
                                >

                                    <option value="low">
                                        Low
                                    </option>

                                    <option value="medium">
                                        Medium
                                    </option>

                                    <option value="high">
                                        High
                                    </option>

                                </select>

                            </div>


                            <button
                                type="submit"
                                className="add-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Adding..."
                                    : "+ Add Task"}

                            </button>

                        </div>

                    </form>

                </section>


                {/* MESSAGES */}

                {message && (

                    <div className="notification success">
                        ✓ {message}
                    </div>

                )}


                {error && (

                    <div className="notification error">
                        ⚠ {error}
                    </div>

                )}


                {/* TASK HEADER */}

                <div className="tasks-heading">

                    <div>

                        <h2>
                            My Tasks
                        </h2>

                        <p>
                            {totalTasks === 0
                                ? "No tasks yet"
                                : `${totalTasks} task${totalTasks !== 1 ? "s" : ""} in your list`
                            }
                        </p>

                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadTasks}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* TASK LIST */}

                {loading && tasks.length === 0 && (

                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading your tasks...</p>
                    </div>

                )}


                {!loading && tasks.length === 0 && (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h3>
                            No tasks yet
                        </h3>

                        <p>
                            Create your first task above
                            to get started.
                        </p>

                    </div>

                )}


                <div className="task-grid">

                    {tasks.map((task) => (

                        <article
                            key={task._id}
                            className={`task-card ${
                                task.completed
                                    ? "completed-card"
                                    : ""
                            }`}
                        >

                            <div className="task-card-top">

                                <button
                                    className={`check-button ${
                                        task.completed
                                            ? "checked"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(task)
                                    }
                                >

                                    {task.completed
                                        ? "✓"
                                        : ""}

                                </button>


                                <span
                                    className={`priority-badge ${task.priority}`}
                                >
                                    {task.priority}
                                </span>

                            </div>


                            <h3
                                className={
                                    task.completed
                                        ? "completed-title"
                                        : ""
                                }
                            >
                                {task.title}
                            </h3>


                            <p className="task-description">

                                {task.description ||
                                    "No description provided."}

                            </p>


                            <div className="task-card-footer">

                                <span
                                    className={`status ${
                                        task.completed
                                            ? "status-completed"
                                            : "status-pending"
                                    }`}
                                >

                                    {task.completed
                                        ? "● Completed"
                                        : "● Pending"}

                                </span>


                                <div className="actions">

                                    <button
                                        className="complete-button"
                                        onClick={() =>
                                            handleToggle(task)
                                        }
                                    >

                                        {task.completed
                                            ? "Undo"
                                            : "Complete"}

                                    </button>


                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            handleDelete(task._id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))}

                </div>

            </main>

        </div>
    );
}

export default TaskManager;