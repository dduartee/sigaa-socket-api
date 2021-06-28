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
client.emit('user::login', {
  username: "usuario",
  password: "senha",
  token: "ey..." // caso tenha
});
```
#### Recebe token após login
```js
client.on('auth::store', token => {
  // O token JWT pode ser armazenado de qualquer forma, desde que seja enviado a cada evento
});
```
#### Realiza Logout no SIGAA
```js
client.emit('user::logoff', {
  token: "ey..." // obrigatório
})
```
Para realizar logoff se sessão basta fechar a conexão e caso queira recuperar a sessão informe o token pelo evento 'user::login'

#### Recebe status de login
```js
client.on('user::login', (data) => {
    logado: true / false
});
```

### Eventos de JSON
#### Lista vinculos ATIVOS
```js
client.emit('bonds::list', {
  token: "ey..." // obrigatório
})

client.on('bonds::list', (data) => {
  // dados json
})

```
#### Lista matérias de um vinculo
```js
client.emit('courses::list', {
  registration: "", // numero da matricula do vinculo, obrigatório
  token: "ey..." // obrigatório
}
client.on('courses::list', (data) => {
   // dados json
})
```
#### Lista uma matéria especifica
```js
client.emit('courses::specific', {
  code: "", // Código da matéria, obrigatório
  token: "ey..." // obrigatório
})
client.on('courses::specific' (data) => {
  // dados json
})
```
#### Lista todas tarefas de um vinculo
```js
client.emit('homeworks::list', {
  registration: "", // numero da matricula do vinculo, obrigatório
  fullHW: true / false, // quando true retorna todas as informações sendo mais devagar, quando false retorna somente titulo e datas
  token: "ey..." // obrigatório
})
client.on('homeworks::list', (data) => {
   // dados json
})
```
#### Lista todas as tarefas de uma matéria
```js
client.emit('homeworks::specific', {
  code: "", // Código da matéria, obrigatório
  fullHW: true / false, // quando true retorna todas as informações sendo mais devagar, quando false retorna somente titulo e datas
  token: "ey..." // obrigatório
})
client.on('homeworks::specific', (data) => {
  // dados json
})
```

#### Lista todas as noticias de uma matéria
```js
client.emit('news::specific', {
  code: "", // Código da matéria, obrigatório
  fullNews: true / false, // quando true retorna todas as informações sendo mais devagar, quando false retorna somente titulo e id sem datas
  token: "ey..." // obrigatório
})
client.on('news::specific', (data) => {
  // dados json
})
