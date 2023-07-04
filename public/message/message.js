
document.addEventListener("DOMContentLoaded", function() {

  const socket = io('http://16.171.121.124:4000');


  // socket.on('connect', (users) => {
  //   const userInfo = getUserInfoFromToken()
  //   const userId = userInfo.userId; 
  //   // console.log(userId, 'user connect front')
  //   socket.emit('userConnect', userId);
  //   console.log(users, 'in the connect event')
  //   updateUsers(users);
  // });


  // socket.on('userDisconnect', () => {
  //   // console.log ('user disconnect front');
  //   const userInfo = getUserInfoFromToken()
  //   const userId = userInfo.userId; 
  //   removeUser(userId);
  //   // console.log( userId, 'user disconnect front 44');
  //   socket.emit('userDisconnect', userId);
  //   updateUsers(users)
  // });
  
  // socket.on('newMessage', (message) => {
  //   // console.log('Received new message:', message);
  //   displayMessages(message);
  // });



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


  const fileInput = document.getElementById("file-input");
  const fileButton = document.getElementById("file-button");

  fileButton.addEventListener("click", function(event) {
    event.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    // console.log(file, 'in fronte file')
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const fileUrl = e.target.result;
        // console.log(fileUrl, 'in fronte file2')
        // const message = ''; // You can add an optional message for the file
        const userInfo = getUserInfoFromToken();
        const userId = userInfo.userId;
        // const groupId = ''; // Set the group ID if applicable
        sendChatMessage( groupId, fileUrl);
      };
      reader.readAsDataURL(file);
    }
  });



  
  function updateUsers(userList) {
    // console.log(userList, 'jbdkjhkdhbkh1111')
    const userListElement = document.getElementById('online-list');
    userListElement.innerHTML = '';

    userList.forEach((user) => {
      const listItem = document.createElement('li');
      listItem.innerText = user.name;
      userListElement.appendChild(listItem);
    });

    const userCountElement = document.querySelector('.user-count');
    userCountElement.innerText = `Users (${userList.length})`; // Update user count
  }



  // function removeUser(userId) {
  //   // console.log(userId, users, 'in remove fin')
  //   const userListElement = document.getElementById('online-list');
  //   const userItem = userListElement.querySelector(`[data-userid="${userId}"]`);
  //   if (userItem) {
  //     userItem.remove();
  //   }

  //   const userCountElement = document.querySelector('.user-count');
  //   const userList = userListElement.getElementsByTagName('li');
  //   userCountElement.innerText = `Users (${userList.length})`; // Update user count
  // }


  



  function sendChatMessage(groupId, fileUrl) {
    const messageInput = document.getElementById("chatIn");
    const userInfo = getUserInfoFromToken()
    const userId = userInfo.userId; 
    const message = messageInput.value;    

    // console.log(groupId, 'in front send')
    
    if (message.trim() !== "" || fileUrl) {
      let url;
      if (!groupId) {
        url = `http://16.171.121.124:4000/ChatApp/sendMessage`;
      } else {
        url = `http://16.171.121.124:4000/ChatApp/sendGroupMessage`;
      }
  
      const messageObject = {
        userId,
        message,
        groupId,
        fileUrl
      };

      // console.log(messageObject, 'joasoajsjsjsas')

      // socket.emit('chatMessage', messageObject);

      axios
        .post(url, messageObject)
        .then(response => {
          messageInput.value = ""; 
          console.log(response, 'in response ')
          // const senderName1 = response.data.newMessage.senderName
        })
        .catch(error => {
          console.error("Error sending chat message:", error);
        });
    }
  } 


  function displayUsers() {
    axios.get("http://16.171.121.124:4000/ChatApp/getUsers")
      .then(response => {
        // console.log(response, ' in the display users')
        const userList = response.data;
        updateUsers(userList);
      })
      .catch(error => {
        console.error("Error fetching user list:", error);
      });
  }


  const generalMsgButton = document.getElementById("general-msg-button");
    generalMsgButton.addEventListener("click", () => {
      displayMessages();
    });

 
  function displayMessages() {
    // console.log(message, ' in display message')
    const storedMessages = localStorage.getItem('messageList');
    const lastMessageId = storedMessages ? JSON.parse(storedMessages)[0]?.id : [];

    const userInfo = getUserInfoFromToken();
    const userId = userInfo.userId;

    axios.get('http://16.171.121.124:4000/ChatApp/getMessage', { 
      params: {
        userId: userId,
        lastMessageId: lastMessageId,
      }
    })
      .then(response => {
        const newMessages = response.data;
        // console.log(newMessages, 'khdlsaihdwhdwuadgh')
        let messageList = storedMessages ? [...JSON.parse(storedMessages)] : [];
  
        newMessages.forEach(message => {
          const messageExists = messageList.some(m => m.id === message.id);
          if (!messageExists) {
            messageList.push(message);
          }
        });

        // console.log(messageList, ' [[[[[]]]]]]')

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

          // console.log(message, ' {{{{{{{{{{')
          if (message.fileUrl) {
            // If fileUrl exists, create an anchor element to display the file content
            const fileLink = document.createElement('a');
            fileLink.href = message.fileUrl;
            fileLink.target = '_blank';
            fileLink.innerText = 'View File';
            messageElement.appendChild(fileLink);
          } else {
            // If no fileUrl, display the message content as text
            const contentElement = document.createElement('span');
            contentElement.classList.add('content');
            contentElement.innerText = message.message;
            messageElement.appendChild(contentElement);
          }
  
          chatWindow.appendChild(messageElement);
        });
      })
      .catch(error => {
        console.error("Error fetching messages:", error);
      });
  }

  displayMessages();


  
  const createGroupBtn = document.getElementById("create-group-btn");
  createGroupBtn.addEventListener("click", function(event) {
    event.preventDefault();
    createGroup();
  });


  function createGroup() {
    console.log('in the create group ')
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
      .post("http://16.171.121.124:4000/ChatApp/createGroup", data)
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
      .get("http://16.171.121.124:4000/ChatApp/displayGroups")
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
      .get(`http://16.171.121.124:4000/ChatApp/getMessage/${groupId}`, {
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

        localStorage.setItem('currentGroup', groupId);

      })
      .catch(error => {
        console.error("Error fetching group messages", error);
      });
  }


  const currentGroup = localStorage.getItem('currentGroup');
    console.log(currentGroup, 'jdcbdcddgcdksgcbdkc')
    if (!currentGroup || currentGroup == 'undefined') {
      displayMessages(); 
    }
    else {
      switchGroup(currentGroup); 
    }

  // groupId = " ";


function searchUser(query, groupId) {
  axios
    .get("http://16.171.121.124:4000/ChatApp/searchUser", {
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
      .post(`http://16.171.121.124:4000/ChatApp/addGroupMember/${groupId}/${userId}`, {
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



   const chatForm = document.getElementById("chat-form");
    chatForm.addEventListener("submit", function(event) {
      event.preventDefault(); 
      sendChatMessage(groupId); 
    });
  

  
    function makeMemberAdmin(groupId, memberId) {
    const userInfo = getUserInfoFromToken();
    const currentUserId = userInfo.userId;
    axios
      .put(`http://16.171.121.124:4000/ChatApp/makeAdmin/${groupId}/${memberId}`, {
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

    axios.get(`http://16.171.121.124:4000/ChatApp/groupMembers/${groupId}`)
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
    axios.delete(`http://16.171.121.124:4000/ChatApp/removeMember/${memberId}`)
      .then(response => {
        // console.log(response, ' response of remove member')
        getGroupMembers(groupId);
      })
      .catch(error => {
        console.error("Error removing member:", error);
      });
  }
  

  // function startMessageUpdate() {
  //   if (currentGroup) {
  //     console.log(currentGroup, 'in the start message group')
  //     setInterval(() => {
  //       switchGroup(groupId); // Fetch group messages at regular intervals
  //     }, 1000);
  //   } else {
  //     setInterval(() => {
  //       displayMessages(); // Fetch individual messages at regular intervals
  //     }, 1000);
  //   }
  // }
 

  
  function updateChatWindow() {
    const storedMessages = localStorage.getItem('messageList');
    const lastMessageId = storedMessages ? JSON.parse(storedMessages)[0]?.id : [];
  
    const userInfo = getUserInfoFromToken();
    const userId = userInfo.userId;
    
    axios.get('http://16.171.121.124:4000/ChatApp/getMessage', { 
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
  displayGroups();
  // startMessageUpdate()

  


});



  