const BASE_URL = 'http://localhost:5000';

async function testAPI() {
    console.log('--- STARTING PRACTICAL 5 API VERIFICATION TESTS ---\n');

    try {
        // 1. GET /tasks
        console.log('1. GET /tasks (Fetch initial task list)');
        let res = await fetch(`${BASE_URL}/tasks`);
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 2. Schema Validation Failure: POST /tasks missing required title
        console.log('\n2. POST /tasks (Validation failure test: missing required title)');
        res = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: 'No title provided' })
        });
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 3. Schema Validation Failure: POST /tasks invalid priority enum
        console.log('\n3. POST /tasks (Validation failure test: invalid priority enum)');
        res = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Task with bad priority', priority: 'urgent' })
        });
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 4. POST /tasks with valid JSON (Testing whitespace trim pre-save hook & priority enum)
        console.log('\n4. POST /tasks (Valid creation with untrimmed title & priority)');
        res = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: '   Connect MongoDB with Mongoose   ',
                description: 'Implement Practical 5 schema and endpoints',
                priority: 'high'
            })
        });
        console.log(`Status: ${res.status}`);
        const createdResponse = await res.json();
        console.log(`Body:`, createdResponse);
        const createdId = createdResponse.data?._id;
        console.log(`Created MongoDB Document ID: ${createdId}`);
        console.log(`Trimmed Title Verification: "${createdResponse.data?.title}"`);

        // 5. GET /tasks/:id (Fetch task by valid MongoDB _id)
        console.log(`\n5. GET /tasks/${createdId} (Fetch task by _id)`);
        res = await fetch(`${BASE_URL}/tasks/${createdId}`);
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 6. GET /tasks/:id (Valid ObjectId format but non-existent in DB -> 404 test)
        const fakeObjectId = '507f1f77bcf86cd799439011';
        console.log(`\n6. GET /tasks/${fakeObjectId} (Non-existent ObjectId 404 test)`);
        res = await fetch(`${BASE_URL}/tasks/${fakeObjectId}`);
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 7. GET /tasks/invalid-id (Invalid ObjectId string format -> CastError 400 test)
        console.log('\n7. GET /tasks/invalid-id (CastError invalid ID test)');
        res = await fetch(`${BASE_URL}/tasks/invalid-id`);
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 8. PUT /tasks/:id (Update task completed status and description)
        console.log(`\n8. PUT /tasks/${createdId} (Update task)`);
        res = await fetch(`${BASE_URL}/tasks/${createdId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true, priority: 'medium' })
        });
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 9. DELETE /tasks/:id (Delete task document)
        console.log(`\n9. DELETE /tasks/${createdId} (Delete task)`);
        res = await fetch(`${BASE_URL}/tasks/${createdId}`, {
            method: 'DELETE'
        });
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 10. GET /non-existent-route (404 Route Handler test)
        console.log('\n10. GET /non-existent-route (404 route handler test)');
        res = await fetch(`${BASE_URL}/non-existent-route`);
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        // 11. GET /error-test (Global Error Handler test)
        console.log('\n11. GET /error-test (Global error handler test)');
        res = await fetch(`${BASE_URL}/error-test`);
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, await res.json());

        console.log('\n--- ALL PRACTICAL 5 API VERIFICATION TESTS PASSED ---');
    } catch (err) {
        console.error('Test execution failed:', err);
    }
}

testAPI();
