


document.addEventListener("DOMContentLoaded", function() {

    const socket = io('http://localhost:4000');
  
    socket.on('userStatus', (users) => {
      updateUsers(users);
    });
  
    function getUserInfoFromToken() {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
    
      try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        const { name, userId, adminId } = JSON.parse(decodedPayload);
        console.log(userId, 'areeeeeeeeeeeeeeee')
        return { name, userId };
      } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
      }
    }
  
    function updateUsers(userList) {
      const userListElement = document.getElementById("online-list");
      userListElement.innerHTML = ""; 
  
      
      userList.forEach(user => {
        const listItem = document.createElement("li");
        listItem.innerText = user.name;
        userListElement.appendChild(listItem);
      });
  
      const userCountElement = document.querySelector(".user-count");
      userCountElement.innerText = `Users (${userList.length})`; // Update user count
    }
  
  
  
    function sendChatMessage(groupId) {
      const messageInput = document.getElementById("chatIn");
      const userInfo = getUserInfoFromToken()
      const userId = userInfo.userId; 
      const message = messageInput.value;    

      console.log(userId, groupId, ' userrId from useerInfo');
      
      if (message.trim() !== "") {
        let url;
        if (!groupId) {
          url = `http://localhost:4000/ChatApp/sendMessage`;
        } else {
          url = `http://localhost:4000/ChatApp/sendGroupMessage`;
        }
    
        const messageObject = {
          userId,
          message,
          groupId 
        };
    
        axios
          .post(url, messageObject)
          .then(response => {
            console.log(response.data, ' backend response '); 
            messageInput.value = ""; 
            const senderName1 = response.data.newMessage.senderName
            console.log(senderName1, "in sender name")
          })
          .catch(error => {
            console.error("Error sending chat message:", error);
          });
      }
    } 
  
  
    function displayUsers() {
      axios.get("http://localhost:4000/ChatApp/getUsers")
        .then(response => {
          const userList = response.data;
          updateUsers(userList);
        })
        .catch(error => {
          console.error("Error fetching user list:", error);
        });
    }
  
    displayUsers() 
  
   
    function displayMessages() {
      const storedMessages = localStorage.getItem('messageList');
      const lastMessageId = storedMessages ? JSON.parse(storedMessages)[0]?.id : [];
  
      const userInfo = getUserInfoFromToken();
      const userId = userInfo.userId;
  
      console.log(userId, userInfo, ' hhhhhsposssssssss')
  
    
      axios.get('http://localhost:4000/ChatApp/getMessage', { 
        params: {
          userId: userId,
          lastMessageId: lastMessageId,
        }
      })
        .then(response => {
          const newMessages = response.data;
          let messageList = storedMessages ? [...JSON.parse(storedMessages)] : [];
    
          newMessages.forEach(message => {
            const messageExists = messageList.some(m => m.id === message.id);
            if (!messageExists) {
              messageList.push(message);
            }
          });
  
          if (messageList.length > 10) {
            messageList = messageList.slice(-10); 
          }
    
          localStorage.setItem('messageList', JSON.stringify(messageList));
          const chatWindow = document.getElementById("chat-window");
          chatWindow.innerHTML = ""; 
    
          messageList.forEach(message => {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            const usernameElement = document.createElement("span");
            usernameElement.classList.add("username");
            const senderName = message.sender;
            console.log(senderName, 'hahdbhdbhdbad')
            usernameElement.innerText = senderName; 
            messageElement.appendChild(usernameElement);
    
            const contentElement = document.createElement("span");
            contentElement.classList.add("content");
            contentElement.innerText = message.message;
            messageElement.appendChild(contentElement);
    
            chatWindow.appendChild(messageElement);
          });
        })
        .catch(error => {
          console.error("Error fetching messages:", error);
        });
    }
  
  
  
    function createGroup() {
      const groupNameInput = document.getElementById("group-name");
      const invitedUsersInput = document.getElementById("invited-users");
  
      const groupName = groupNameInput.value;
      const invitedUsers = invitedUsersInput.value;
  
      const userIds = invitedUsers.split(",").map(id => id.trim());

      const userInfo = getUserInfoFromToken();
      const userId = userInfo.userId;
  
      const data = {
        name: groupName,
        userIds: userIds,
        adminId: userId
      };
  
      axios
        .post("http://localhost:4000/ChatApp/createGroup", data)
        .then(response => {
          console.log(response.data);
          const { success, groupId } = response.data;
          if (success) {
            const groupListElement = document.getElementById("group-list-items");
            const listItem = document.createElement("li");
            listItem.innerText = groupName;
            groupListElement.appendChild(listItem);
            groupNameInput.value = "";
            invitedUsersInput.value = "";
            alert(`Group created successfully. Group ID: ${groupId}`);
          }
        })
        .catch(error => {
          console.error("Error creating group:", error);
        });
    }
  
    let groupId = null
  
    function displayGroups() {
      axios
        .get("http://localhost:4000/ChatApp/displayGroups")
        .then(response => {
          const groupList = response.data;
          const groupListElement = document.getElementById("group-list-items");
          groupListElement.innerHTML = "";
    
          groupList.forEach(group => {
            const listItem = document.createElement("li");
            listItem.innerText = group.name;
            listItem.addEventListener("click", () => {
              groupId = group.id
              switchGroup(group.id, group.name);
            });
            groupListElement.appendChild(listItem);
          });
        })
        .catch(error => {
          console.error("Error fetching group list:", error);
        });
    }
  
  
    function switchGroup(groupId, groupName) {
      const currentGroupElement = document.getElementById("current-group");
      currentGroupElement.innerText = `Current Group: ${groupName}`;
  
      const storedMessages = localStorage.getItem('messageList');
      const lastMessageId = storedMessages ? JSON.parse(storedMessages)[0]?.id : [];
  
      const userInfo = getUserInfoFromToken();
      const userId = userInfo.userId;
  
      axios
        .get(`http://localhost:4000/ChatApp/getMessage/${groupId}`, {
          params: {
              userId: userId,
              lastMessageId: lastMessageId,
          }  
        })
        .then(response => {
          const messageList = response.data;
          console.log(messageList, 'in the group messagwe ')
          const chatWindow = document.getElementById("chat-window");
          chatWindow.innerHTML = "";
    
          messageList.forEach(message => {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            const usernameElement = document.createElement("span");
            usernameElement.classList.add("username");
            usernameElement.innerText = message.sender;
            messageElement.appendChild(usernameElement);
    
            const contentElement = document.createElement("span");
            contentElement.classList.add("content");
            contentElement.innerText = message.message;
            messageElement.appendChild(contentElement);
    
            chatWindow.appendChild(messageElement);
          });
        })
        .catch(error => {
          console.error("Error fetching group messages", error);
        });
    }


    // groupId = " ";


  function searchUser(query, groupId) {
    console.log(query, groupId,  'at frontend code')
    axios
      .get("http://localhost:4000/ChatApp/searchUser", {
          params: {
            query: query,
            groupId: groupId
          },
        })
        .then((response) => {
          const userList = response.data.users;
          console.log(response.data, ' in the frontend search')
          const userListElement = document.getElementById("user-list");
          const searchResultsElement = document.getElementById("search-results");
          userListElement.innerHTML = "";
          searchResultsElement.innerHTML = "";

          const adminId = response.data.adminId;
          // console.log(token2, ' pouiiiiii')
          // const decodedToken2 = atob(token2);
          // console.log(decodedToken2, ' kooiiiiiiiii')

          // const { adminId } = JSON.parse(decodedToken2);
    
          console.log(adminId, 'jjjjjjjoooooo');

 
          userList.forEach((user) => {
            const listItem = document.createElement("li");
            listItem.innerText = user.name;

            listItem.addEventListener("click", function() {
              addUserToGroup(user, groupId, adminId);
            });

  
            userListElement.appendChild(listItem);
          });
  
          searchResultsElement.innerHTML = `Search Results for '${query}': ${userList.length} users found.`;
        })
        .catch((error) => {
          console.error("Error searching user:", error);
        });
    }


    const searchUserInput = document.getElementById("search-user");
  
    searchUserInput.addEventListener("input", function () {
      const query = searchUserInput.value.trim();
      if (query !== "") {
        searchUser(query, groupId);
      } else {
        displayUsers(); // Show all users when the search query is empty
      }
    });



  function addUserToGroup(user, groupId, adminId) {
    
    const userInfo = getUserInfoFromToken();
    const currentUserId = userInfo.userId;

    console.log(currentUserId, ' klloloooooo')
    if (adminId !== currentUserId) {
      console.log("Only the group admin can add users.");
      alert("Only the group admin can add users.");
      return;
    }

      console.log(user, groupId, adminId, 'in the addusergroup fun')
  
      const invitedUsersInput = document.getElementById("invited-users");
      const invitedUsers = invitedUsersInput.value;
      const userIds = invitedUsers ? invitedUsers.split(",").map((id) => id.trim()) : [];
  
      userIds.push(user.id);
  
      invitedUsersInput.value = userIds.join(", ");
  
      const userId = user.id;
  
      axios
        .post(`http://localhost:4000/ChatApp/addGroupMember/${groupId}/${userId}`, {
          currentUserId: currentUserId 
        })
        .then((response) => {
          console.log("User added to group successfully");
          console.log(response, ' resonse adding 1111')
        })
        .catch((error) => {
          console.error("Error adding user to group:", error);
        });
    }


    const addUserBtn = document.getElementById("add-user-btn");
    addUserBtn.addEventListener("click", function (event) {
      event.preventDefault();
      const query = searchUserInput.value.trim();
      if (query !== "") {
        searchUser(query);
      }
    });

  
     const chatForm = document.getElementById("chat-form");
      chatForm.addEventListener("submit", function(event) {
        event.preventDefault(); 
        sendChatMessage(groupId); 
      });
    
  
    // function startMessageUpdate() {
    //   setInterval(() => {
    //     updateChatWindow();
    //   }, 1000);
    // }
  
      
    displayUsers();
    displayMessages();
    displayGroups();
    // startMessageUpdate()
  
    
  
    const createGroupBtn = document.getElementById("create-group-btn");
    createGroupBtn.addEventListener("click", function(event) {
      event.preventDefault();
      createGroup();
    });
  
  
  
  });
  
  
  
    