const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
    try {
        console.log('Testing Signup...');
        // Use a random email to avoid conflict
        const email = `test${Math.floor(Math.random() * 1000)}@college.edu`;
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password: 'password123',
            college_id: null // Allowing null for now or need to create college first
        });
        console.log('Signup Success:', signupRes.data);

        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
    }
};

testAuth();
