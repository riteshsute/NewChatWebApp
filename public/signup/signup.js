function signUpUser(event) {
    event.preventDefault();
    const name = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const phonenumber = event.target.phonenumber.value;

    const obj = {
        name,
        email,
        password,
        phonenumber
    };

    axios.post("http://16.171.121.124:4000/ChatApp/signup", obj)
    .then((response) => {
        if (response.data.message === "User already exists") {
            alert("User already exists");
        } else { 
            alert(response.data.message);
            window.location.href = '../login/login.html';
        }
    })
    .catch((error) => {
        console.log(error);
    });
}
