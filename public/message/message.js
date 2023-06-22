
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
            messageInput.value = ""; 
            const senderName1 = response.data.newMessage.senderName
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
  
      getGroupMembers(groupId);
      
      axios
        .get(`http://localhost:4000/ChatApp/getMessage/${groupId}`, {
          params: {
              userId: userId,
              lastMessageId: lastMessageId,
          }  
        })
        .then(response => {
          const messageList = response.data;
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
    axios
      .get("http://localhost:4000/ChatApp/searchUser", {
          params: {
            query: query,
            groupId: groupId
          },
        })
        .then((response) => {
          const userList = response.data.users;
          const userListElement = document.getElementById("user-list");
          const searchResultsElement = document.getElementById("search-results");
          userListElement.innerHTML = "";
          searchResultsElement.innerHTML = "";

          const adminId = response.data.adminIds;
          // console.log(token2, ' pouiiiiii')
          // const decodedToken2 = atob(token2);
          // console.log(decodedToken2, ' kooiiiiiiiii')

          // const { adminId } = JSON.parse(decodedToken2);

 
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

    if (!adminId.includes(currentUserId)) {
      // console.log("Only group admin can add users.");
      alert("Only group admin can add users.");
      return;
    }
  
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
          // console.log("User added to group successfully");
          // console.log(response, ' resonse adding 1111')
        })
        .catch((error) => {
          console.error("error adding user to group:", error);
        });
    }


    // const addUserBtn = document.getElementById("add-user-btn");
    // addUserBtn.addEventListener("click", function (event) {
    //   event.preventDefault();
    //   const query = searchUserInput.value.trim();
    //   if (query !== "") {
    //     searchUser(query);
    //   }
    // });

  
     const chatForm = document.getElementById("chat-form");
      chatForm.addEventListener("submit", function(event) {
        event.preventDefault(); 
        sendChatMessage(groupId); 
      });
    

    
      function makeMemberAdmin(groupId, memberId) {
      const userInfo = getUserInfoFromToken();
      const currentUserId = userInfo.userId;
      axios
        .put(`http://localhost:4000/ChatApp/makeAdmin/${groupId}/${memberId}`, {
          currentUserId: currentUserId
        })
        .then(response => {
          // console.log("user successfully made admin");
          // console.log(response.data);
        })
        .catch(error => {
          console.error("erro making user admin:", error);
        });
    }


    document.addEventListener("click", function(event) {
      if (event.target.classList.contains("make-admin-btn")) {
        // const groupId = event.target.getAttribute("data-group-id");
        const memberIdInput = document.getElementById("make-admin-input");
        const memberId = memberIdInput.value;
        makeMemberAdmin(groupId, memberId);
      }
    });

    function getGroupMembers(groupId) {

      axios.get(`http://localhost:4000/ChatApp/groupMembers/${groupId}`)
        .then(response => {
          const groupMembers = response.data;
          const memberList = document.getElementById("member-list");
          memberList.innerHTML = ""; 
    
          groupMembers.forEach(member => {
            const memberItem = document.createElement("li");
            memberItem.textContent = member.name;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => removeMember(member.id)); 
          
            memberItem.appendChild(removeButton);
            memberList.appendChild(memberItem);
          });
        })
        .catch(error => {
          console.error("Error fetching group members:", error);
        });
    }


    function removeMember(memberId) {
      axios.delete(`http://localhost:4000/ChatApp/removeMember/${memberId}`)
        .then(response => {
          // console.log(response, ' response of remove member')
          getGroupMembers(groupId);
        })
        .catch(error => {
          console.error("Error removing member:", error);
        });
    }
    

    function startMessageUpdate() {
      setInterval(() => {
        updateChatWindow();
      }, 1000);
    }


    
    function updateChatWindow() {
      const storedMessages = localStorage.getItem('messageList');
      const lastMessageId = storedMessages ? JSON.parse(storedMessages)[0]?.id : [];
    
      const userInfo = getUserInfoFromToken();
      const userId = userInfo.userId;
      
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
          console.error("Error fetching messages:", error);
        });
    }

      
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
  
  
  
    