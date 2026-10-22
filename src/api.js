const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// GET all tasks
export const getTasks = async () => {
    const response = await fetch(`${BASE_URL}/tasks`);

    if (!response.ok) {
        throw new Error("Failed to fetch tasks");
    }

    const result = await response.json();

    return result.data;
};

// POST - Create task
export const createTask = async (task) => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Failed to create task");
    }

    return result.data;
};

// PUT - Update task
export const updateTask = async (id, task) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Failed to update task");
    }

    return result.data;
};

// DELETE - Delete task
export const deleteTask = async (id) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Failed to delete task");
    }

    return result;
};