// async function teste() {
//     const resonse = await axios.get('https://donates-server.herokuapp.com/api/donates')
//     const data = response.data;
//     console.log(data)
// }

// teste()
const Login = {
    nameInput: document.querySelector('#name'),
    passInput: document.querySelector('#password'),
    handleLogin(event) {
        event.preventDefault()
    }

}

Login.nameInput.addEventListener('change', (event) => {
    if (Login.nameInput.value.length !== 0) {
        Login.passInput.disabled = false
    } else {
        Login.passInput.disabled = true
    }
})
