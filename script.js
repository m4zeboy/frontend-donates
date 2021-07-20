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
    },
    reload() {
        this.init()
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

const Months = {
    container: document.querySelector('#months .month-buttons'),
    spanClose: document.querySelector("#months .minimize"),
    toggleContainer() {
        if(Months.container.classList[1] === "hide") {
            Months.spanClose.innerHTML = "Fechar"
            Months.container.classList.remove('hide')
        } else {
            Months.spanClose.innerHTML = "Abrir"
            Months.container.classList.add('hide')
        }
    }
}

const Donates = {
    all(month) {
        App.reload()
        axios.get(`https://donates-server.herokuapp.com/api/donates/${month}`, { headers: { Authorization: _Storage.getToken()}})
            .then((res) => {
                let data
                data = res.data;
                if (data.message) {
                    Table.tbody.innerHTML = "";
                    Table.tbody.innerHTML = `
                    <tr>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
            `
            ;
                    return Table.paragraph.innerHTML = "Não há doações nesse mês."
                } else {
                    Table.tbody.innerHTML = "";
                    Table.paragraph.innerHTML = `Aqui estão as doações do mês ${month}`
                    Table.renderTable(data)
                }

            })
            .catch((err) => {
                console.log(err)
            })
    }
}

const Table = {
    container: document.querySelector('section#data-table'),
    tableElement: document.querySelector('#data-table table'),
    tbody: document.querySelector('#data-table table tbody'),
    paragraph: document.querySelector('#data-table p'),
    renderTable(donates) {
        // Table.paragraph.innerHTML = `Resultados do mês ${month}`
        console.log(donates)
        donates.forEach(donate => {
            const tr = document.createElement('tr');
            // Render row
            tr.innerHTML = Table.renderRow(donate);
            Table.tbody.appendChild(tr)
        })
    }, 
    renderRow(donate) {
        return `
            <td>${donate.family}</td>
            <td>${donate.address}</td>
            <td>${donate.responsible}</td>
            <td>${donate.quantity}</td>
            <td>${donate.date}</td>
            `
    }
}


App.init()