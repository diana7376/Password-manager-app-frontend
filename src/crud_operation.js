import axios, {token} from './axiosConfg';
import { config } from './axiosConfg';

// export const config = {
//     headers: { Authorization: `Bearer ${token}` }  // Correct usage of token for authorization
// };
console.log("used token:", token);

export function addPasswordItem(newItem, groupId) {
    return axios.post(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`,
        newItem,
        )  // Use backticks for template literals
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log('Error in adding a new password', error);
            throw error;
        });
}


export const updatePasswordItem = (id, groupId, updatedData, setData) => {
    console.log(`Updating URL: http://127.0.0.1:8000/api/groups/${groupId}/password-items/${id}/`);

    return axios.put(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/${id}/`, updatedData)
        .then(response => {
            // Check if response.data.passwords is an array
            if (Array.isArray(response.data.passwords)) {
                const updatedPasswordItems = response.data.passwords.map(item => ({
                    id: item.id,
                    itemName: item.itemName,
                    userName: item.userName,
                    password: item.password,
                    groupId: item.groupId,
                    userId: item.userId,
                    comment: item.comment,
                    url: item.url,
                }));
                setData(updatedPasswordItems);  // Update the state with the latest data
            } else {
                console.error('Unexpected response format, expected an array:', response.data);
            }

            return response.data;
        })
        .catch(error => {
            console.error('Error updating the password item:', error);
            throw error;
        });
};




export function deleteData(id, groupId, setData) {
    // delete password
    return axios.delete(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/${id}/`)
        .then((response) => {
            if (response.status === 204) {
                console.log('Item deleted successfully');

                // Fetch remaining password items
                if (groupId === null || groupId === 'null') {
                    // Fetch unlisted password items (those with null groupId)
                    return axios.get('http://127.0.0.1:8000/api/password-items/unlisted/');
                } else {
                    // Fetch remaining password items for the group
                    return axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`);
                }
            } else {
                throw new Error('Failed to delete the item.');
            }
        })
        .then((response) => {
            // Check if response.data.passwords is an array
            if (Array.isArray(response.data.passwords)) {
                const mappedData = response.data.passwords.map(item => ({
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
            } else {
                console.error('Unexpected response format or data is not an array:', response.data);
            }
        })
        .catch((error) => {
            console.error('Error in deleteData', error);
            throw error;
        });
}



export function fetchAllPasswordItems(setData) {
    axios.get('http://127.0.0.1:8000/api/password-items/') // Adjust the endpoint if needed
        .then(response => {
            // Check if response.data is an array
            if (Array.isArray(response.data.passwords)) {
                const mappedData = response.data.passwords.map(item => ({
                    id: item.id,
                    itemName: item.itemName,
                    userName: item.userName,
                    password: item.password,
                    groupId: item.groupId,  // Assuming the groupId is part of the response
                    userId: item.userId,
                    comment: item.comment,
                    url: item.url,
                }));
                setData(mappedData);
            } else {
                console.error('Unexpected response format, expected an array:', response.data);
            }
        })
        .catch(error => {
            console.error('Error fetching all password items:', error);
        });
}

export function fetchUnlistedPasswordItems(setData) {
    axios.get('http://127.0.0.1:8000/api/password-items/unlisted/') // Adjust the endpoint if needed
        .then(response => {
            if (response.data && Array.isArray(response.data)) {
                const mappedData = response.data.map(item => ({
                    id: item.id,
                    itemName: item.itemName,
                    userName: item.userName,
                    password: item.password,
                    groupId: item.groupId,  // Assuming the groupId is part of the response
                    userId: item.userId,
                    comment: item.comment,
                    url: item.url,
                }));
                setData(mappedData);
            } else {
                console.error('Unexpected response format or data is not an array:', response.data);
            }
        })
        .catch(error => {
            console.error('Error fetching unlisted password items:', error);
        });
}

export function dataFetching(groupId, setData) {
    axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`)
        .then(response => {
            const passwordItemsWithGroupNames = response.data.passwords.map(item => ({
                id: item.id,
                itemName: item.itemName,
                userName: item.userName,
                password: item.password,
                groupId: item.groupId,
                groupName: item.groupName,
                userId: item.userId,
                comment: item.comment,
                url: item.url,
            }));
            setData(passwordItemsWithGroupNames);
        })
        .catch(error => {
            console.error('Error fetching password items for group:', error);
        });
}






export const fetchHistory = async (passId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;  // Exit if token is not found
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/password-history/${passId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};
