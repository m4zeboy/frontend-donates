const App = {
    container: document.querySelector('div#app'),
    display() {
        if (_Storage.getToken() !== null || _Storage.getToken() !== undefined) {
            App.container.classList.add('active')
        }
    },
    init() {
        const token = _Storage.getToken();
        if (token) {
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
    handleLogin: async event => {
        event.preventDefault()
        const credentials = {
            name: Login.nameInput.value,
            password: Login.passInput.value
        }
        const { name, password } = credentials;
        Login.button.innerHTML = "<div class='load'><div>"

        axios.post('https://donates-server.herokuapp.com/api/auth/login', { name, password })
            .then((res) => {
                const token = res.data.token
                _Storage.setToken(token)
                Login.container.classList.remove('active')
                App.display()


            })
            .catch((err) => {
                const message = err.response.data.message;
                Login.span.classList.add('active');

                console.log(message)
                if (message === "Name and password are required") {
                    const translatedMessage = "Informe nome e senha"
                    Login.span.innerHTML = `<p>${translatedMessage}</p>`
                    Login.button.innerHTML = "Tente Novamente"

                }
                if (message === "Invalid Credentials") {
                    const translatedMessage = "Credenciais inválidas."
                    Login.span.innerHTML = `<p>${translatedMessage}</p>`
                    Login.button.innerHTML = "Tente Novamente"
                }

                setTimeout(() => {
                    Login.span.innerHTML = ``
                    Login.span.classList.remove('active')
                }, 3000)

            })
    }

}

const url = "https://donates-server.herokuapp.com/api"
const API = axios.create({
    baseURL: 'https://donates-server.herokuapp.com/api/',
    timeout: 10000000000,
    headers: { 'Authorization': _Storage.getToken() }
})

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
        if (Months.container.classList[1] === "hide") {
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
        if (monthNumber === "01") return "Janeiro";
        if (monthNumber === "02") return "Fevereiro";
        if (monthNumber === "03") return "Março";
        if (monthNumber === "04") return "Abril";
        if (monthNumber === "05") return "Maio";
        if (monthNumber === "06") return "Junho";
        if (monthNumber === "07") return "Julho";
        if (monthNumber === "08") return "Agosto";
        if (monthNumber === "09") return "Setembro";
        if (monthNumber === "10") return "Outubro";
        if (monthNumber === "11") return "Novembro";
        if (monthNumber === "12") return "Dezembro";
    },
    formatDate(date) {
        // 2021-06-30
        const splitedDate = date.split('-');
        // [2021, 06, 30] : [ano, mes, dia];
        const formatedDate = `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
        return formatedDate;
    },
    getMonthOfDonateAdded(formatedDate) {
        const splitedDate = formatedDate.split('/');
        // [dia, mes, ano]
        const month = splitedDate[1];
        return month;
    }
}

const Donates = {
    all(month) {
        Table.text.innerHTML = "<div class='load green'><div>"
        // axios.get(`https://donates-server.herokuapp.com/api/donates/${month}`, { headers: { Authorization: _Storage.getToken()}})
        API.get(`/donates/${month}`)
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
    showModal() {
        Donates.Modal.toggle()
    },
    add(event) {
        event.preventDefault();
        const { familyInput, addressInput, responsibleInput, quantityInput, dateInput } = Donates.Form;
        const inputValuesIsEmpty = Donates.Form.verifyIfValuesIsEmpty()
        if (inputValuesIsEmpty) {
            Donates.Form.error.classList.add('active')
            Donates.Form.error.innerHTML = "Preencha todos os campos"

            setTimeout(() => {
                Donates.Form.error.innerHTML = ``
                Donates.Form.error.classList.remove('active')
            }, 3000)
        } else {
            const formatedDate = Utils.formatDate(dateInput.value)
            const monthOfDonate = Utils.getMonthOfDonateAdded(formatedDate)
            // const token = _Storage.getToken()
            const data = {
                family: familyInput.value,
                address: addressInput.value,
                responsible: responsibleInput.value,
                quantity: quantityInput.value,
                date: formatedDate,
            }
            API.post('/donates', data)
                .then((response) => {
                    console.log(response.data.message)
                    Donates.Form.resetValues();
                    Donates.Modal.container.classList.remove('active')
                    Donates.Form.success.classList.add('active')
                    Donates.Form.success.innerHTML = "Doação Salva"

                    setTimeout(() => {
                        Donates.Form.success.innerHTML = ``
                        Donates.Form.success.classList.remove('active')
                    }, 3000)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
      
   


    },
    Modal: {
        container: document.querySelector('#modal-add-donate'),
        toggle() {
            Donates.Modal.container.classList.toggle('active');
        }
    },
    Form: {
        familyInput: document.querySelector('input#family'),
        addressInput: document.querySelector('input#address'),
        responsibleInput: document.querySelector('input#responsible'),
        quantityInput: document.querySelector('input#quantity'),
        dateInput: document.querySelector('input#date'),
        error: document.querySelector('#add-donate-form span.error'),
        success: document.querySelector('span.success'),
        verifyIfValuesIsEmpty() {
            if (this.familyInput.value.length === 0 ||
                this.addressInput.value.length === 0 ||
                this.responsibleInput.value.length === 0 ||
                this.quantityInput.value.length === 0 ||
                this.dateInput.value.length === 0) {
                return true
            } else return false
        },
        resetValues() {
            Donates.Form.familyInput.value = ""
            Donates.Form.addressInput.value = ""
            Donates.Form.responsibleInput.value = ""
            Donates.Form.quantityInput.value = ""
            Donates.Form.dateInput.value = ""
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
            <td class="options"><img src="./assets/delete.svg" title="Excluir essa doação"><img src="./assets/edit.svg" title="Editar essa doação"></td>
            `
    }
}



App.init()