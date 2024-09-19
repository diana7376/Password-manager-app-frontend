import axios, {token} from './axiosConfg';

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
    // delete password
    return axios.delete(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/${id}/`, config)
        .then((response) => {
            if (response.status === 204) {
                console.log('Item deleted successfully');
                // Check if the groupId is null (unlisted)
                if (groupId === null || groupId === 'null') {
                    // Fetch unlisted password items (those with null groupId)
                    return axios.get('http://127.0.0.1:8000/api/password-items/unlisted/', config);
                } else {
                    // Fetch remaining password items for the group
                    return axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`, config);
                }
                return Promise.resolve();
            }
        })
        .then(response => {
            const remainingPasswords = response.data;
            if (remainingPasswords.length === 0 && groupId !== null) {
                // If no passwords left in the group, delete the group
                return axios.delete(`http://127.0.0.1:8000/api/groups/${groupId}/`, config)
                    .then(() => {
                        console.log(`Group ${groupId} deleted because it became empty.`);
                    });
            }
        })
        .catch(error => {
            console.error('Error in deleteData', error);
            throw error;
        });
}



export function fetchAllPasswordItems(setData) {
    axios.get('http://127.0.0.1:8000/api/password-items/', config) // Adjust the endpoint if needed
        .then(response => {
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
        })
        .catch(error => {
            console.error('Error fetching all password items:', error);
        });
}

export function fetchUnlistedPasswordItems(setData) {
    axios.get('http://127.0.0.1:8000/api/password-items/unlisted/', config) // Adjust the endpoint if needed
        .then(response => {
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
        })
        .catch(error => {
            console.error('Error fetching unlisted password items:', error);
        });
}



export function dataFetching(groupId, setData) {
    axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`, config)
        .then(response => {
            // Map through the password items and fetch group name for each item
            const passwordItemsWithGroupNames = response.data.map(async (item) => {
                try {
                    // Fetch the group details using the groupId to get the groupName
                    const groupResponse = await axios.get(`http://127.0.0.1:8000/api/groups/${item.groupId}/`, config);
                    const groupName = groupResponse.data.groupName;

                    // Return the updated password item with the group name
                    return {
                        id: item.id,
                        itemName: item.itemName,
                        userName: item.userName,
                        password: item.password,
                        groupId: item.groupId,
                        groupName: groupName,
                        userId: item.userId,
                        comment: item.comment,
                        url: item.url,
                    };
                } catch (error) {
                    console.error(`Error fetching group name for groupId ${item.groupId}:`, error);
                    return {
                        ...item,
                        groupName: 'Unknown',  // Fallback in case fetching groupName fails
                    };
                }
            });

            // Wait for all promises to resolve
            Promise.all(passwordItemsWithGroupNames).then((resolvedItems) => {
                setData(resolvedItems);
            });
        })
        .catch(error => {
            console.error('Error fetching password items for group:', error);
        });
}


export const fetchHistory = async (passwordId) => {
    try {
        const response = await fetch(`/api/password-history`);
        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};
