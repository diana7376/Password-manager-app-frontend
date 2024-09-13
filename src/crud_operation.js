import axios from './axiosConfg';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMzgwNDg0LCJpYXQiOjE3MjYwNjA0ODQsImp0aSI6IjgzMTA2Njk1OTVjNjRlZThhYmYzMTFjM2UyMmZmNzQwIiwidXNlcl9pZCI6MX0.FV5m3mUDf5_CtVmtOd226WJo6EfE8IbZF7WHnctRSw4 "
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
    axios.get('http://127.0.0.1:8000/api/password-items/', config)
        .then(response => {
            const mappedData = response.data.map(item => ({
                id: item.id,
                itemName: item.itemName,
                userName: item.userName,
                password: item.password,
                groupId: item.groupId,
                userId :item.userId,
                comment: item.comment,
                url: item.url,
            }));
            setData(mappedData);
        })
        .catch(error => {
            console.error('' +
                'There is an error fetching the data.',error);
        });
}
