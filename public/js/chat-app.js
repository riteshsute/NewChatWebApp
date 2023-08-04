const socket=io('http://localhost:3000')

const exitChat = document.getElementById('exit-chat');
const sendMessage = document.getElementById('send-message');
const chatsCanStored = 1000;
const addGroup = document.getElementById('addGroup');
const searchUsers = document.getElementById('searchContacts');
const sendMedia = document.getElementById('send-media');
const message = document.getElementById('message-input');
const showGroups = document.getElementById('showMyGroups');
const addUsers = document.getElementById('addUsers');
const showGroupMembers = document.getElementById('showGroupMembers');

sendMessage.addEventListener('click', () => {
    if(message.value !== '') {
        postMessage();
    }else {
        const msg = `Can't send empty message`
        showErrorMsg(msg);
    }
});

async function postMessage() {
    try {

    const textMessage = message.value
    const groupdata = JSON.parse(localStorage.getItem('groupDetails')) || { id:null };
    const groupId = groupdata.id;
    
    const messageObj = {
        textMessage,
        groupId,
    }

    const token = localStorage.getItem('token');

    const response = await axios.post('http://localhost:3000/chats/send', 
    messageObj, { headers: {"Authorization": token }});
    
    showUsersChatsOnScreen(response.data.textMessage);
   
    socket.emit('send-message', response.data.textMessage);

    console.log('the message obj is ', response.data.textMessage);

    //Storing messages to local storage
    let usersChats = JSON.parse(localStorage.getItem('usersChats')) || [];
    usersChats.push(response.data.textMessage)
    let chats = usersChats.slice(usersChats.length - chatsCanStored);
    localStorage.setItem('usersChats', JSON.stringify(chats));

    if(response.status === 201) {
        message.value = '';
        sendMedia.value = '';
    }
    } catch(err) {
        console.log(err);
    }
}

sendMedia.addEventListener('input', uploadFile)

async function uploadFile(e) {
    try {
        const token = localStorage.getItem('token');
        const groupDetails = JSON.parse(localStorage.getItem('groupDetails'));
        const groupId = groupDetails.id;
        const file = e.target.files[0];
        const form = new FormData();
        form.append('userFile', file);
        
        const response = await axios.post(`http://localhost:3000/files/file/${groupId}`, form,
        {headers:{'Authorization':token ,'Content-Type': 'multipart/form-data'}})
        
        const fileData = response.data.files;
        showUsersChatsOnScreen(response.data.files)
        socket.emit('send-message', response.data.files);

        console.log('the file obj is ', fileData);
        
        // Storing media file url to local storage
        let usersChats = JSON.parse(localStorage.getItem('usersChats')) || [];
        usersChats.push(response.data.files)
        let chats = usersChats.slice(usersChats.length - chatsCanStored);
        localStorage.setItem('usersChats', JSON.stringify(chats));
    } catch(err) {
        console.log(err);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {

    const usersChats = JSON.parse(localStorage.getItem('usersChats')) || [];
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails')) || { id: null, name: 'Chat App'}
    const groupId = groupDetails.id;
    socket.emit('joined-group', groupId)
    
    if(groupDetails.id === null) {
        document.getElementById('message-input').disabled = true;
        document.getElementById('send-message').disabled = true;
        document.getElementById('showPreviousMsg').style.textAlign = 'center';
        const textNode = document.createTextNode(`Please Create a New Group to Start Conversation`)
        document.getElementById('showPreviousMsg').append(textNode)
        document.getElementById('send-media').disabled = true;
    }

    if(groupDetails.id != null) {
        getUserMsgs(groupDetails.id);
    }

    usersChats.forEach(chats => {
        if(groupDetails.id === chats.groupId) {
            showUsersChatsOnScreen(chats)
        }
    })

    socket.on('received-message', messages => {
        console.log('socket message obj is', messages);
        showUsersChatsOnScreen(messages)

        // Storing received messages to local storage
        usersChats.push(messages)
        let chats = usersChats.slice(usersChats.length - chatsCanStored);
        localStorage.setItem('usersChats', JSON.stringify(chats));
    })

    showGroupName(groupDetails.name)
    showUserName();
    } catch(err) {
        console.log(err);
    }
})

const getUserMsgs = (groupId) => {
    try {
        const showPrevMsgs = document.getElementById('showPreviousMsg')
        showPrevMsgs.style.textAlign = 'center';
        const button = document.createElement('button');
        showPrevMsgs.append(button)
        button.innerHTML = `Show Previous messages`;
        button.className = 'button-18';
        button.onclick = async () => {
            //Getting messages from get req
            const response = await axios.get(`http://localhost:3000/chats/Messages/${groupId}`,)
            let lastestChats = response.data.textMessages
            // Storing Previous all messages in local storage
            if(response.status === 202) {
                localStorage.setItem('usersChats', JSON.stringify(lastestChats));
                window.location.reload();
                showPrevMsgs.remove()
            }
            if(response.status === 201) {
                alert(response.data.message)
                showPrevMsgs.remove()
            }
        }
    } catch(err) {
        console.log(err);
        alert(err.response.data.err)
    }
}

function showUsersChatsOnScreen(chats) {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);
    
    const ul = document.getElementById('userMessage');
    ul.style.textAlign = 'center';

    const li = document.createElement('li');
    li.className = 'sent';
    const p = document.createElement('p');
    li.append(p)

    if(isValidURL(chats.message)) {
        p.innerHTML = `${chats.sender} : <img src="${chats.message}" alt="${chats.sender}">`
    }else {
        p.textContent = `${chats.sender} : ${chats.message}`;
    }

    if(chats.userId === decodeToken.userId) {
        if(isValidURL(chats.message)) {
            p.innerHTML = `you : <img src="${chats.message}" alt="${chats.sender}">`
        }else {
            p.textContent = `you : ${chats.message}`;
        }
    }

    ul.append(li);
}

const showNotificationOnScreen = (name) => {
    const ul = document.getElementById('newMessages');
    ul.style.textAlign = 'center';

    const p = document.createElement('p');
    p.style.fontFamily = 'bold'
    p.textContent = `${name} is connected`;

    ul.append(p);
}

addGroup.addEventListener('click', () => {
    window.location.href = '../views/create-group.html'
})

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

showGroups.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:3000/group/groups', { headers: {"Authorization": token }});
    const usersGroups = res.data.groupsList
    const userGroup = res.data.userGroup
    showGroupsListTitle();
    for(let i=0, j=0; i<usersGroups.length, j<userGroup.length; i++,j++) {
        showGroupsOnScreen(usersGroups[i], userGroup[j])
    }
})

showGroupMembers.addEventListener('click', async () => {
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'))
    showGroupUserListTitle()
    const res = await axios.get(`http://localhost:3000/group/members/${groupDetails.id}`);
    const listOfGroupMembers = res.data.usersDetails
    const userGroupDetails = res.data.userGroup; 
    for(let i=0, j=0; i<listOfGroupMembers.length, j<userGroupDetails.length; i++,j++) {
        showGroupUsersOnScreen(listOfGroupMembers[i], userGroupDetails[j])
    }
})

addUsers.addEventListener('click', async() => {
    const res = await axios.get('http://localhost:3000/user/users');
    const listUsers = res.data.listOfUsers;
    showUserListTitle();
    listUsers.forEach(users => {
        showUsersOnScreen(users)
    })
});

const showGroupsOnScreen = (groups, userGroup) => {
    const groupLists = document.getElementById('groupLists');

    const li = document.createElement('li');
    li.className = 'contact';
    
    li.addEventListener('click', async() => {
        localStorage.setItem('groupDetails',JSON.stringify(groups));
        window.location.reload();
        localStorage.setItem('isAdmin', JSON.stringify(userGroup.isAdmin)); 
    })

    const div = document.createElement('div');
    div.className = 'wrap';
    li.append(div);

    const p = document.createElement('p');
    p.textContent = groups.name;
    p.id = groups.id;

    div.append(p)
    groupLists.append(li)
}

const showUsersOnScreen = (users) => {

    const token = localStorage.getItem('token');
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const decodeToken = parseJwt(token);

    if(users.id !== decodeToken.userId) {
        const userLists1 = document.getElementById('userLists');//userLists

        const li = document.createElement('li');
        li.className = 'contact';
    
        const div = document.createElement('div');
        div.className = 'wrap';
        li.append(div);
    
        const p = document.createElement('p');
        p.textContent = users.name;

        // document.getElementById('search').hidden = false;
    
        const groupData = JSON.parse(localStorage.getItem('groupDetails'));
        if(groupData) {
            if(isAdmin) {
            const button = document.createElement('input');
            button.value = 'Add to Your group';
            button.className = 'button-33'
            button.type = 'button';
            p.append(button)
    
            const groupId = groupData.id;
            const toUserId = users.id;
            if(groupData.id) {
            button.addEventListener('click', async() => {
                try {
                    const addUserToGroup = await axios.post(`http://localhost:3000/group/add/${toUserId}/${groupId}`)
                    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'));
                    if(Number(addUserToGroup.data.userGroup.userId) === users.id) {
                        alert(`You successfully added ${users.name} to ${groupDetails.name}`)
                    }
                } catch(err) {
                    console.log(err);
                    alert(`${users.name} is already in your Group`)
                }
            })
            }
        }
        }
        div.append(p)
        userLists1.append(li)
    }
}

const showGroupUsersOnScreen = (users, userGroup) => {
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'))
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);

    const userLists1 = document.getElementById('userLists');

    const li = document.createElement('li');
    li.className = 'contact';

    const div = document.createElement('div');
    div.className = 'wrap';
    li.append(div);

    const p = document.createElement('p');
    p.textContent = users.name;

    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const removeUser = document.createElement('button');
    removeUser.className = 'button-45'
    const makeAdmin = document.createElement('button');
    makeAdmin.className = 'button-29'
    const leaveGroup = document.createElement('button')
    leaveGroup.className = 'button-62'

    if(userGroup.isAdmin) {
        p.textContent = users.name + ' Group Admin'
        p.style.color = 'black';
    }

    if(users.id === decodeToken.userId) {
        leaveGroup.innerHTML = `Leave`;
        p.append(leaveGroup)
        const userGroupId = userGroup.id;
        leaveUserGroup(leaveGroup, userGroupId, li);
    }

    if(isAdmin) {

    removeUser.innerHTML = `remove`;
    makeAdmin.innerHTML = `Make Admin`
    p.append(removeUser)
    p.append(makeAdmin)

    if(users.id === decodeToken.userId) {
        removeUser.remove()
        makeAdmin.remove()
    }

    if(userGroup.isAdmin) {
        removeUser.remove()
        makeAdmin.remove()
    }
        
    removeUser.addEventListener('click', async() => {
        const userGroupId = userGroup.id;
        const res = await axios.delete(`http://localhost:3000/group/remove/${userGroupId}`); 
        if(res.status === 200) {
            li.remove();
            alert(`You Successfully removed ${users.name} from ${groupDetails.name}`)
        }
    })

    makeAdmin.addEventListener('click', async() => {
        const userGroupId = userGroup.id;
        const res = await axios.post(`http://localhost:3000/group/admin/${userGroupId}`); 
        if(res.status === 202) {
            makeAdmin.remove();
            removeUser.remove();
            alert(`You Successfully Made ${users.name} Admin of ${groupDetails.name}`)
        }
    })
    }
    
    div.append(p)
    userLists1.append(li)
}

const leaveUserGroup = (leaveGroup, userGroupId, li) => {
    const groupDetails = JSON.parse(localStorage.getItem('groupDetails'))
    leaveGroup.addEventListener('click',async() => {
        const res = await axios.delete(`http://localhost:3000/group/remove/${userGroupId}`);
        if(res.status === 200) {
            li.remove();
            alert(`You Successfully leaved ${groupDetails.name}`)
            localStorage.removeItem('groupDetails');
            window.location.reload();
        }
    })
}

const showGroupsListTitle = () => {
    const contacts = document.getElementById('contacts')
    const userLists = document.createElement('ul');
    userLists.id = 'groupLists';
    const userListsLi = document.createElement('li');
    userListsLi.className = 'contact';
    userLists.append(userListsLi);
    const userListsDiv = document.createElement('div');
    userListsDiv.className = 'wrap';
    userListsLi.append(userListsDiv);
    const userListH3 = document.createElement('h3');
    userListsDiv.append(userListH3)
    userListH3.style.fontWeight = 'bold';
    userListH3.textContent = `My Groups`;
    const closebtn = document.createElement('button');
    userListH3.append(closebtn)
    closebtn.innerHTML = 'close';
    closebtn.className = 'button-17'
    contacts.append(userLists)
    closebtn.addEventListener('click', () => {
        userLists.remove();
    })
}

const showUserListTitle = () => {
    const contacts = document.getElementById('contacts')
    const userLists = document.createElement('ul');
    userLists.id = 'userLists';
    const userListsLi = document.createElement('li');
    userListsLi.className = 'contact';
    userLists.append(userListsLi);
    const userListsDiv = document.createElement('div');
    userListsDiv.className = 'wrap';
    userListsLi.append(userListsDiv);
    const userListH3 = document.createElement('h3');
    userListsDiv.append(userListH3)
    userListH3.style.fontWeight = 'bold';
    userListH3.textContent = `List of Contacts`;
    userListH3.id = 'userListTitle'
    const closebtn = document.createElement('button');
    userListH3.append(closebtn)
    closebtn.innerHTML = 'close';
    closebtn.className = 'button-17'
    contacts.append(userLists)
    closebtn.addEventListener('click', () => {
        userLists.remove();
        // document.getElementById('search').hidden = true;
    })
}

const showGroupUserListTitle = () => {
    const contacts = document.getElementById('contacts')
    const userLists = document.createElement('ul');
    userLists.id = 'userLists';
    const userListsLi = document.createElement('li');
    userListsLi.className = 'contact';
    userLists.append(userListsLi);
    const userListsDiv = document.createElement('div');
    userListsDiv.className = 'wrap';
    userListsLi.append(userListsDiv);
    const userListH3 = document.createElement('h3');
    userListsDiv.append(userListH3)
    userListH3.style.fontWeight = 'bold';
    userListH3.textContent = `Group Members`;
    userListH3.id = 'userListTitle'
    const closebtn = document.createElement('button');
    userListH3.append(closebtn)
    closebtn.innerHTML = 'close';
    closebtn.className = 'button-17'
    contacts.append(userLists)
    closebtn.onclick = () => {
        userLists.remove();
    }
}

const showGroupName = (groupName) => {
    const boxName = document.getElementById('boxName');
    boxName.textContent = `${groupName}`;
}

const showUserName = (status) => {
    const adminStatus = JSON.parse(localStorage.getItem('isAdmin'));
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);
    const userName = document.getElementById('userName');
    if(adminStatus) {
        userName.textContent = `${decodeToken.name} Group Admin`
    }else {
        userName.textContent = `${decodeToken.name} Group User`
    }
}

function isValidURL(str) {
    if(/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(str)) {
        //  console.log('YES');
         return true;
     } else {
        //  console.log('NO');
         return false;
     }
}

exitChat.onclick = () => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You want to exit",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, exit!'
    }).then((result) => {
        if (result.value) {
            Swal.fire(
                window.location.href = '../views/login.html',
                localStorage.removeItem('groupDetails'),
                localStorage.removeItem('isAdmin'),
            )
        }
    })
}

function showErrorMsg(errorMsg) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMsg
    })
}