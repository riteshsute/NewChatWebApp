function loginUser(event) {
    event.preventDefault();
    // location.reload();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const obj = {
        email,
        password
    };
    console.log(obj)

    axios.post("http://localhost:4000/ChatApp/login", obj)
    .then((response) => {
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        alert(response.data.message);
        window.location.href = "../message/message.html"
        
    })
    .catch((error) => {
        alert('Password is Incorrect');
        console.log(JSON.stringify(error));
        // alert('User Not Found')
    }); 
}