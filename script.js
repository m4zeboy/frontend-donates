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

const Utils = {
    getMonth(monthNumber) {
        if(monthNumber === "01") return "Janeiro";
        if(monthNumber === "02") return "Fevereiro";
        if(monthNumber === "03") return "Março";
        if(monthNumber === "04") return "Abril";
        if(monthNumber === "05") return "Maio";
        if(monthNumber === "06") return "Junho";
        if(monthNumber === "07") return "Julho";
        if(monthNumber === "08") return "Agosto";
        if(monthNumber === "09") return "Setembro";
        if(monthNumber === "10") return "Outubro";
        if(monthNumber === "11") return "Novembro";
        if(monthNumber === "12") return "Dezembro";
    }
}

const Donates = {
    all(month) {
        Table.text.innerHTML = "Aguarde..."
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
                        <td>-</td>
                    </tr>
            `
            ;
                    return Table.text.innerHTML = "<p>Não há doações nesse mês.</p>"
                } else {
                    Table.tbody.innerHTML = "";
                    const formatedMonth = Utils.getMonth(month)
                    Table.text.innerHTML = `<h2>Aqui estão as doações do mês ${formatedMonth}<h2>`
                    Table.renderTable(data)
                }

            })
            .catch((err) => {
                console.log(err)
            })
    },
    add() {
        Donates.Modal.toggle()
    },
    Modal: {
        container: document.querySelector('#modal-add-donate'),
        toggle() {
            Donates.Modal.container.classList.toggle('active');
        }   
    }
}

const Table = {
    container: document.querySelector('section#data-table'),
    tableElement: document.querySelector('#data-table table'),
    tbody: document.querySelector('#data-table table tbody'),
    text: document.querySelector('#data-table span'),
    renderTable(donates) {
        // Table.paragraph.innerHTML = `Resultados do mês ${month}`
        console.log(donates)
        donates.forEach(donate => {
            const tr = document.createElement('tr');
            // Render row
            tr.dataset.index = donate.id;
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
            <td class="delete-donate"><img src="./assets/delete.svg"></td>
            `
    }
}



App.init()