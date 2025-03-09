const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbpath = path.join(__dirname, 'tasks.db')

app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error:${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

let titles = [
  {
    id: 1,
    title: 'CSS',
    description: 'To style Website',
  },
]

app.post('/tasks', async (request, response) => {
  const {gotTitle, gotDescription} = request.body
  const createTitleQuery = `INSERT INTO tasks (title,description) VALUES ('${gotTitle}','${gotDescription}');`
  const result = await db.run(createTitleQuery)
  if (result !== null) {
    response.send(result)
    response.code(200)
  } else {
    response.code(400)
    response.send('Bad Request')
  }
})

app.get('/tasks', async (request, response) => {
  const getTasksQuery = `SELECT * FROM tasks;`
  const result = await db.all(getTasksQuery)
  if (result !== undefined) {
    response.send(result)
    response.code(200)
  } else {
    response.code(404)
    response.send('Not Found')
  }
})

app.get('/tasks/:id', async (request, response) => {
  const {taskId} = request.params
  const getTaskQuery = `SELECT * FROM tasks WHERE id=${taskId}`
  const result = await db.get(getTaskQuery)
  if (result !== undefined) {
    response.send(result)
    response.code(200)
  } else {
    response.code(404)
    response.send('Not Found')
  }
})

app.put('/tasks/:id', async (request, response) => {
  const {taskId} = request.params

  const getPreviousTaskQuery = `SELECT  * FROM tasks WHERE id = ${taskId};`

  const previousTask = await db.get(getPreviousTaskQuery)
  const {title = previousTask.title, description = previousTask.description} =
    request.body

  const updateTaskQuery = `UPDATE tasks SET title = '${title}',description = '${description}' WHERE id = '${taskId}';`

  const result = await db.run(updateTaskQuery)
  if (result !== undefined) {
    response.send(result)
    response.code(200)
  } else {
    response.code(404)
    response.send('Not Found')
  }
})

app.delete('/tasks/:id', async (request, response) => {
  const {taskId} = request.params

  const deleteTaskQuery = `DELETE FROM tasks WHERE id = ${taskId};`

  const result = await db.run(deleteTaskQuery)
  if (result !== undefined) {
    response.send(result)
    response.code(200)
  } else {
    response.code(400)
    response.send('Bad Request')
  }
})

module.exports = app
