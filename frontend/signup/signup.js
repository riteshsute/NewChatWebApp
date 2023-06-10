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
    console.log(obj);

    axios.post("http://localhost:4000/ChatApp/signup", obj)
    .then((response) => {
        console.log("in the signuo frontend ")
        if (response.data.message === "User already exists") {
            alert("User already exists");
        } else { 
            alert(response.data.message);
            window.location.href = "../login/login.html";
        }
    })
    .catch((error) => {
        console.log(error);
    });
}
