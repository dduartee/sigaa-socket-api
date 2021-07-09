# sigaa-socket-api
Este projeto é a integração do socket.io com o modulo [sigaa-api](https://github.com/GeovaneSchmitz/sigaa-api). <br><br>
Este código é dependente de [sigaa-api](https://github.com/GeovaneSchmitz/sigaa-api), um crawler/web scraper do SIGAA.<br>
O SIGAA por ser um sistema sem codigo-fonte aberto, não é possivel garantir 100% de compatibilidade com cada usuario.<br>
Caso acontecer alguma incompatibilidade, crie um Issue, informando todos os passos.<br>
Pull Requests são bem vindos. <br>

## Eventos
### Login / Logout
#### Realiza login na api
```js
emit('user::login', {
  username: "usuario",
  password: "senha",
  token: "ey..." // caso tenha
});

on('user::login', (data) => {
    logado: true / false
});

```

#### Realiza Logoff no SIGAA
```js
emit('user::logoff', {
  token: "ey..." // obrigatório
})
```
Para realizar logoff de sessão basta fechar a conexão e caso queira recuperar a sessão informe o token pelo evento 'user::login'

#### Recebe status de login
```js
on('user::status', (data) => {
    "Logando"/"Logado"/"Deslogado"/"Deslogando"
});
```

### Eventos de JSON
#### Lista vinculos ATIVOS
```js
emit('bonds::list', {
  token: "ey...", // obrigatório
  inactive: true/false // retorna vinculos inativos ou não (EXPERIMENTAL)
})

on('bonds::list', (data) => {
  // dados json
})

```
#### Lista matérias de um vinculo
```js
emit('courses::list', {
  registration: "", // numero da matricula do vinculo, obrigatório
  inactive: true/false, // retorna vinculos inativos ou não (EXPERIMENTAL)
  token: "ey..." // obrigatório,
}
on('courses::list', (data) => {
   // dados json
})
```
#### Lista uma matéria especifica
```js
emit('courses::details', {
  code: "", // Código da matéria, obrigatório
  inactive: true/false, // retorna vinculos inativos ou não (EXPERIMENTAL)
  fullDetails: true / false, // quando true retorna todas as informações sendo mais devagar
  token: "ey..." // obrigatório
})
on('courses::details' (data) => {
  // dados json
})
```
#### Lista todas tarefas de um vinculo
```js
emit('homeworks::list', {
  registration: "", // numero da matricula do vinculo, obrigatório
  fullHW: true / false, // quando true retorna todas as informações sendo mais devagar, quando false retorna somente titulo e datas
  inactive: true/false, // retorna vinculos inativos ou não (EXPERIMENTAL)
  token: "ey..." // obrigatório
})
on('homeworks::list', (data) => {
   // dados json
})
```
#### Lista todas as tarefas de uma matéria
```js
emit('homeworks::specific', {
  code: "", // Código da matéria, obrigatório
  fullHW: true / false, // quando true retorna todas as informações sendo mais devagar, quando false retorna somente titulo e datas
  inactive: true/false, // retorna vinculos inativos ou não (EXPERIMENTAL)
  token: "ey..." // obrigatório
})
on('homeworks::specific', (data) => {
  // dados json
})
```

#### Lista todas as noticias de uma matéria
```js
emit('news::list', {
  code: "", // Código da matéria, obrigatório
  fullNews: true / false, // quando true retorna todas as informações sendo mais devagar, quando false retorna somente titulo e id sem datas
  inactive: true/false, // retorna vinculos inativos ou não (EXPERIMENTAL)
  token: "ey..." // obrigatório
})
on('news::list', (data) => {
  // dados json
})
```

```js
emit('grades::list', {
  code: "", // Código da matéria, obrigatório
  inactive: true/false, // retorna vinculos inativos ou não (EXPERIMENTAL)
  cache: true/false, // retorna dados em cache (caso tenha)
  token: "ey..." // obrigatório
})
on('grades::list', (data) => {
  // dados json
})
```

#### Recebe token após login
```js
on('auth::store', token => {
  // O token JWT pode ser armazenado de qualquer forma, desde que seja enviado a cada evento
});
emit('auth::valid', token => {
  // verifica a validação do token
})
```