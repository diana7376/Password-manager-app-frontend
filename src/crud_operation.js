import axios from 'axios';

const token = " eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMzgwNDg0LCJpYXQiOjE3MjYwNjA0ODQsImp0aSI6IjgzMTA2Njk1OTVjNjRlZThhYmYzMTFjM2UyMmZmNzQwIiwidXNlcl9pZCI6MX0.FV5m3mUDf5_CtVmtOd226WJo6EfE8IbZF7WHnctRSw4 "
export const config = {
    headers: { Authorization: `Bearer ${token}` }
};

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


export function updatePasswordItem(updateItem, groupId) {
    axios.put(`http://127.0.0.1:8000/groups/${groupId}/password-items/${updatedItem.id}/`, updatedItem)
        .then(response => {
            const newData = data.map(item => {
                if (item.id === updateItem.id){
                    return response.data;
                }
                return item;
            });
            setData(newData);
        })
        .catch(error =>{
            console.log('Error in updating the password.',error);
        })

}

export function deleteData(id, groupId) {
    axios.delete(`http://127.0.0.1:8000/groups/${groupId}/password-items/${id}/`)
        .then(() => {
            const newData = data.filter(item => item.id !== id);
            setData(newData);
        })
        .catch(error => {
            console.log('Error in deleting the password.',error);
        })
}

export function dataFetching(groupId, setData) {
    axios.get('http://127.0.0.1:8000/api/password-items/', config)
        .then(response => {
            const mappedData = response.data.map(item => ({
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
