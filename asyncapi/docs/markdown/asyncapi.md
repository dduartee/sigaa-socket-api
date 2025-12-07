# SIGAA Socket API 1.0.20 documentation

* License: [MIT](https://github.com/dduartee/sigaa-socket-api/blob/main/LICENSE)
* Default content type: [application/json](https://www.iana.org/assignments/media-types/application/json)
* Support: [Gabriel Kleemann Duarte](https://github.com/dduartee/sigaa-socket-api)

API WebSocket para integração com o sistema SIGAA (Sistema Integrado de Gestão de Atividades Acadêmicas).
Documentação modularizada usando $ref para facilitar manutenção.


## Table of Contents

* [Servers](#servers)
  * [production](#production-server)
  * [development](#development-server)
* [Operations](#operations)
  * [REPLY auth::valid](#reply-authvalid-operation)
  * [REPLY user::login](#reply-userlogin-operation)
  * [REPLY user::info](#reply-userinfo-operation)
  * [RECEIVE user::logoff](#receive-userlogoff-operation)
  * [SEND user::status](#send-userstatus-operation)
  * [REPLY bonds::list](#reply-bondslist-operation)
  * [REPLY courses::list](#reply-courseslist-operation)
  * [REPLY grades::list](#reply-gradeslist-operation)
  * [REPLY activities::list](#reply-activitieslist-operation)
  * [REPLY absences::list](#reply-absenceslist-operation)
  * [REPLY homework::content](#reply-homeworkcontent-operation)
  * [REPLY lessons::list](#reply-lessonslist-operation)
  * [REPLY news::list](#reply-newslist-operation)
  * [REPLY syllabus::content](#reply-syllabuscontent-operation)
  * [REPLY institutions::list](#reply-institutionslist-operation)
  * [SEND api::error](#send-apierror-operation)

## Servers

### `production` Server

* URL: `ws://{host}:{port}/`
* Protocol: `ws`

Servidor WebSocket de produção

#### URL Variables

| Name | Description | Default value | Allowed values |
|---|---|---|---|
| host | - | `localhost` | _Any_ |
| port | - | `5000` | _Any_ |

##### Server tags

| Name | Description | Documentation |
|---|---|---|
| production | - | - |


### `development` Server

* URL: `ws://{host}:{port}/`
* Protocol: `ws`

Servidor WebSocket de desenvolvimento

#### URL Variables

| Name | Description | Default value | Allowed values |
|---|---|---|---|
| host | - | `localhost` | _Any_ |
| port | - | `5000` | _Any_ |

##### Server tags

| Name | Description | Documentation |
|---|---|---|
| development | - | - |


## Operations

### REPLY `auth::valid` Operation

*Valida token JWT*

* Operation ID: `validateAuth`

Canal para validação de token JWT

Recebe requisição para validar token de autenticação JWT

#### Message Validação de Autenticação `AuthValidRequest`

*Requisição para validar token JWT*

* Message ID: `AuthValidRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Requisição para validar token JWT | - | - | **additional properties are allowed** |
| token | string | Token JWT a ser validado | - | - | **required** |

> Examples of payload _(generated)_

```json
{
  "token": "string"
}
```


#### Response information

* reply will be provided via this designated address: `auth::valid`
#### Message Resposta de Validação `AuthValidResponse`

*Resposta da validação de token*

* Message ID: `AuthValidResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Resposta da validação de token | - | - | **additional properties are allowed** |
| valid | boolean | Indica se o token é válido | - | - | - |
| uniqueID | string | ID único do usuário se o token for válido | - | - | - |

> Examples of payload _(generated)_

```json
{
  "valid": true,
  "uniqueID": "string"
}
```




### REPLY `user::login` Operation

*Autentica usuário*

* Operation ID: `loginUser`

Canal para autenticação de usuário no SIGAA

Recebe credenciais e autentica usuário no SIGAA

#### Message Requisição de Login `UserLoginRequest`

*Credenciais para autenticação no SIGAA*

* Message ID: `UserLoginRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros de autenticação no SIGAA | - | - | **additional properties are allowed** |
| username | string | Nome de usuário | - | - | **required** |
| password | string | Senha do usuário | - | - | - |
| institution | string | Acrônimo da instituição (ex. IFSC, UnB) | - | - | **required** |

> Examples of payload _(generated)_

```json
{
  "username": "string",
  "password": "string",
  "institution": "string"
}
```


#### Response information

* reply will be provided via this designated address: `user::login`
#### Message Resposta de Login `UserLoginResponse`

*Resultado da tentativa de autenticação*

* Message ID: `UserLoginResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Resultado da tentativa de autenticação | - | - | **additional properties are allowed** |
| logado | boolean | Indica se o login foi bem-sucedido | - | - | **required** |
| error | string | Mensagem de erro caso o login falhe | - | - | - |

> Examples of payload _(generated)_

```json
{
  "logado": true,
  "error": "string"
}
```




### REPLY `user::info` Operation

*Obtém informações do usuário*

* Operation ID: `getUserInfo`

Canal para obter informações do usuário autenticado

Recebe requisição para obter dados do usuário autenticado

#### Message Requisição Vazia `EmptyRequest`

*Mensagem de requisição sem payload*

* Message ID: `EmptyRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Payload vazio | - | - | **additional properties are allowed** |

> Examples of payload _(generated)_

```json
{}
```


#### Response information

* reply will be provided via this designated address: `user::info`
#### Message Informações do Usuário `UserInfoResponse`

*Dados completos do usuário autenticado*

* Message ID: `UserInfoResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Informações completas do estudante | - | - | **additional properties are allowed** |
| username | string | Nome de usuário | - | - | - |
| fullName | string | Nome completo | - | - | - |
| emails | array&lt;string&gt; | Lista de e-mails | - | - | - |
| emails (single item) | string | - | - | - | - |
| profilePictureURL | string | URL da foto de perfil | - | - | - |
| bonds | array&lt;object&gt; | Vínculos acadêmicos | - | - | - |
| bonds.program | string | Nome do programa/curso | - | - | - |
| bonds.registration | string | Número de matrícula | - | - | - |
| bonds.type | string | Tipo de vínculo | - | - | - |
| bonds.sequence | integer | Sequência do vínculo | - | - | - |
| bonds.active | boolean | Indica se o vínculo está ativo | - | - | - |
| bonds.period | string | Período letivo atual | - | - | - |
| bonds.activities | array&lt;object&gt; | Atividades pendentes | - | - | - |
| bonds.activities.id | string | ID da atividade | - | - | - |
| bonds.activities.title | string | Título da atividade | - | - | - |
| bonds.activities.type | string | Tipo de atividade | allowed (`"exam"`, `"homework"`, `"quiz"`) | - | - |
| bonds.activities.date | string | Data da atividade | - | format (`date-time`) | - |
| bonds.activities.done | boolean | Indica se foi concluída | - | - | - |
| bonds.activities.course | object | Disciplina relacionada | - | - | **additional properties are allowed** |
| bonds.activities.course.title | string | - | - | - | - |
| bonds.courses | array&lt;object&gt; | Disciplinas do vínculo | - | - | - |
| bonds.courses.id | string | ID único da disciplina | - | - | - |
| bonds.courses.title | string | Nome da disciplina | - | - | - |
| bonds.courses.code | string | Código da disciplina | - | - | - |
| bonds.courses.schedule | string | Horário das aulas | - | - | - |
| bonds.courses.period | string | Período letivo | - | - | - |
| bonds.courses.numberOfStudents | integer | Número de alunos matriculados | - | - | - |
| bonds.courses.postValues | string | Valores de formulário para requisições | - | - | - |
| bonds.courses.grades | array&lt;object&gt; | Grupos de notas | - | - | - |
| bonds.courses.grades.type | string | Tipo de cálculo das notas | allowed (`"sum-of-grades"`, `"only-average"`, `"weighted-average"`, `"arithmetic-average"`) | - | - |
| bonds.courses.grades.value | number | Valor da nota final | - | - | - |
| bonds.courses.grades.name | string | Nome do grupo de notas | - | - | - |
| bonds.courses.grades.subGrades | array&lt;object&gt; | Subnotas que compõem o grupo | - | - | - |
| bonds.courses.grades.subGrades.name | string | Nome da avaliação | - | - | - |
| bonds.courses.grades.subGrades.value | number | Nota obtida | - | - | - |
| bonds.courses.grades.subGrades.maxValue | number | Nota máxima possível | - | - | - |
| bonds.courses.grades.subGrades.weight | number | Peso da avaliação | - | - | - |
| bonds.courses.news | array&lt;object&gt; | Notícias da disciplina | - | - | - |
| bonds.courses.news.id | string | ID da notícia | - | - | - |
| bonds.courses.news.title | string | Título da notícia | - | - | - |
| bonds.courses.news.date | string | Data de publicação | - | format (`date-time`) | - |
| bonds.courses.news.content | string | Conteúdo completo | - | - | - |
| bonds.courses.homeworks | array&lt;object&gt; | Tarefas da disciplina | - | - | - |
| bonds.courses.homeworks.id | string | ID da tarefa | - | - | - |
| bonds.courses.homeworks.title | string | Título da tarefa | - | - | - |
| bonds.courses.homeworks.content | string | Descrição/conteúdo da tarefa | - | - | - |
| bonds.courses.homeworks.startDate | string | Data de início | - | format (`date-time`) | - |
| bonds.courses.homeworks.endDate | string | Data de entrega | - | format (`date-time`) | - |
| bonds.courses.homeworks.haveGrade | boolean | Indica se possui nota | - | - | - |
| bonds.courses.homeworks.isGroup | boolean | Indica se é em grupo | - | - | - |
| bonds.courses.homeworks.attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| bonds.courses.homeworks.attachment.name | string | Nome do arquivo | - | - | - |
| bonds.courses.homeworks.attachment.url | string | URL para download | - | format (`uri`) | - |
| bonds.courses.homeworks.attachment.size | integer | Tamanho em bytes | - | - | - |
| bonds.courses.homeworks.attachment.type | string | Tipo MIME do arquivo | - | - | - |
| bonds.courses.absences | object | Registro de faltas de uma disciplina | - | - | **additional properties are allowed** |
| bonds.courses.absences.list | array&lt;object&gt; | Lista de faltas por data | - | - | - |
| bonds.courses.absences.list.date | string | Data da falta | - | format (`date-time`) | - |
| bonds.courses.absences.list.numOfAbsences | integer | Número de faltas | - | - | - |
| bonds.courses.absences.total | integer | Total de faltas | - | - | - |
| bonds.courses.absences.max | integer | Máximo de faltas permitidas | - | - | - |
| bonds.courses.lessons | array&lt;object&gt; | Aulas da disciplina | - | - | - |
| bonds.courses.lessons.id | string | ID da aula | - | - | - |
| bonds.courses.lessons.title | string | Título da aula | - | - | - |
| bonds.courses.lessons.content | string | Conteúdo textual | - | - | - |
| bonds.courses.lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| bonds.courses.lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| bonds.courses.lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| bonds.courses.lessons.attachments.id | string | ID do anexo | - | - | - |
| bonds.courses.lessons.attachments.title | string | Título do anexo | - | - | - |
| bonds.courses.lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| bonds.courses.lessons.attachments.description | string | Descrição do anexo | - | - | - |
| bonds.courses.syllabus | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| bonds.courses.syllabus.methods | string | Metodologia de ensino | - | - | - |
| bonds.courses.syllabus.assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| bonds.courses.syllabus.attendanceSchedule | string | Horário de atendimento | - | - | - |
| bonds.courses.syllabus.schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| bonds.courses.syllabus.schedule.description | string | Descrição do conteúdo | - | - | - |
| bonds.courses.syllabus.schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| bonds.courses.syllabus.schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| bonds.courses.syllabus.exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| bonds.courses.syllabus.exams.description | string | Descrição da avaliação | - | - | - |
| bonds.courses.syllabus.exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| bonds.courses.syllabus.references | object | - | - | - | **additional properties are allowed** |
| bonds.courses.syllabus.references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| bonds.courses.syllabus.references.basic.type | string | - | - | - | - |
| bonds.courses.syllabus.references.basic.description | string | - | - | - | - |
| bonds.courses.syllabus.references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| bonds.courses.syllabus.references.supplementary.type | string | - | - | - | - |
| bonds.courses.syllabus.references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "username": "string",
  "fullName": "string",
  "emails": [
    "string"
  ],
  "profilePictureURL": "string",
  "bonds": [
    {
      "program": "string",
      "registration": "string",
      "type": "string",
      "sequence": 0,
      "active": true,
      "period": "string",
      "activities": [
        {
          "id": "string",
          "title": "string",
          "type": "exam",
          "date": "2019-08-24T14:15:22Z",
          "done": true,
          "course": {
            "title": "string"
          }
        }
      ],
      "courses": [
        {
          "id": "string",
          "title": "string",
          "code": "string",
          "schedule": "string",
          "period": "string",
          "numberOfStudents": 0,
          "postValues": "string",
          "grades": [
            {
              "type": "sum-of-grades",
              "value": 0,
              "name": "string",
              "subGrades": [
                {
                  "name": "string",
                  "value": 0,
                  "maxValue": 0,
                  "weight": 0
                }
              ]
            }
          ],
          "news": [
            {
              "id": "string",
              "title": "string",
              "date": "2019-08-24T14:15:22Z",
              "content": "string"
            }
          ],
          "homeworks": [
            {
              "id": "string",
              "title": "string",
              "content": "string",
              "startDate": "2019-08-24T14:15:22Z",
              "endDate": "2019-08-24T14:15:22Z",
              "haveGrade": true,
              "isGroup": true,
              "attachment": {
                "name": "string",
                "url": "http://example.com",
                "size": 0,
                "type": "string"
              }
            }
          ],
          "absences": {
            "list": [
              {
                "date": "2019-08-24T14:15:22Z",
                "numOfAbsences": 0
              }
            ],
            "total": 0,
            "max": 0
          },
          "lessons": [
            {
              "id": "string",
              "title": "string",
              "content": "string",
              "startDate": "2019-08-24T14:15:22Z",
              "endDate": "2019-08-24T14:15:22Z",
              "attachments": [
                {
                  "id": "string",
                  "title": "string",
                  "type": "file",
                  "description": "string"
                }
              ]
            }
          ],
          "syllabus": {
            "methods": "string",
            "assessmentProcedures": "string",
            "attendanceSchedule": "string",
            "schedule": [
              {
                "description": "string",
                "startDate": "2019-08-24T14:15:22Z",
                "endDate": "2019-08-24T14:15:22Z"
              }
            ],
            "exams": [
              {
                "description": "string",
                "date": "2019-08-24T14:15:22Z"
              }
            ],
            "references": {
              "basic": [
                {
                  "type": "string",
                  "description": "string"
                }
              ],
              "supplementary": [
                {
                  "type": "string",
                  "description": "string"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```




### RECEIVE `user::logoff` Operation

*Encerra sessão*

* Operation ID: `logoffUser`

Canal para encerrar sessão do usuário

Encerra a sessão do usuário autenticado

#### Message Requisição Vazia `EmptyRequest`

*Mensagem de requisição sem payload*

* Message ID: `EmptyRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Payload vazio | - | - | **additional properties are allowed** |

> Examples of payload _(generated)_

```json
{}
```



### SEND `user::status` Operation

*Envia status do usuário*

* Operation ID: `sendUserStatus`

Canal para receber atualizações de status do usuário

Envia atualizações sobre o status de autenticação do usuário

#### Message Atualização de Status `UserStatusUpdate`

*Status atual da autenticação do usuário*

* Message ID: `UserStatusUpdate`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Status atual do usuário | - | - | **additional properties are allowed** |
| status | string | Status da autenticação | allowed (`"Logando"`, `"Logado"`, `"Deslogado"`) | - | - |

> Examples of payload _(generated)_

```json
{
  "status": "Logando"
}
```



### REPLY `bonds::list` Operation

*Lista vínculos*

* Operation ID: `getBondsList`

Canal para listar vínculos acadêmicos do usuário

Recebe requisição para listar todos os vínculos acadêmicos do usuário

#### Message Requisição de Vínculos `BondsListRequest`

*Parâmetros para listagem de vínculos*

* Message ID: `BondsListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de vínculos | - | - | **additional properties are allowed** |
| inactive | boolean | Incluir vínculos inativos | - | - | - |
| cache | boolean | Usar cache se disponível | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "inactive": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `bonds::list`
#### Message Lista de Vínculos `BondsListResponse`

*Array de vínculos acadêmicos*

* Message ID: `BondsListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Resposta contendo lista de vínculos | - | - | **additional properties are allowed** |
| bonds | array&lt;object&gt; | - | - | - | - |
| bonds.program | string | Nome do programa/curso | - | - | - |
| bonds.registration | string | Número de matrícula | - | - | - |
| bonds.type | string | Tipo de vínculo | - | - | - |
| bonds.sequence | integer | Sequência do vínculo | - | - | - |
| bonds.active | boolean | Indica se o vínculo está ativo | - | - | - |
| bonds.period | string | Período letivo atual | - | - | - |
| bonds.activities | array&lt;object&gt; | Atividades pendentes | - | - | - |
| bonds.activities.id | string | ID da atividade | - | - | - |
| bonds.activities.title | string | Título da atividade | - | - | - |
| bonds.activities.type | string | Tipo de atividade | allowed (`"exam"`, `"homework"`, `"quiz"`) | - | - |
| bonds.activities.date | string | Data da atividade | - | format (`date-time`) | - |
| bonds.activities.done | boolean | Indica se foi concluída | - | - | - |
| bonds.activities.course | object | Disciplina relacionada | - | - | **additional properties are allowed** |
| bonds.activities.course.title | string | - | - | - | - |
| bonds.courses | array&lt;object&gt; | Disciplinas do vínculo | - | - | - |
| bonds.courses.id | string | ID único da disciplina | - | - | - |
| bonds.courses.title | string | Nome da disciplina | - | - | - |
| bonds.courses.code | string | Código da disciplina | - | - | - |
| bonds.courses.schedule | string | Horário das aulas | - | - | - |
| bonds.courses.period | string | Período letivo | - | - | - |
| bonds.courses.numberOfStudents | integer | Número de alunos matriculados | - | - | - |
| bonds.courses.postValues | string | Valores de formulário para requisições | - | - | - |
| bonds.courses.grades | array&lt;object&gt; | Grupos de notas | - | - | - |
| bonds.courses.grades.type | string | Tipo de cálculo das notas | allowed (`"sum-of-grades"`, `"only-average"`, `"weighted-average"`, `"arithmetic-average"`) | - | - |
| bonds.courses.grades.value | number | Valor da nota final | - | - | - |
| bonds.courses.grades.name | string | Nome do grupo de notas | - | - | - |
| bonds.courses.grades.subGrades | array&lt;object&gt; | Subnotas que compõem o grupo | - | - | - |
| bonds.courses.grades.subGrades.name | string | Nome da avaliação | - | - | - |
| bonds.courses.grades.subGrades.value | number | Nota obtida | - | - | - |
| bonds.courses.grades.subGrades.maxValue | number | Nota máxima possível | - | - | - |
| bonds.courses.grades.subGrades.weight | number | Peso da avaliação | - | - | - |
| bonds.courses.news | array&lt;object&gt; | Notícias da disciplina | - | - | - |
| bonds.courses.news.id | string | ID da notícia | - | - | - |
| bonds.courses.news.title | string | Título da notícia | - | - | - |
| bonds.courses.news.date | string | Data de publicação | - | format (`date-time`) | - |
| bonds.courses.news.content | string | Conteúdo completo | - | - | - |
| bonds.courses.homeworks | array&lt;object&gt; | Tarefas da disciplina | - | - | - |
| bonds.courses.homeworks.id | string | ID da tarefa | - | - | - |
| bonds.courses.homeworks.title | string | Título da tarefa | - | - | - |
| bonds.courses.homeworks.content | string | Descrição/conteúdo da tarefa | - | - | - |
| bonds.courses.homeworks.startDate | string | Data de início | - | format (`date-time`) | - |
| bonds.courses.homeworks.endDate | string | Data de entrega | - | format (`date-time`) | - |
| bonds.courses.homeworks.haveGrade | boolean | Indica se possui nota | - | - | - |
| bonds.courses.homeworks.isGroup | boolean | Indica se é em grupo | - | - | - |
| bonds.courses.homeworks.attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| bonds.courses.homeworks.attachment.name | string | Nome do arquivo | - | - | - |
| bonds.courses.homeworks.attachment.url | string | URL para download | - | format (`uri`) | - |
| bonds.courses.homeworks.attachment.size | integer | Tamanho em bytes | - | - | - |
| bonds.courses.homeworks.attachment.type | string | Tipo MIME do arquivo | - | - | - |
| bonds.courses.absences | object | Registro de faltas de uma disciplina | - | - | **additional properties are allowed** |
| bonds.courses.absences.list | array&lt;object&gt; | Lista de faltas por data | - | - | - |
| bonds.courses.absences.list.date | string | Data da falta | - | format (`date-time`) | - |
| bonds.courses.absences.list.numOfAbsences | integer | Número de faltas | - | - | - |
| bonds.courses.absences.total | integer | Total de faltas | - | - | - |
| bonds.courses.absences.max | integer | Máximo de faltas permitidas | - | - | - |
| bonds.courses.lessons | array&lt;object&gt; | Aulas da disciplina | - | - | - |
| bonds.courses.lessons.id | string | ID da aula | - | - | - |
| bonds.courses.lessons.title | string | Título da aula | - | - | - |
| bonds.courses.lessons.content | string | Conteúdo textual | - | - | - |
| bonds.courses.lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| bonds.courses.lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| bonds.courses.lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| bonds.courses.lessons.attachments.id | string | ID do anexo | - | - | - |
| bonds.courses.lessons.attachments.title | string | Título do anexo | - | - | - |
| bonds.courses.lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| bonds.courses.lessons.attachments.description | string | Descrição do anexo | - | - | - |
| bonds.courses.syllabus | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| bonds.courses.syllabus.methods | string | Metodologia de ensino | - | - | - |
| bonds.courses.syllabus.assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| bonds.courses.syllabus.attendanceSchedule | string | Horário de atendimento | - | - | - |
| bonds.courses.syllabus.schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| bonds.courses.syllabus.schedule.description | string | Descrição do conteúdo | - | - | - |
| bonds.courses.syllabus.schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| bonds.courses.syllabus.schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| bonds.courses.syllabus.exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| bonds.courses.syllabus.exams.description | string | Descrição da avaliação | - | - | - |
| bonds.courses.syllabus.exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| bonds.courses.syllabus.references | object | - | - | - | **additional properties are allowed** |
| bonds.courses.syllabus.references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| bonds.courses.syllabus.references.basic.type | string | - | - | - | - |
| bonds.courses.syllabus.references.basic.description | string | - | - | - | - |
| bonds.courses.syllabus.references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| bonds.courses.syllabus.references.supplementary.type | string | - | - | - | - |
| bonds.courses.syllabus.references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "bonds": [
    {
      "program": "string",
      "registration": "string",
      "type": "string",
      "sequence": 0,
      "active": true,
      "period": "string",
      "activities": [
        {
          "id": "string",
          "title": "string",
          "type": "exam",
          "date": "2019-08-24T14:15:22Z",
          "done": true,
          "course": {
            "title": "string"
          }
        }
      ],
      "courses": [
        {
          "id": "string",
          "title": "string",
          "code": "string",
          "schedule": "string",
          "period": "string",
          "numberOfStudents": 0,
          "postValues": "string",
          "grades": [
            {
              "type": "sum-of-grades",
              "value": 0,
              "name": "string",
              "subGrades": [
                {
                  "name": "string",
                  "value": 0,
                  "maxValue": 0,
                  "weight": 0
                }
              ]
            }
          ],
          "news": [
            {
              "id": "string",
              "title": "string",
              "date": "2019-08-24T14:15:22Z",
              "content": "string"
            }
          ],
          "homeworks": [
            {
              "id": "string",
              "title": "string",
              "content": "string",
              "startDate": "2019-08-24T14:15:22Z",
              "endDate": "2019-08-24T14:15:22Z",
              "haveGrade": true,
              "isGroup": true,
              "attachment": {
                "name": "string",
                "url": "http://example.com",
                "size": 0,
                "type": "string"
              }
            }
          ],
          "absences": {
            "list": [
              {
                "date": "2019-08-24T14:15:22Z",
                "numOfAbsences": 0
              }
            ],
            "total": 0,
            "max": 0
          },
          "lessons": [
            {
              "id": "string",
              "title": "string",
              "content": "string",
              "startDate": "2019-08-24T14:15:22Z",
              "endDate": "2019-08-24T14:15:22Z",
              "attachments": [
                {
                  "id": "string",
                  "title": "string",
                  "type": "file",
                  "description": "string"
                }
              ]
            }
          ],
          "syllabus": {
            "methods": "string",
            "assessmentProcedures": "string",
            "attendanceSchedule": "string",
            "schedule": [
              {
                "description": "string",
                "startDate": "2019-08-24T14:15:22Z",
                "endDate": "2019-08-24T14:15:22Z"
              }
            ],
            "exams": [
              {
                "description": "string",
                "date": "2019-08-24T14:15:22Z"
              }
            ],
            "references": {
              "basic": [
                {
                  "type": "string",
                  "description": "string"
                }
              ],
              "supplementary": [
                {
                  "type": "string",
                  "description": "string"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```




### REPLY `courses::list` Operation

*Lista disciplinas*

* Operation ID: `getCoursesList`

Canal para listar cursos/disciplinas de um vínculo

Recebe requisição para listar disciplinas de um vínculo específico

#### Message Requisição de Disciplinas `CoursesListRequest`

*Parâmetros para listagem de disciplinas*

* Message ID: `CoursesListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de disciplinas | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| inactive | boolean | Incluir disciplinas inativas | - | - | - |
| allPeriods | boolean | Incluir todos os períodos | - | - | - |
| cache | boolean | Usar cache se disponível | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "inactive": false,
  "allPeriods": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `courses::list`
#### Message Vínculo com Disciplinas `CoursesListResponse`

*Vínculo contendo lista de disciplinas*

* Message ID: `CoursesListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Vínculo acadêmico do estudante | - | - | **additional properties are allowed** |
| program | string | Nome do programa/curso | - | - | - |
| registration | string | Número de matrícula | - | - | - |
| type | string | Tipo de vínculo | - | - | - |
| sequence | integer | Sequência do vínculo | - | - | - |
| active | boolean | Indica se o vínculo está ativo | - | - | - |
| period | string | Período letivo atual | - | - | - |
| activities | array&lt;object&gt; | Atividades pendentes | - | - | - |
| activities.id | string | ID da atividade | - | - | - |
| activities.title | string | Título da atividade | - | - | - |
| activities.type | string | Tipo de atividade | allowed (`"exam"`, `"homework"`, `"quiz"`) | - | - |
| activities.date | string | Data da atividade | - | format (`date-time`) | - |
| activities.done | boolean | Indica se foi concluída | - | - | - |
| activities.course | object | Disciplina relacionada | - | - | **additional properties are allowed** |
| activities.course.title | string | - | - | - | - |
| courses | array&lt;object&gt; | Disciplinas do vínculo | - | - | - |
| courses.id | string | ID único da disciplina | - | - | - |
| courses.title | string | Nome da disciplina | - | - | - |
| courses.code | string | Código da disciplina | - | - | - |
| courses.schedule | string | Horário das aulas | - | - | - |
| courses.period | string | Período letivo | - | - | - |
| courses.numberOfStudents | integer | Número de alunos matriculados | - | - | - |
| courses.postValues | string | Valores de formulário para requisições | - | - | - |
| courses.grades | array&lt;object&gt; | Grupos de notas | - | - | - |
| courses.grades.type | string | Tipo de cálculo das notas | allowed (`"sum-of-grades"`, `"only-average"`, `"weighted-average"`, `"arithmetic-average"`) | - | - |
| courses.grades.value | number | Valor da nota final | - | - | - |
| courses.grades.name | string | Nome do grupo de notas | - | - | - |
| courses.grades.subGrades | array&lt;object&gt; | Subnotas que compõem o grupo | - | - | - |
| courses.grades.subGrades.name | string | Nome da avaliação | - | - | - |
| courses.grades.subGrades.value | number | Nota obtida | - | - | - |
| courses.grades.subGrades.maxValue | number | Nota máxima possível | - | - | - |
| courses.grades.subGrades.weight | number | Peso da avaliação | - | - | - |
| courses.news | array&lt;object&gt; | Notícias da disciplina | - | - | - |
| courses.news.id | string | ID da notícia | - | - | - |
| courses.news.title | string | Título da notícia | - | - | - |
| courses.news.date | string | Data de publicação | - | format (`date-time`) | - |
| courses.news.content | string | Conteúdo completo | - | - | - |
| courses.homeworks | array&lt;object&gt; | Tarefas da disciplina | - | - | - |
| courses.homeworks.id | string | ID da tarefa | - | - | - |
| courses.homeworks.title | string | Título da tarefa | - | - | - |
| courses.homeworks.content | string | Descrição/conteúdo da tarefa | - | - | - |
| courses.homeworks.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.homeworks.endDate | string | Data de entrega | - | format (`date-time`) | - |
| courses.homeworks.haveGrade | boolean | Indica se possui nota | - | - | - |
| courses.homeworks.isGroup | boolean | Indica se é em grupo | - | - | - |
| courses.homeworks.attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| courses.homeworks.attachment.name | string | Nome do arquivo | - | - | - |
| courses.homeworks.attachment.url | string | URL para download | - | format (`uri`) | - |
| courses.homeworks.attachment.size | integer | Tamanho em bytes | - | - | - |
| courses.homeworks.attachment.type | string | Tipo MIME do arquivo | - | - | - |
| courses.absences | object | Registro de faltas de uma disciplina | - | - | **additional properties are allowed** |
| courses.absences.list | array&lt;object&gt; | Lista de faltas por data | - | - | - |
| courses.absences.list.date | string | Data da falta | - | format (`date-time`) | - |
| courses.absences.list.numOfAbsences | integer | Número de faltas | - | - | - |
| courses.absences.total | integer | Total de faltas | - | - | - |
| courses.absences.max | integer | Máximo de faltas permitidas | - | - | - |
| courses.lessons | array&lt;object&gt; | Aulas da disciplina | - | - | - |
| courses.lessons.id | string | ID da aula | - | - | - |
| courses.lessons.title | string | Título da aula | - | - | - |
| courses.lessons.content | string | Conteúdo textual | - | - | - |
| courses.lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| courses.lessons.attachments.id | string | ID do anexo | - | - | - |
| courses.lessons.attachments.title | string | Título do anexo | - | - | - |
| courses.lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| courses.lessons.attachments.description | string | Descrição do anexo | - | - | - |
| courses.syllabus | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| courses.syllabus.methods | string | Metodologia de ensino | - | - | - |
| courses.syllabus.assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| courses.syllabus.attendanceSchedule | string | Horário de atendimento | - | - | - |
| courses.syllabus.schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| courses.syllabus.schedule.description | string | Descrição do conteúdo | - | - | - |
| courses.syllabus.schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.syllabus.schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.syllabus.exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| courses.syllabus.exams.description | string | Descrição da avaliação | - | - | - |
| courses.syllabus.exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| courses.syllabus.references | object | - | - | - | **additional properties are allowed** |
| courses.syllabus.references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| courses.syllabus.references.basic.type | string | - | - | - | - |
| courses.syllabus.references.basic.description | string | - | - | - | - |
| courses.syllabus.references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| courses.syllabus.references.supplementary.type | string | - | - | - | - |
| courses.syllabus.references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "program": "string",
  "registration": "string",
  "type": "string",
  "sequence": 0,
  "active": true,
  "period": "string",
  "activities": [
    {
      "id": "string",
      "title": "string",
      "type": "exam",
      "date": "2019-08-24T14:15:22Z",
      "done": true,
      "course": {
        "title": "string"
      }
    }
  ],
  "courses": [
    {
      "id": "string",
      "title": "string",
      "code": "string",
      "schedule": "string",
      "period": "string",
      "numberOfStudents": 0,
      "postValues": "string",
      "grades": [
        {
          "type": "sum-of-grades",
          "value": 0,
          "name": "string",
          "subGrades": [
            {
              "name": "string",
              "value": 0,
              "maxValue": 0,
              "weight": 0
            }
          ]
        }
      ],
      "news": [
        {
          "id": "string",
          "title": "string",
          "date": "2019-08-24T14:15:22Z",
          "content": "string"
        }
      ],
      "homeworks": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "haveGrade": true,
          "isGroup": true,
          "attachment": {
            "name": "string",
            "url": "http://example.com",
            "size": 0,
            "type": "string"
          }
        }
      ],
      "absences": {
        "list": [
          {
            "date": "2019-08-24T14:15:22Z",
            "numOfAbsences": 0
          }
        ],
        "total": 0,
        "max": 0
      },
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "attachments": [
            {
              "id": "string",
              "title": "string",
              "type": "file",
              "description": "string"
            }
          ]
        }
      ],
      "syllabus": {
        "methods": "string",
        "assessmentProcedures": "string",
        "attendanceSchedule": "string",
        "schedule": [
          {
            "description": "string",
            "startDate": "2019-08-24T14:15:22Z",
            "endDate": "2019-08-24T14:15:22Z"
          }
        ],
        "exams": [
          {
            "description": "string",
            "date": "2019-08-24T14:15:22Z"
          }
        ],
        "references": {
          "basic": [
            {
              "type": "string",
              "description": "string"
            }
          ],
          "supplementary": [
            {
              "type": "string",
              "description": "string"
            }
          ]
        }
      }
    }
  ]
}
```




### REPLY `grades::list` Operation

*Lista notas*

* Operation ID: `getGradesList`

Canal para listar notas de um vínculo

Recebe requisição para listar notas de todas as disciplinas de um vínculo

#### Message Requisição de Notas `GradesListRequest`

*Parâmetros para listagem de notas*

* Message ID: `GradesListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de notas | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| inactive | boolean | Incluir disciplinas inativas | - | - | - |
| allPeriods | boolean | Incluir todos os períodos | - | - | - |
| cache | boolean | Usar cache se disponível | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "inactive": false,
  "allPeriods": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `grades::list`
#### Message Vínculo com Notas `GradesListResponse`

*Vínculo contendo notas de todas as disciplinas*

* Message ID: `GradesListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Vínculo acadêmico do estudante | - | - | **additional properties are allowed** |
| program | string | Nome do programa/curso | - | - | - |
| registration | string | Número de matrícula | - | - | - |
| type | string | Tipo de vínculo | - | - | - |
| sequence | integer | Sequência do vínculo | - | - | - |
| active | boolean | Indica se o vínculo está ativo | - | - | - |
| period | string | Período letivo atual | - | - | - |
| activities | array&lt;object&gt; | Atividades pendentes | - | - | - |
| activities.id | string | ID da atividade | - | - | - |
| activities.title | string | Título da atividade | - | - | - |
| activities.type | string | Tipo de atividade | allowed (`"exam"`, `"homework"`, `"quiz"`) | - | - |
| activities.date | string | Data da atividade | - | format (`date-time`) | - |
| activities.done | boolean | Indica se foi concluída | - | - | - |
| activities.course | object | Disciplina relacionada | - | - | **additional properties are allowed** |
| activities.course.title | string | - | - | - | - |
| courses | array&lt;object&gt; | Disciplinas do vínculo | - | - | - |
| courses.id | string | ID único da disciplina | - | - | - |
| courses.title | string | Nome da disciplina | - | - | - |
| courses.code | string | Código da disciplina | - | - | - |
| courses.schedule | string | Horário das aulas | - | - | - |
| courses.period | string | Período letivo | - | - | - |
| courses.numberOfStudents | integer | Número de alunos matriculados | - | - | - |
| courses.postValues | string | Valores de formulário para requisições | - | - | - |
| courses.grades | array&lt;object&gt; | Grupos de notas | - | - | - |
| courses.grades.type | string | Tipo de cálculo das notas | allowed (`"sum-of-grades"`, `"only-average"`, `"weighted-average"`, `"arithmetic-average"`) | - | - |
| courses.grades.value | number | Valor da nota final | - | - | - |
| courses.grades.name | string | Nome do grupo de notas | - | - | - |
| courses.grades.subGrades | array&lt;object&gt; | Subnotas que compõem o grupo | - | - | - |
| courses.grades.subGrades.name | string | Nome da avaliação | - | - | - |
| courses.grades.subGrades.value | number | Nota obtida | - | - | - |
| courses.grades.subGrades.maxValue | number | Nota máxima possível | - | - | - |
| courses.grades.subGrades.weight | number | Peso da avaliação | - | - | - |
| courses.news | array&lt;object&gt; | Notícias da disciplina | - | - | - |
| courses.news.id | string | ID da notícia | - | - | - |
| courses.news.title | string | Título da notícia | - | - | - |
| courses.news.date | string | Data de publicação | - | format (`date-time`) | - |
| courses.news.content | string | Conteúdo completo | - | - | - |
| courses.homeworks | array&lt;object&gt; | Tarefas da disciplina | - | - | - |
| courses.homeworks.id | string | ID da tarefa | - | - | - |
| courses.homeworks.title | string | Título da tarefa | - | - | - |
| courses.homeworks.content | string | Descrição/conteúdo da tarefa | - | - | - |
| courses.homeworks.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.homeworks.endDate | string | Data de entrega | - | format (`date-time`) | - |
| courses.homeworks.haveGrade | boolean | Indica se possui nota | - | - | - |
| courses.homeworks.isGroup | boolean | Indica se é em grupo | - | - | - |
| courses.homeworks.attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| courses.homeworks.attachment.name | string | Nome do arquivo | - | - | - |
| courses.homeworks.attachment.url | string | URL para download | - | format (`uri`) | - |
| courses.homeworks.attachment.size | integer | Tamanho em bytes | - | - | - |
| courses.homeworks.attachment.type | string | Tipo MIME do arquivo | - | - | - |
| courses.absences | object | Registro de faltas de uma disciplina | - | - | **additional properties are allowed** |
| courses.absences.list | array&lt;object&gt; | Lista de faltas por data | - | - | - |
| courses.absences.list.date | string | Data da falta | - | format (`date-time`) | - |
| courses.absences.list.numOfAbsences | integer | Número de faltas | - | - | - |
| courses.absences.total | integer | Total de faltas | - | - | - |
| courses.absences.max | integer | Máximo de faltas permitidas | - | - | - |
| courses.lessons | array&lt;object&gt; | Aulas da disciplina | - | - | - |
| courses.lessons.id | string | ID da aula | - | - | - |
| courses.lessons.title | string | Título da aula | - | - | - |
| courses.lessons.content | string | Conteúdo textual | - | - | - |
| courses.lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| courses.lessons.attachments.id | string | ID do anexo | - | - | - |
| courses.lessons.attachments.title | string | Título do anexo | - | - | - |
| courses.lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| courses.lessons.attachments.description | string | Descrição do anexo | - | - | - |
| courses.syllabus | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| courses.syllabus.methods | string | Metodologia de ensino | - | - | - |
| courses.syllabus.assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| courses.syllabus.attendanceSchedule | string | Horário de atendimento | - | - | - |
| courses.syllabus.schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| courses.syllabus.schedule.description | string | Descrição do conteúdo | - | - | - |
| courses.syllabus.schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.syllabus.schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.syllabus.exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| courses.syllabus.exams.description | string | Descrição da avaliação | - | - | - |
| courses.syllabus.exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| courses.syllabus.references | object | - | - | - | **additional properties are allowed** |
| courses.syllabus.references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| courses.syllabus.references.basic.type | string | - | - | - | - |
| courses.syllabus.references.basic.description | string | - | - | - | - |
| courses.syllabus.references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| courses.syllabus.references.supplementary.type | string | - | - | - | - |
| courses.syllabus.references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "program": "string",
  "registration": "string",
  "type": "string",
  "sequence": 0,
  "active": true,
  "period": "string",
  "activities": [
    {
      "id": "string",
      "title": "string",
      "type": "exam",
      "date": "2019-08-24T14:15:22Z",
      "done": true,
      "course": {
        "title": "string"
      }
    }
  ],
  "courses": [
    {
      "id": "string",
      "title": "string",
      "code": "string",
      "schedule": "string",
      "period": "string",
      "numberOfStudents": 0,
      "postValues": "string",
      "grades": [
        {
          "type": "sum-of-grades",
          "value": 0,
          "name": "string",
          "subGrades": [
            {
              "name": "string",
              "value": 0,
              "maxValue": 0,
              "weight": 0
            }
          ]
        }
      ],
      "news": [
        {
          "id": "string",
          "title": "string",
          "date": "2019-08-24T14:15:22Z",
          "content": "string"
        }
      ],
      "homeworks": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "haveGrade": true,
          "isGroup": true,
          "attachment": {
            "name": "string",
            "url": "http://example.com",
            "size": 0,
            "type": "string"
          }
        }
      ],
      "absences": {
        "list": [
          {
            "date": "2019-08-24T14:15:22Z",
            "numOfAbsences": 0
          }
        ],
        "total": 0,
        "max": 0
      },
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "attachments": [
            {
              "id": "string",
              "title": "string",
              "type": "file",
              "description": "string"
            }
          ]
        }
      ],
      "syllabus": {
        "methods": "string",
        "assessmentProcedures": "string",
        "attendanceSchedule": "string",
        "schedule": [
          {
            "description": "string",
            "startDate": "2019-08-24T14:15:22Z",
            "endDate": "2019-08-24T14:15:22Z"
          }
        ],
        "exams": [
          {
            "description": "string",
            "date": "2019-08-24T14:15:22Z"
          }
        ],
        "references": {
          "basic": [
            {
              "type": "string",
              "description": "string"
            }
          ],
          "supplementary": [
            {
              "type": "string",
              "description": "string"
            }
          ]
        }
      }
    }
  ]
}
```




### REPLY `activities::list` Operation

*Lista atividades*

* Operation ID: `getActivitiesList`

Canal para listar atividades pendentes de um vínculo

Recebe requisição para listar atividades pendentes de um vínculo

#### Message Requisição de Atividades `ActivitiesListRequest`

*Parâmetros para listagem de atividades*

* Message ID: `ActivitiesListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de atividades | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| inactive | boolean | Incluir atividades antigas | - | - | - |
| cache | boolean | Usar cache se disponível | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "inactive": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `activities::list`
#### Message Vínculo com Atividades `ActivitiesListResponse`

*Vínculo contendo lista de atividades pendentes*

* Message ID: `ActivitiesListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Vínculo acadêmico do estudante | - | - | **additional properties are allowed** |
| program | string | Nome do programa/curso | - | - | - |
| registration | string | Número de matrícula | - | - | - |
| type | string | Tipo de vínculo | - | - | - |
| sequence | integer | Sequência do vínculo | - | - | - |
| active | boolean | Indica se o vínculo está ativo | - | - | - |
| period | string | Período letivo atual | - | - | - |
| activities | array&lt;object&gt; | Atividades pendentes | - | - | - |
| activities.id | string | ID da atividade | - | - | - |
| activities.title | string | Título da atividade | - | - | - |
| activities.type | string | Tipo de atividade | allowed (`"exam"`, `"homework"`, `"quiz"`) | - | - |
| activities.date | string | Data da atividade | - | format (`date-time`) | - |
| activities.done | boolean | Indica se foi concluída | - | - | - |
| activities.course | object | Disciplina relacionada | - | - | **additional properties are allowed** |
| activities.course.title | string | - | - | - | - |
| courses | array&lt;object&gt; | Disciplinas do vínculo | - | - | - |
| courses.id | string | ID único da disciplina | - | - | - |
| courses.title | string | Nome da disciplina | - | - | - |
| courses.code | string | Código da disciplina | - | - | - |
| courses.schedule | string | Horário das aulas | - | - | - |
| courses.period | string | Período letivo | - | - | - |
| courses.numberOfStudents | integer | Número de alunos matriculados | - | - | - |
| courses.postValues | string | Valores de formulário para requisições | - | - | - |
| courses.grades | array&lt;object&gt; | Grupos de notas | - | - | - |
| courses.grades.type | string | Tipo de cálculo das notas | allowed (`"sum-of-grades"`, `"only-average"`, `"weighted-average"`, `"arithmetic-average"`) | - | - |
| courses.grades.value | number | Valor da nota final | - | - | - |
| courses.grades.name | string | Nome do grupo de notas | - | - | - |
| courses.grades.subGrades | array&lt;object&gt; | Subnotas que compõem o grupo | - | - | - |
| courses.grades.subGrades.name | string | Nome da avaliação | - | - | - |
| courses.grades.subGrades.value | number | Nota obtida | - | - | - |
| courses.grades.subGrades.maxValue | number | Nota máxima possível | - | - | - |
| courses.grades.subGrades.weight | number | Peso da avaliação | - | - | - |
| courses.news | array&lt;object&gt; | Notícias da disciplina | - | - | - |
| courses.news.id | string | ID da notícia | - | - | - |
| courses.news.title | string | Título da notícia | - | - | - |
| courses.news.date | string | Data de publicação | - | format (`date-time`) | - |
| courses.news.content | string | Conteúdo completo | - | - | - |
| courses.homeworks | array&lt;object&gt; | Tarefas da disciplina | - | - | - |
| courses.homeworks.id | string | ID da tarefa | - | - | - |
| courses.homeworks.title | string | Título da tarefa | - | - | - |
| courses.homeworks.content | string | Descrição/conteúdo da tarefa | - | - | - |
| courses.homeworks.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.homeworks.endDate | string | Data de entrega | - | format (`date-time`) | - |
| courses.homeworks.haveGrade | boolean | Indica se possui nota | - | - | - |
| courses.homeworks.isGroup | boolean | Indica se é em grupo | - | - | - |
| courses.homeworks.attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| courses.homeworks.attachment.name | string | Nome do arquivo | - | - | - |
| courses.homeworks.attachment.url | string | URL para download | - | format (`uri`) | - |
| courses.homeworks.attachment.size | integer | Tamanho em bytes | - | - | - |
| courses.homeworks.attachment.type | string | Tipo MIME do arquivo | - | - | - |
| courses.absences | object | Registro de faltas de uma disciplina | - | - | **additional properties are allowed** |
| courses.absences.list | array&lt;object&gt; | Lista de faltas por data | - | - | - |
| courses.absences.list.date | string | Data da falta | - | format (`date-time`) | - |
| courses.absences.list.numOfAbsences | integer | Número de faltas | - | - | - |
| courses.absences.total | integer | Total de faltas | - | - | - |
| courses.absences.max | integer | Máximo de faltas permitidas | - | - | - |
| courses.lessons | array&lt;object&gt; | Aulas da disciplina | - | - | - |
| courses.lessons.id | string | ID da aula | - | - | - |
| courses.lessons.title | string | Título da aula | - | - | - |
| courses.lessons.content | string | Conteúdo textual | - | - | - |
| courses.lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| courses.lessons.attachments.id | string | ID do anexo | - | - | - |
| courses.lessons.attachments.title | string | Título do anexo | - | - | - |
| courses.lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| courses.lessons.attachments.description | string | Descrição do anexo | - | - | - |
| courses.syllabus | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| courses.syllabus.methods | string | Metodologia de ensino | - | - | - |
| courses.syllabus.assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| courses.syllabus.attendanceSchedule | string | Horário de atendimento | - | - | - |
| courses.syllabus.schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| courses.syllabus.schedule.description | string | Descrição do conteúdo | - | - | - |
| courses.syllabus.schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.syllabus.schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.syllabus.exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| courses.syllabus.exams.description | string | Descrição da avaliação | - | - | - |
| courses.syllabus.exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| courses.syllabus.references | object | - | - | - | **additional properties are allowed** |
| courses.syllabus.references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| courses.syllabus.references.basic.type | string | - | - | - | - |
| courses.syllabus.references.basic.description | string | - | - | - | - |
| courses.syllabus.references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| courses.syllabus.references.supplementary.type | string | - | - | - | - |
| courses.syllabus.references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "program": "string",
  "registration": "string",
  "type": "string",
  "sequence": 0,
  "active": true,
  "period": "string",
  "activities": [
    {
      "id": "string",
      "title": "string",
      "type": "exam",
      "date": "2019-08-24T14:15:22Z",
      "done": true,
      "course": {
        "title": "string"
      }
    }
  ],
  "courses": [
    {
      "id": "string",
      "title": "string",
      "code": "string",
      "schedule": "string",
      "period": "string",
      "numberOfStudents": 0,
      "postValues": "string",
      "grades": [
        {
          "type": "sum-of-grades",
          "value": 0,
          "name": "string",
          "subGrades": [
            {
              "name": "string",
              "value": 0,
              "maxValue": 0,
              "weight": 0
            }
          ]
        }
      ],
      "news": [
        {
          "id": "string",
          "title": "string",
          "date": "2019-08-24T14:15:22Z",
          "content": "string"
        }
      ],
      "homeworks": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "haveGrade": true,
          "isGroup": true,
          "attachment": {
            "name": "string",
            "url": "http://example.com",
            "size": 0,
            "type": "string"
          }
        }
      ],
      "absences": {
        "list": [
          {
            "date": "2019-08-24T14:15:22Z",
            "numOfAbsences": 0
          }
        ],
        "total": 0,
        "max": 0
      },
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "attachments": [
            {
              "id": "string",
              "title": "string",
              "type": "file",
              "description": "string"
            }
          ]
        }
      ],
      "syllabus": {
        "methods": "string",
        "assessmentProcedures": "string",
        "attendanceSchedule": "string",
        "schedule": [
          {
            "description": "string",
            "startDate": "2019-08-24T14:15:22Z",
            "endDate": "2019-08-24T14:15:22Z"
          }
        ],
        "exams": [
          {
            "description": "string",
            "date": "2019-08-24T14:15:22Z"
          }
        ],
        "references": {
          "basic": [
            {
              "type": "string",
              "description": "string"
            }
          ],
          "supplementary": [
            {
              "type": "string",
              "description": "string"
            }
          ]
        }
      }
    }
  ]
}
```




### REPLY `absences::list` Operation

*Lista faltas*

* Operation ID: `getAbsencesList`

Canal para listar faltas de um vínculo

Recebe requisição para listar faltas de todas as disciplinas de um vínculo

#### Message Requisição de Faltas `AbsencesListRequest`

*Parâmetros para listagem de faltas*

* Message ID: `AbsencesListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de faltas | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| inactive | boolean | Incluir disciplinas inativas | - | - | - |
| allPeriods | boolean | Incluir todos os períodos | - | - | - |
| cache | boolean | Usar cache se disponível | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "inactive": false,
  "allPeriods": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `absences::list`
#### Message Vínculo com Faltas `AbsencesListResponse`

*Vínculo contendo faltas de todas as disciplinas*

* Message ID: `AbsencesListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Vínculo acadêmico do estudante | - | - | **additional properties are allowed** |
| program | string | Nome do programa/curso | - | - | - |
| registration | string | Número de matrícula | - | - | - |
| type | string | Tipo de vínculo | - | - | - |
| sequence | integer | Sequência do vínculo | - | - | - |
| active | boolean | Indica se o vínculo está ativo | - | - | - |
| period | string | Período letivo atual | - | - | - |
| activities | array&lt;object&gt; | Atividades pendentes | - | - | - |
| activities.id | string | ID da atividade | - | - | - |
| activities.title | string | Título da atividade | - | - | - |
| activities.type | string | Tipo de atividade | allowed (`"exam"`, `"homework"`, `"quiz"`) | - | - |
| activities.date | string | Data da atividade | - | format (`date-time`) | - |
| activities.done | boolean | Indica se foi concluída | - | - | - |
| activities.course | object | Disciplina relacionada | - | - | **additional properties are allowed** |
| activities.course.title | string | - | - | - | - |
| courses | array&lt;object&gt; | Disciplinas do vínculo | - | - | - |
| courses.id | string | ID único da disciplina | - | - | - |
| courses.title | string | Nome da disciplina | - | - | - |
| courses.code | string | Código da disciplina | - | - | - |
| courses.schedule | string | Horário das aulas | - | - | - |
| courses.period | string | Período letivo | - | - | - |
| courses.numberOfStudents | integer | Número de alunos matriculados | - | - | - |
| courses.postValues | string | Valores de formulário para requisições | - | - | - |
| courses.grades | array&lt;object&gt; | Grupos de notas | - | - | - |
| courses.grades.type | string | Tipo de cálculo das notas | allowed (`"sum-of-grades"`, `"only-average"`, `"weighted-average"`, `"arithmetic-average"`) | - | - |
| courses.grades.value | number | Valor da nota final | - | - | - |
| courses.grades.name | string | Nome do grupo de notas | - | - | - |
| courses.grades.subGrades | array&lt;object&gt; | Subnotas que compõem o grupo | - | - | - |
| courses.grades.subGrades.name | string | Nome da avaliação | - | - | - |
| courses.grades.subGrades.value | number | Nota obtida | - | - | - |
| courses.grades.subGrades.maxValue | number | Nota máxima possível | - | - | - |
| courses.grades.subGrades.weight | number | Peso da avaliação | - | - | - |
| courses.news | array&lt;object&gt; | Notícias da disciplina | - | - | - |
| courses.news.id | string | ID da notícia | - | - | - |
| courses.news.title | string | Título da notícia | - | - | - |
| courses.news.date | string | Data de publicação | - | format (`date-time`) | - |
| courses.news.content | string | Conteúdo completo | - | - | - |
| courses.homeworks | array&lt;object&gt; | Tarefas da disciplina | - | - | - |
| courses.homeworks.id | string | ID da tarefa | - | - | - |
| courses.homeworks.title | string | Título da tarefa | - | - | - |
| courses.homeworks.content | string | Descrição/conteúdo da tarefa | - | - | - |
| courses.homeworks.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.homeworks.endDate | string | Data de entrega | - | format (`date-time`) | - |
| courses.homeworks.haveGrade | boolean | Indica se possui nota | - | - | - |
| courses.homeworks.isGroup | boolean | Indica se é em grupo | - | - | - |
| courses.homeworks.attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| courses.homeworks.attachment.name | string | Nome do arquivo | - | - | - |
| courses.homeworks.attachment.url | string | URL para download | - | format (`uri`) | - |
| courses.homeworks.attachment.size | integer | Tamanho em bytes | - | - | - |
| courses.homeworks.attachment.type | string | Tipo MIME do arquivo | - | - | - |
| courses.absences | object | Registro de faltas de uma disciplina | - | - | **additional properties are allowed** |
| courses.absences.list | array&lt;object&gt; | Lista de faltas por data | - | - | - |
| courses.absences.list.date | string | Data da falta | - | format (`date-time`) | - |
| courses.absences.list.numOfAbsences | integer | Número de faltas | - | - | - |
| courses.absences.total | integer | Total de faltas | - | - | - |
| courses.absences.max | integer | Máximo de faltas permitidas | - | - | - |
| courses.lessons | array&lt;object&gt; | Aulas da disciplina | - | - | - |
| courses.lessons.id | string | ID da aula | - | - | - |
| courses.lessons.title | string | Título da aula | - | - | - |
| courses.lessons.content | string | Conteúdo textual | - | - | - |
| courses.lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| courses.lessons.attachments.id | string | ID do anexo | - | - | - |
| courses.lessons.attachments.title | string | Título do anexo | - | - | - |
| courses.lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| courses.lessons.attachments.description | string | Descrição do anexo | - | - | - |
| courses.syllabus | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| courses.syllabus.methods | string | Metodologia de ensino | - | - | - |
| courses.syllabus.assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| courses.syllabus.attendanceSchedule | string | Horário de atendimento | - | - | - |
| courses.syllabus.schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| courses.syllabus.schedule.description | string | Descrição do conteúdo | - | - | - |
| courses.syllabus.schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| courses.syllabus.schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| courses.syllabus.exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| courses.syllabus.exams.description | string | Descrição da avaliação | - | - | - |
| courses.syllabus.exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| courses.syllabus.references | object | - | - | - | **additional properties are allowed** |
| courses.syllabus.references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| courses.syllabus.references.basic.type | string | - | - | - | - |
| courses.syllabus.references.basic.description | string | - | - | - | - |
| courses.syllabus.references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| courses.syllabus.references.supplementary.type | string | - | - | - | - |
| courses.syllabus.references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "program": "string",
  "registration": "string",
  "type": "string",
  "sequence": 0,
  "active": true,
  "period": "string",
  "activities": [
    {
      "id": "string",
      "title": "string",
      "type": "exam",
      "date": "2019-08-24T14:15:22Z",
      "done": true,
      "course": {
        "title": "string"
      }
    }
  ],
  "courses": [
    {
      "id": "string",
      "title": "string",
      "code": "string",
      "schedule": "string",
      "period": "string",
      "numberOfStudents": 0,
      "postValues": "string",
      "grades": [
        {
          "type": "sum-of-grades",
          "value": 0,
          "name": "string",
          "subGrades": [
            {
              "name": "string",
              "value": 0,
              "maxValue": 0,
              "weight": 0
            }
          ]
        }
      ],
      "news": [
        {
          "id": "string",
          "title": "string",
          "date": "2019-08-24T14:15:22Z",
          "content": "string"
        }
      ],
      "homeworks": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "haveGrade": true,
          "isGroup": true,
          "attachment": {
            "name": "string",
            "url": "http://example.com",
            "size": 0,
            "type": "string"
          }
        }
      ],
      "absences": {
        "list": [
          {
            "date": "2019-08-24T14:15:22Z",
            "numOfAbsences": 0
          }
        ],
        "total": 0,
        "max": 0
      },
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "startDate": "2019-08-24T14:15:22Z",
          "endDate": "2019-08-24T14:15:22Z",
          "attachments": [
            {
              "id": "string",
              "title": "string",
              "type": "file",
              "description": "string"
            }
          ]
        }
      ],
      "syllabus": {
        "methods": "string",
        "assessmentProcedures": "string",
        "attendanceSchedule": "string",
        "schedule": [
          {
            "description": "string",
            "startDate": "2019-08-24T14:15:22Z",
            "endDate": "2019-08-24T14:15:22Z"
          }
        ],
        "exams": [
          {
            "description": "string",
            "date": "2019-08-24T14:15:22Z"
          }
        ],
        "references": {
          "basic": [
            {
              "type": "string",
              "description": "string"
            }
          ],
          "supplementary": [
            {
              "type": "string",
              "description": "string"
            }
          ]
        }
      }
    }
  ]
}
```




### REPLY `homework::content` Operation

*Obtém conteúdo de tarefa*

* Operation ID: `getHomeworkContent`

Canal para obter conteúdo detalhado de uma tarefa

Recebe requisição para obter detalhes completos de uma tarefa específica

#### Message Requisição de Tarefa `HomeworkContentRequest`

*Parâmetros para obter conteúdo de uma tarefa*

* Message ID: `HomeworkContentRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para obter conteúdo de uma tarefa | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| courseTitle | string | Título da disciplina | - | - | **required** |
| homeworkId | string | ID da tarefa | - | - | - |
| homeworkTitle | string | Título da tarefa | - | - | - |
| inactive | boolean | - | - | - | - |
| cache | boolean | - | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "courseTitle": "string",
  "homeworkId": "string",
  "homeworkTitle": "string",
  "inactive": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `homework::content`
#### Message Conteúdo da Tarefa `HomeworkContentResponse`

*Detalhes completos de uma tarefa*

* Message ID: `HomeworkContentResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Tarefa/Atividade acadêmica | - | - | **additional properties are allowed** |
| id | string | ID da tarefa | - | - | - |
| title | string | Título da tarefa | - | - | - |
| content | string | Descrição/conteúdo da tarefa | - | - | - |
| startDate | string | Data de início | - | format (`date-time`) | - |
| endDate | string | Data de entrega | - | format (`date-time`) | - |
| haveGrade | boolean | Indica se possui nota | - | - | - |
| isGroup | boolean | Indica se é em grupo | - | - | - |
| attachment | object | Arquivo anexo | - | - | **additional properties are allowed** |
| attachment.name | string | Nome do arquivo | - | - | - |
| attachment.url | string | URL para download | - | format (`uri`) | - |
| attachment.size | integer | Tamanho em bytes | - | - | - |
| attachment.type | string | Tipo MIME do arquivo | - | - | - |

> Examples of payload _(generated)_

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "startDate": "2019-08-24T14:15:22Z",
  "endDate": "2019-08-24T14:15:22Z",
  "haveGrade": true,
  "isGroup": true,
  "attachment": {
    "name": "string",
    "url": "http://example.com",
    "size": 0,
    "type": "string"
  }
}
```




### REPLY `lessons::list` Operation

*Lista aulas*

* Operation ID: `getLessonsList`

Canal para listar aulas de uma disciplina

Recebe requisição para listar aulas de uma disciplina específica

#### Message Requisição de Aulas `LessonsListRequest`

*Parâmetros para listagem de aulas*

* Message ID: `LessonsListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de aulas | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| courseId | string | ID da disciplina | - | - | **required** |
| inactive | boolean | - | - | - | - |
| allPeriods | boolean | - | - | - | - |
| cache | boolean | - | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "courseId": "string",
  "inactive": false,
  "allPeriods": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `lessons::list`
#### Message Lista de Aulas `LessonsListResponse`

*Array de aulas da disciplina*

* Message ID: `LessonsListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Resposta contendo lista de aulas | - | - | **additional properties are allowed** |
| lessons | array&lt;object&gt; | - | - | - | - |
| lessons.id | string | ID da aula | - | - | - |
| lessons.title | string | Título da aula | - | - | - |
| lessons.content | string | Conteúdo textual | - | - | - |
| lessons.startDate | string | Data de início | - | format (`date-time`) | - |
| lessons.endDate | string | Data de término | - | format (`date-time`) | - |
| lessons.attachments | array&lt;object&gt; | Anexos da aula | - | - | - |
| lessons.attachments.id | string | ID do anexo | - | - | - |
| lessons.attachments.title | string | Título do anexo | - | - | - |
| lessons.attachments.type | string | Tipo de anexo | allowed (`"file"`, `"link"`, `"hyperlink"`, `"video"`, `"forum"`, `"quiz"`, `"survey"`, `"web-content"`) | - | - |
| lessons.attachments.description | string | Descrição do anexo | - | - | - |

> Examples of payload _(generated)_

```json
{
  "lessons": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "startDate": "2019-08-24T14:15:22Z",
      "endDate": "2019-08-24T14:15:22Z",
      "attachments": [
        {
          "id": "string",
          "title": "string",
          "type": "file",
          "description": "string"
        }
      ]
    }
  ]
}
```




### REPLY `news::list` Operation

*Lista notícias*

* Operation ID: `getNewsList`

Canal para listar notícias de uma disciplina

Recebe requisição para listar notícias de uma disciplina específica

#### Message Requisição de Notícias `NewsListRequest`

*Parâmetros para listagem de notícias*

* Message ID: `NewsListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para listagem de notícias | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| courseId | string | ID da disciplina | - | - | **required** |
| full | boolean | Incluir conteúdo completo das notícias | - | - | - |
| inactive | boolean | - | - | - | - |
| cache | boolean | - | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "courseId": "string",
  "full": false,
  "inactive": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `news::list`
#### Message Lista de Notícias `NewsListResponse`

*Array de notícias da disciplina*

* Message ID: `NewsListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Resposta contendo lista de notícias | - | - | **additional properties are allowed** |
| news | array&lt;object&gt; | - | - | - | - |
| news.id | string | ID da notícia | - | - | - |
| news.title | string | Título da notícia | - | - | - |
| news.date | string | Data de publicação | - | format (`date-time`) | - |
| news.content | string | Conteúdo completo | - | - | - |

> Examples of payload _(generated)_

```json
{
  "news": [
    {
      "id": "string",
      "title": "string",
      "date": "2019-08-24T14:15:22Z",
      "content": "string"
    }
  ]
}
```




### REPLY `syllabus::content` Operation

*Obtém plano de ensino*

* Operation ID: `getSyllabusContent`

Canal para obter plano de ensino de uma disciplina

Recebe requisição para obter plano de ensino de uma disciplina específica

#### Message Requisição de Plano de Ensino `SyllabusContentRequest`

*Parâmetros para obter plano de ensino*

* Message ID: `SyllabusContentRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Parâmetros para obter plano de ensino | - | - | **additional properties are allowed** |
| registration | string | Matrícula do vínculo | - | - | **required** |
| courseId | string | ID da disciplina | - | - | **required** |
| inactive | boolean | - | - | - | - |
| cache | boolean | - | default (`true`) | - | - |

> Examples of payload _(generated)_

```json
{
  "registration": "string",
  "courseId": "string",
  "inactive": false,
  "cache": true
}
```


#### Response information

* reply will be provided via this designated address: `syllabus::content`
#### Message Plano de Ensino `SyllabusContentResponse`

*Plano de ensino completo da disciplina*

* Message ID: `SyllabusContentResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Plano de ensino da disciplina | - | - | **additional properties are allowed** |
| methods | string | Metodologia de ensino | - | - | - |
| assessmentProcedures | string | Procedimentos de avaliação | - | - | - |
| attendanceSchedule | string | Horário de atendimento | - | - | - |
| schedule | array&lt;object&gt; | Cronograma de aulas | - | - | - |
| schedule.description | string | Descrição do conteúdo | - | - | - |
| schedule.startDate | string | Data de início | - | format (`date-time`) | - |
| schedule.endDate | string | Data de término | - | format (`date-time`) | - |
| exams | array&lt;object&gt; | Calendário de avaliações | - | - | - |
| exams.description | string | Descrição da avaliação | - | - | - |
| exams.date | string | Data da avaliação | - | format (`date-time`) | - |
| references | object | - | - | - | **additional properties are allowed** |
| references.basic | array&lt;object&gt; | Referências básicas | - | - | - |
| references.basic.type | string | - | - | - | - |
| references.basic.description | string | - | - | - | - |
| references.supplementary | array&lt;object&gt; | Referências complementares | - | - | - |
| references.supplementary.type | string | - | - | - | - |
| references.supplementary.description | string | - | - | - | - |

> Examples of payload _(generated)_

```json
{
  "methods": "string",
  "assessmentProcedures": "string",
  "attendanceSchedule": "string",
  "schedule": [
    {
      "description": "string",
      "startDate": "2019-08-24T14:15:22Z",
      "endDate": "2019-08-24T14:15:22Z"
    }
  ],
  "exams": [
    {
      "description": "string",
      "date": "2019-08-24T14:15:22Z"
    }
  ],
  "references": {
    "basic": [
      {
        "type": "string",
        "description": "string"
      }
    ],
    "supplementary": [
      {
        "type": "string",
        "description": "string"
      }
    ]
  }
}
```




### REPLY `institutions::list` Operation

*Lista instituições*

* Operation ID: `getInstitutionsList`

Canal para listar instituições compatíveis

Recebe requisição para listar todas as instituições de ensino compatíveis

#### Message Requisição de Instituições `InstitutionsListRequest`

*Parâmetros para listagem de instituições*

* Message ID: `InstitutionsListRequest`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Payload vazio | - | - | **additional properties are allowed** |

> Examples of payload _(generated)_

```json
{}
```


#### Response information

* reply will be provided via this designated address: `institutions::list`
#### Message Lista de Instituições `InstitutionsListResponse`

*Array de instituições de ensino compatíveis*

* Message ID: `InstitutionsListResponse`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Resposta contendo lista de instituições | - | - | **additional properties are allowed** |
| institutions | array&lt;object&gt; | - | - | - | - |
| institutions.name | string | Nome completo da instituição | - | - | - |
| institutions.acronym | string | Sigla/acrônimo da instituição | - | - | - |
| institutions.url | string | URL do sistema SIGAA da instituição | - | format (`uri`) | - |

> Examples of payload _(generated)_

```json
{
  "institutions": [
    {
      "name": "string",
      "acronym": "string",
      "url": "http://example.com"
    }
  ]
}
```




### SEND `api::error` Operation

*Envia erro*

* Operation ID: `sendApiError`

Canal para receber erros da API

Envia mensagens de erro quando ocorrem problemas na API

#### Message Mensagem de Erro `ApiErrorMessage`

*Erro ocorrido durante processamento*

* Message ID: `ApiErrorMessage`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | Erro ocorrido durante processamento | - | - | **additional properties are allowed** |
| error | string | Descrição do erro | - | - | - |

> Examples of payload _(generated)_

```json
{
  "error": "string"
}
```



