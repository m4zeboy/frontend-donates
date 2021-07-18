const App = {
    container: document.querySelector('div#app'),
    display() {
        if (_Storage.getToken() !== null || _Storage.getToken() !== undefined) {
            App.container.classList.add('active')
        }
    },
    init() {
        const token = _Storage.getToken();
        if(token) {
            App.container.classList.add('active')
            Login.container.classList.remove('active')
        } else {
            Login.container.classList.add('active')
            App.container.classList.remove('active')
        }
    }
}

const _Storage = {
    setToken(token) {
        sessionStorage.setItem('token', token)
    },
    getToken() {
        return sessionStorage.getItem('token')
    }
}

const Login = {
    nameInput: document.querySelector('#name'),
    passInput: document.querySelector('#password'),
    container: document.querySelector('#authentication'),
    span: document.querySelector('#authentication span.error'),
    button: document.querySelector('#authentication button'),
    async handleLogin(event) {
        event.preventDefault()
        const credentials = {
            name: Login.nameInput.value,
            password: Login.passInput.value
        }

        Login.button.innerHTML = "Aguarde"

        axios.post('https://donates-server.herokuapp.com/api/auth/login', { name: credentials.name, password: credentials.password }).then((res) => {
            const token = res.data.token
            _Storage.setToken(token)
            Login.container.classList.remove('active')
            App.display()

            
        }).catch((err) => {
            const message = err.response.data.message;
            Login.span.classList.add('active'), 3000
            
            console.log(message)
            if (message === "Name and password are required") {
                const translatedMessage = "Informe nome e senha"
                Login.span.innerHTML = `<p>${translatedMessage}</p>`
            }
            if (message === "Invalid Credentials") {
                const translatedMessage = "Credenciais inválidas."
                Login.span.innerHTML = `<p>${translatedMessage}</p>`
            }

            setTimeout(() => {
                Login.span.innerHTML = ``
                Login.span.classList.remove('active')
            },3000)
            
        })
    }

}

Login.nameInput.addEventListener('change', (event) => {
    if (Login.nameInput.value.length !== 0) {
        Login.passInput.disabled = false
    } else {
        Login.passInput.disabled = true
    }
})

const Donates = {
    all(month) {
        axios.get(`https://donates-server.herokuapp.com/api/donates/${month}`, { headers: { Authorization: _Storage.getToken()}})
            .then((res) => {
                const data = res.data;
                if (res.data.message === "There are no donates this month.") return Table.container.innerHTML = "Não há doações nesse mês."
                else {
                    // Renderizar tabela
                }
            })
            .catch((err) => {
                console.log(err.response.data.message)
            })
    }
}

const Table = {
    container: document.querySelector('section#data-table'),
}


App.init()