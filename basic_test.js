import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 20 },  // gradually increase the load to 20 users
        { duration: '1m', target: 20 },   // hold the load
        { duration: '30s', target: 0 },   // gradually reduce the load
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% requests must be executed faster than 500 ms
        'http_req_duration{type:POST}': ['p(95)<800'],
    },
};

export default function () {
    // GET request
    let res = http.get('http://localhost:3000/posts');
    check(res, {
        'GET status is 200': (r) => r.status === 200,
        'GET response has items': (r) => JSON.parse(r.body).length > 0,
    });

    // POST request
    let payload = JSON.stringify({
        title: `Test post ${__VU}`,
        author: `User ${__VU}`,
    });
    let params = { tags: { type: 'POST' } };
    res = http.post('http://localhost:3000/posts', payload, params);
    check(res, {
        'POST status is 201': (r) => r.status === 201,
    });

    sleep(1);
}