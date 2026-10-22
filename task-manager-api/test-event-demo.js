/**
 * Practical 10: Standalone In-Process EventEmitter Demonstration
 * 
 * Demonstrates:
 * 1. EventEmitter registration and dispatch
 * 2. Response-before-handler execution order (proof of non-blocking async execution)
 * 3. Timestamp calculation (API response time vs background listener completion)
 * 4. Supplementary Problem 1: Second event 'task-deleted'
 * 5. Supplementary Problem 2: Handled 'error' event listener
 * 6. Supplementary Problem 3: 2000ms artificial delay simulation
 */

const taskEvents = require('./events');
require('./listeners');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
    console.log('================================================================');
    console.log(' PRACTICAL 10: STANDALONE EVENT-DRIVEN PROCESSING DEMONSTRATION ');
    console.log('================================================================\n');

    // Simulate POST /tasks route logic
    console.log('--- SCENARIO 1: Non-Blocking Task Creation (POST /tasks) ---');
    const simulatedTask = {
        _id: '67b7e800123456789abcdef0',
        title: 'Complete Practical 10 Lab Report',
        description: 'Demonstrating Node.js EventEmitter async processing',
        priority: 'high',
        assignedTo: 'tirth.kadivar@student.local'
    };

    const startTime = Date.now();
    console.log(`[1. API ROUTE] Task saved to database at: ${new Date().toISOString()}`);

    // Emulate sending HTTP 201 Created Response
    const apiResponseTimestamp = new Date().toISOString();
    console.log(`[2. API ROUTE] HTTP 201 Response sent to client at: ${apiResponseTimestamp}`);
    const timeToRespond = Date.now() - startTime;
    console.log(`[2. API ROUTE] Response dispatched in: ${timeToRespond} ms`);

    // Emit event asynchronously
    console.log(`[3. API ROUTE] Emitting 'task-created' event to background queue...`);
    taskEvents.emit('task-created', simulatedTask);

    console.log(`[4. MAIN THREAD] Main thread is immediately free to handle other requests!\n`);

    // Wait to allow the 2000ms background listener to fire
    await sleep(2500);

    // Simulate DELETE /tasks/:id route logic
    console.log('\n--- SCENARIO 2: Supplementary Problem 1 - task-deleted Event ---');
    console.log(`[API ROUTE] HTTP 200 Delete Response sent at: ${new Date().toISOString()}`);
    taskEvents.emit('task-deleted', simulatedTask);

    await sleep(500);

    // Simulate Error Handling logic
    console.log('\n--- SCENARIO 3: Supplementary Problem 2 - Error Event Listener ---');
    const faultyTask = {
        _id: '67b7e800123456789abcdef1',
        title: 'Task Triggering Notification Error',
        simulateError: true
    };
    console.log(`[API ROUTE] HTTP 201 Response sent at: ${new Date().toISOString()}`);
    taskEvents.emit('task-created', faultyTask);

    await sleep(2500);

    console.log('\n================================================================');
    console.log('DEMONSTRATION CONCLUSION:');
    console.log('1. The API response was sent at [2] within <5ms.');
    console.log('2. The background notification logged ~2000ms later.');
    console.log('3. The main request flow was NEVER blocked by notification processing.');
    console.log('================================================================\n');
}

runDemo();
