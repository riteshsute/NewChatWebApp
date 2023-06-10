


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
        const { name, userId } = JSON.parse(decodedPayload);
        console.log(userId, 'areeeeeeeeeeeeeeee')
        return { name, userId };
      } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
      }
    }
  
    function updateUsers(userList) {
      const userListElement = document.getElementById("user-list");
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

      console.log(userId, ' userrId from useerInfo');
      
      if (message.trim() !== "") {
        let url;
        if (groupId) {
          url = `http://localhost:4000/ChatApp/sendGroupMessage`;
        } else {
          url = `http://localhost:4000/ChatApp/sendMessage`;
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
  
      const data = {
        name: groupName,
        userIds: userIds,
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
    
    
    
  
    // function startMessageUpdate() {
    //   setInterval(() => {
    //     updateChatWindow();
    //   }, 1000);
    // }
  
      
    displayUsers();
    displayMessages();
    displayGroups();
    // startMessageUpdate()
  
    const chatForm = document.getElementById("chat-form");
    chatForm.addEventListener("submit", function(event) {
      event.preventDefault(); 
      sendChatMessage(groupId); 
    });
  
    const createGroupBtn = document.getElementById("create-group-btn");
    createGroupBtn.addEventListener("click", function(event) {
      event.preventDefault();
      createGroup();
    });
  
  
  
  });
  
  
  
    