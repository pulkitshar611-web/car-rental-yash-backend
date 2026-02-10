const axios = require('axios');

async function testUpdate() {
    try {
        const res = await axios.put('http://localhost:5055/api/customers/6', {
            name: 'Test Update',
            phone: '1234567890'
        });
        console.log(res.data);
    } catch (e) {
        console.error('Error Status:', e.response?.status);
        console.error('Error Data:', e.response?.data);
    }
}
testUpdate();
