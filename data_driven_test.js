import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const testData = new SharedArray('posts data', function () {
  return [
    { "id": "983b", "title": "Test post 9", "author": "User 9" } // ID as a string!
  ];
});

export let options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const testId = "983b"; // Using string ID
  const url = `http://localhost:3000/posts/${testId}`;
  
  console.log(`Requesting URL: ${url}`);
  
  let res = http.get(url);
  console.log(`Response status: ${res.status}`);
  console.log(`Response body: ${res.body}`);

  check(res, {
    'GET by ID status is 200': (r) => r.status === 200,
    'GET by ID returns correct data': (r) => {
      if (r.status !== 200) return false;
      
      try {
        const body = JSON.parse(r.body);
        console.log(`Parsed JSON: ${JSON.stringify(body)}`);
        
        // Compare ID as strings + check title
        return String(body.id) === String(testId) && body.title.includes("Test post");
      } catch (e) {
        console.error(`JSON parse error: ${e.message}`);
        return false;
      }
    }
  });
}
