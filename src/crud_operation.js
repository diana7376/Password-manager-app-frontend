
import axiosInstance, { token } from './axiosConfg';
import {URLS} from "./apiConstants";
import axios from "axios";

export const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }  // Correct usage of token for authorization
};
console.log(`used token: ${localStorage.getItem('token')}`);

export function addPasswordItem(newItem, groupId) {
    // Create a copy of newItem to avoid directly modifying the original object
    const payload = { ...newItem };

    // Conditionally remove groupId if it's null
    if (groupId === null) {
        delete payload.groupId; // Omit groupId from the payload
    }

    const url = groupId === null || groupId === 'null'
        ? URLS.ALL_PASSWORDS
        : URLS.PASSWORD_FROM_GROUP(groupId);

    return axios.post(url, payload, config)
        .then(response => {
            const createdPassId = response.data.passId; // Get the ID of the newly created password item
            return fetchPasswordById(createdPassId, groupId); // Fetch the newly created item with decrypted password
        })
        .catch(error => {
            console.error('Error in adding a new password', error);
            throw error;
        });
}

// Helper function to fetch a password item by its ID
export function fetchPasswordById(passId, groupId) {
    const url = URLS.PASSWORD_BY_ID(groupId, passId); // Dynamically build the URL
    return axiosInstance.get(url)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching password by ID:', error);
            throw error;
        });
}

export const updatePasswordItem = (passId, groupId, updatedData, setData) => {
    // Adjust URL for unlisted items
    const url = (groupId === null || groupId === 'null' || groupId === 0)
        ? URLS.PASSWORD_NO_GROUP(passId)
        : URLS.PASSWORD_BY_ID(passId,groupId);

    // Remove the groupId from the data if it's for unlisted items
    const dataToSend = { ...updatedData };
    if (groupId === null || groupId === 'null' || groupId === 0) {
        delete dataToSend.groupId;  // Remove groupId when it's unlisted or null
    }

    console.log(`Updating URL: ${url}`);

    return axios.put(url, dataToSend, config)
        .then(response => {
            if (response.data && typeof response.data === 'object') {
                const updatedPasswordItem = {
                    passId: response.data.passId,
                    itemName: response.data.itemName,
                    userName: response.data.userName,
                    password: response.data.password,
                    groupId: response.data.groupId,
                    userId: response.data.userId,
                    comment: response.data.comment,
                    url: response.data.url,
                };

                // Call the passed-in setData function to update the state
                if (typeof setData === 'function') {
                    setData(prevData =>
                        prevData.map(item =>
                            item.passId === updatedPasswordItem.passId ? updatedPasswordItem : item
                        )
                    );
                } else {
                    console.error('setData is not a function');
                }
            } else {
                console.error('Unexpected response format:', response.data);
            }

            return response.data;
        })
        .catch(error => {
            console.error('Error updating the password item:', error);
            throw error;
        });
};

function deleteGroup(groupId, setGroupItems) {
    axios.delete(URLS.GROUP_BY_ID(groupId), config)
        .then((response) => {
            if (response.status === 204) {
                console.log(`Group ${groupId} deleted successfully`);

                // Update the sidebar to remove the deleted group
                setGroupItems(prevGroupItems =>
                    prevGroupItems.filter(group => group.key !== `group-${groupId}`)
                );
            } else {
                throw new Error('Failed to delete the group.');
            }
        })
        .catch((error) => {
            console.error('Error deleting the group:', error);
        });
}


function checkAndDeleteGroup(groupId, setData, setGroupItems) {
    // Fetch all password items for this group to see if any are left
    axios.get(URLS.PASSWORD_FROM_GROUP(groupId), config)
        .then(response => {
            const remainingItems = response.data.passwords || [];

            if (remainingItems.length === 0) {
                // Group is empty, delete the group
                deleteGroup(groupId, setGroupItems);
            } else {
                // Update state with remaining password items if group is not empty
                setData(remainingItems);
            }
        })
        .catch(error => {
            console.error('Error checking if group is empty:', error);
        });
}


export function deleteData(passId, groupId, setData, onSuccess, setGroupItems) {
    // Delete password item
    return axios.delete(URLS.GROUP_BY_ID(passId,groupId), config)
        .then((response) => {
            if (response.status === 204) {
                console.log('Password item deleted successfully');

                // Update the table by removing the deleted item from the data state
                setData(prevData => prevData.filter(item => item.passId !== passId));

                // After successful deletion, check if the group is empty
                checkAndDeleteGroup(groupId, setData, setGroupItems);

                // If deletion was successful, update the UI
                onSuccess();  // Close the modal, update state, etc.
            } else {
                throw new Error('Failed to delete the password item.');
            }
        })
        .catch((error) => {
            console.error('Error during password item deletion:', error);
            throw error;
        });
}




export function fetchAllPasswordItems(setData) {
    axios.get(URLS.ALL_PASSWORDS, config) // Adjust the endpoint if needed
        .then(response => {
            // Check if response.data is an array
            if (Array.isArray(response.data.passwords)) {
                const mappedData = response.data.passwords.map(item => ({
                    passId: item.passId,
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
    axios.get(URLS.PASSWORD_GROUP_UNLISTED, config) // Adjust the endpoint if needed
        .then(response => {
            if (response.data && Array.isArray(response.data.passwords)) {
                const mappedData = response.data.passwords.map(item => ({
                    passId: item.passId,
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
    axios.get(URLS.PASSWORD_FROM_GROUP(groupId), config)
        .then(response => {
            const passwordItemsWithGroupNames = response.data.passwords.map(item => ({
                passId: item.passId,
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

export const fetchHistory = async (passwordId) => {
    try {

        const response = await fetch(URLS.HISTORY(passwordId)); // Include passwordId in the URL
        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        return await response.json();
        //return response.data.passwords;

    } catch (error) {
        console.error('Error fetching history:', error.response || error); // Log the entire error object
        if (error.response && error.response.data) {
            message.error(`Error: ${error.response.data.message || 'Failed to fetch history'}`);
        } else {
            message.error('Failed to fetch history');
        }
        throw error;
    }
};
