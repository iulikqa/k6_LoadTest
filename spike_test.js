import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 1000 }, // quickly increase to 1000 users
        { duration: '1m', target: 0 },    // quickly reduce the load
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // less than 1% errors
        http_req_duration: ['p(99)<1500'], // 99% of requests must be faster than 1500ms
    },
};

export default function () {
    let res = http.get('http://localhost:3000/posts');
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    
    // Adding other types of requests
    if (Math.random() > 0.7) {
        res = http.get(`http://localhost:3000/posts/${Math.floor(Math.random() * 3) + 1}`);
        check(res, {
            'single post status is 200': (r) => r.status === 200,
        });
    }
}