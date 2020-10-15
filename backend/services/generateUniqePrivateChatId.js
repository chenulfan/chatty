
export default (currentUserId, friendId) => {
    if (currentUserId < friendId) {
        return currentUserId + "_" + friendId
    }
    return friendId + "_" + currentUserId
} 