import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '5m', target: 100 },  // gradually up to 100 users
        { duration: '8h', target: 100 },  // hold for 8 hours
        { duration: '5m', target: 0 },    // gradually reduce
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // less than 1% errors
        http_req_duration: ['p(95)<500'], // 95% of requests must be faster than 500ms
    },
};

export default function () {
    const requests = [
        { method: 'GET', url: 'http://localhost:3000/posts' },
        { method: 'GET', url: 'http://localhost:3000/comments' },
        { method: 'GET', url: 'http://localhost:3000/profile' },
    ];
    
    let res = http.batch(requests);
    
    check(res[0], {
        'posts status is 200': (r) => r.status === 200,
    });
    check(res[1], {
        'comments status is 200': (r) => r.status === 200,
    });
    check(res[2], {
        'profile status is 200': (r) => r.status === 200,
    });
}