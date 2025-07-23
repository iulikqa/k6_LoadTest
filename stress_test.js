import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 100 },  // normal load
        { duration: '5m', target: 100 },
        { duration: '2m', target: 300 },  // stress
        { duration: '5m', target: 300 },
        { duration: '2m', target: 500 },  // extreme load
        { duration: '5m', target: 500 },
        { duration: '10m', target: 0 },   // recovering
    ],
    thresholds: {
        http_req_failed: ['rate<0.02'],   // allow up to 2% errors
        http_req_duration: ['p(95)<2000'], // 5% of requests must be faster than 2 seconds
    },
};

export default function () {
    // Alternate between different types of queries
    const random = Math.random();
    let res;
    
    if (random < 0.6) {
        // 60% GET requests
        res = http.get('http://localhost:3000/posts');
        check(res, {
            'GET status is 200': (r) => r.status === 200,
        });
    } else if (random < 0.85) {
        // 25% POST requests
        let payload = JSON.stringify({
            title: `Stress test ${__VU}`,
            author: `User ${__VU}`,
        });
        res = http.post('http://localhost:3000/posts', payload);
        check(res, {
            'POST status is 201': (r) => r.status === 201,
        });
    } else {
        // 15% DELETE requests (only for existing IDs)
        let postId = Math.floor(Math.random() * 100) + 1;
        res = http.del(`http://localhost:3000/posts/${postId}`);
        check(res, {
            'DELETE status is 2xx or 404': (r) => r.status === 200 || r.status === 204 || r.status === 404,
        });
    }
}