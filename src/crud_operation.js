import axios from 'axios';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxMzIyMzI0LCJpYXQiOjE3MjYxMzgzMjQsImp0aSI6ImRlMmEzYzAxNzE3ZjQ0YmE4MTliMzMzYjc1YjM1NWVlIiwidXNlcl9pZCI6MX0.-HnajkUUmPF64Z-xSch4WZ2eV8nreC_yQsPCPPm2y-s"
export const config = {
    headers: { Authorization: `Bearer ${token}` }
};
console.log("used token:", token);

export function addPasswordItem(newItem, groupId) {
    return axios.post(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`,
        newItem,
        config)  // Use backticks for template literals
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log('Error in adding a new password', error);
            throw error;
        });
}


export function updatePasswordItem(id, groupId, updatedData) {
    return axios.put(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/${id}/`, updatedData, config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error('Error updating the password item:', error);
            throw error;
        });
}


export function deleteData(id, groupId) {
    return axios.delete(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/${id}/`, config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error('Error deleting the password item:', error);
            throw error;
        });
}


export function dataFetching(groupId, setData) {
    axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`, config)
        .then(response => {
            const mappedData = response.data.map(item => ({
                id: item.id,
                itemName: item.itemName,
                userName: item.userName,
                password: item.password,
                groupId: item.groupId,
                userId: item.userId,
                comment: item.comment,
                url: item.url,
            }));
            setData(mappedData);
        })
        .catch(error => {
            console.error('Error fetching password items for group:', error);
        });
}


export const fetchHistory = async (passwordId) => {
    try {
        //const response = await fetch(`/api/passwords/${passwordId}/history`);
        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};
