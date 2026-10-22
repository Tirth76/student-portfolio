const taskEvents = require('./events');

taskEvents.on('task-created', (task) => {
    // Simulate slow notification handler (2000ms delay) to demonstrate non-blocking asynchronous behavior
    setTimeout(() => {
        try {
            if (task.simulateError) {
                throw new Error(`Simulated notification service failure for task "${task.title}"`);
            }
            const assignedUser = task.assignedTo || 'student@example.com';
            console.log(`[Notification] Task "${task.title}" created at ${new Date().toISOString()}. Assigned to: ${assignedUser}`);
        } catch (error) {
            taskEvents.emit('error', error);
        }
    }, 2000);
});

// Supplementary Problem 1: Add a second event, task-deleted
taskEvents.on('task-deleted', (task) => {
    const taskName = task.title || task._id || 'Task';
    console.log(`[Notification] Task "${taskName}" deleted at ${new Date().toISOString()}`);
});

// Supplementary Problem 2: Add an error event listener that catches and logs any error thrown
taskEvents.on('error', (error) => {
    console.error(`[Event Error] An error occurred in an event handler:`, error.message || error);
});
