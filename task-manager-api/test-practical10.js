/**
 * Practical 10 Verification & Demonstration Script
 * Asynchronous Background Processing with Node.js EventEmitter
 * 
 * Tests:
 * 1. Event-driven non-blocking execution (POST /tasks)
 * 2. Timing proof: API response is returned BEFORE the notification listener completes
 * 3. Supplementary Problem 1: Second event 'task-deleted' (DELETE /tasks/:id)
 * 4. Supplementary Problem 2: Error event listener catching handler exceptions
 * 5. Supplementary Problem 3: Simulation of slow notification handler (2000ms delay)
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPractical10Tests() {
    console.log('================================================================');
    console.log('   PRACTICAL 10: ASYNCHRONOUS BACKGROUND PROCESSING WITH EVENTS  ');
    console.log('================================================================\n');

    try {
        // Test 1: Non-blocking Task Creation with Async Notification
        console.log('----------------------------------------------------------------');
        console.log('TEST 1: POST /tasks - Non-Blocking Execution & Timestamp Evidence');
        console.log('----------------------------------------------------------------');

        const requestStartTime = new Date();
        console.log(`[CLIENT] Dispatching POST /tasks request at: ${requestStartTime.toISOString()}`);

        const postResponse = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Practical 10: Event-Driven Processing',
                description: 'Decoupled async notification with Node.js EventEmitter',
                priority: 'high',
                assignedTo: 'tirth.kadivar@student.local'
            })
        });

        const responseEndTime = new Date();
        const responseData = await postResponse.json();

        console.log(`[CLIENT] Response received at: ${responseEndTime.toISOString()}`);
        console.log(`[CLIENT] Response Status: ${postResponse.status}`);
        console.log(`[CLIENT] Response Latency: ${responseEndTime - requestStartTime} ms`);
        console.log(`[CLIENT] Response Body:`, JSON.stringify(responseData, null, 2));

        const createdTaskId = responseData.data?._id;

        console.log('\n[INFO] Notice that the API response returned INSTANTLY.');
        console.log('[INFO] The server has dispatched the background notification listener with a 2-second delay.');
        console.log('[INFO] Waiting 2.5 seconds to observe background execution in server logs...\n');

        await sleep(2500);

        // Test 2: Supplementary Problem 1 - task-deleted Event
        console.log('----------------------------------------------------------------');
        console.log('TEST 2: DELETE /tasks/:id - Supplementary Event: task-deleted');
        console.log('----------------------------------------------------------------');

        if (createdTaskId) {
            const deleteStartTime = new Date();
            console.log(`[CLIENT] Dispatching DELETE /tasks/${createdTaskId} at: ${deleteStartTime.toISOString()}`);

            const deleteResponse = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const deleteEndTime = new Date();
            const deleteData = await deleteResponse.json();

            console.log(`[CLIENT] Delete response received at: ${deleteEndTime.toISOString()}`);
            console.log(`[CLIENT] Delete Status: ${deleteResponse.status}`);
            console.log(`[CLIENT] Delete Latency: ${deleteEndTime - deleteStartTime} ms`);
            console.log(`[CLIENT] Delete Body:`, JSON.stringify(deleteData, null, 2));
        }

        await sleep(500);

        // Test 3: Supplementary Problem 2 - Error Event Listener
        console.log('\n----------------------------------------------------------------');
        console.log('TEST 3: Error Event Listener Demonstration');
        console.log('----------------------------------------------------------------');
        console.log('[CLIENT] Dispatching task with simulateError: true to trigger error listener...');

        const errorTestStart = new Date();
        const errPostResponse = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Task Triggering Notification Error',
                description: 'Verifies error event listener catches failure gracefully',
                priority: 'low',
                simulateError: true
            })
        });

        const errResponseData = await errPostResponse.json();
        console.log(`[CLIENT] Response received instantly (Status ${errPostResponse.status}):`, errResponseData.message);
        console.log('[INFO] Server remains healthy and will catch the error in taskEvents.on("error").');
        console.log('[INFO] Waiting 2.5 seconds for error event trigger...\n');

        await sleep(2500);

        // Cleanup the error test task
        if (errResponseData.data?._id) {
            await fetch(`${BASE_URL}/tasks/${errResponseData.data._id}`, { method: 'DELETE' });
        }

        console.log('================================================================');
        console.log('        ALL PRACTICAL 10 VERIFICATION TESTS COMPLETED           ');
        console.log('================================================================\n');

    } catch (err) {
        console.error('Test execution failed:', err);
    }
}

runPractical10Tests();
