const express = require('express')
const crypto = require('crypto')
const app = express()

app.use(express.urlencoded({ extended: false }))

const users = []

app.get('/', (req, res) => {
	res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Exercise Tracker</title>
    </head>
    <body>
      <h1>Exercise Tracker</h1>
      
      <section>
        <h2>Create a New User</h2>
        <p><code>POST /api/users</code> with form data <code>username</code></p>
        <form action="/api/users" method="post">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>
          <button type="submit">Create User</button>
        </form>
        <p>Example response:</p>
        <pre>{ "username": "fcc_test", "_id": "5fb5853f734231456ccb3b05" }</pre>
      </section>
      
      <section>
        <h2>Add Exercises</h2>
        <p><code>POST /api/users/:_id/exercises</code> with form data <code>description</code>, <code>duration</code>, optional <code>date</code></p>
        <form id="exercise-form" method="post">
          <label for="userId">User ID (_id):</label>
          <input type="text" id="userId" name="userId" placeholder="Enter _id" required>
          <label for="description">Description:</label>
          <input type="text" id="description" name="description" required>
          <label for="duration">Duration (minutes):</label>
          <input type="number" id="duration" name="duration" required>
          <label for="date">Date (yyyy-mm-dd):</label>
          <input type="text" id="date" name="date">
          <button type="submit">Add Exercise</button>
        </form>
        <script>
          document.getElementById('exercise-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const userId = this.userId.value;
            this.action = \`/api/users/\${userId}/exercises\`;
            this.submit();
          });
        </script>
        <p>Example response:</p>
        <pre>{
  "username": "fcc_test",
  "description": "test",
  "duration": 60,
  "date": "Mon Jan 01 1990",
  "_id": "5fb5853f734231456ccb3b05"
}</pre>
      </section>
      
      <section>
        <h2>Get All Users</h2>
        <p><code>GET /api/users</code></p>
        <p>Example response: array of users</p>
        <pre>[ { "_id": "5fb5853f734231456ccb3b05", "username": "fcc_test" } ]</pre>
      </section>
      
      <section>
        <h2>Get User Exercise Log</h2>
        <p><code>GET /api/users/:_id/logs?[from][&to][&limit]</code></p>
        <p>from, to = yyyy-mm-dd; limit = integer</p>
        <p>Example response:</p>
        <pre>{
  "username": "fcc_test",
  "count": 1,
  "_id": "5fb5853f734231456ccb3b05",
  "log": [{
    "description": "test",
    "duration": 60,
    "date": "Mon Jan 01 1990"
  }]
}</pre>
      </section>
    </body>
    </html>
  `)
})

app.post('/api/users', (req, res) => {
	const { username } = req.body
	if (!username) return res.status(400).send('Username is required')
	const _id = crypto.randomBytes(12).toString('hex')
	const user = { username, _id, log: [] }
	users.push(user)
	res.json({ username, _id })
})

app.get('/api/users', (req, res) => {
	res.json(users.map((u) => ({ username: u.username, _id: u._id })))
})

app.post('/api/users/:_id/exercises', (req, res) => {
	const { _id } = req.params
	const { description, duration, date } = req.body
	if (!description || !duration)
		return res.status(400).send('Description and duration are required')
	const dur = Number(duration)
	if (isNaN(dur)) return res.status(400).send('Duration must be a number')
	const user = users.find((u) => u._id === _id)
	if (!user) return res.status(404).send('User not found')
	let exDate = date ? new Date(date) : new Date()
	if (isNaN(exDate.getTime())) return res.status(400).send('Invalid date')
	const exercise = { description, duration: dur, date: exDate.toDateString() }
	user.log.push(exercise)
	res.json({ ...exercise, username: user.username, _id: user._id })
})

app.get('/api/users/:_id/logs', (req, res) => {
	const { _id } = req.params
	const { from, to, limit } = req.query
	const user = users.find((u) => u._id === _id)
	if (!user) return res.status(404).send('User not found')
	let log = [...user.log]
	if (from) {
		const fromDate = new Date(from)
		if (!isNaN(fromDate.getTime()))
			log = log.filter((ex) => new Date(ex.date) >= fromDate)
	}
	if (to) {
		const toDate = new Date(to)
		if (!isNaN(toDate.getTime()))
			log = log.filter((ex) => new Date(ex.date) <= toDate)
	}
	if (limit) {
		const lim = parseInt(limit, 10)
		if (!isNaN(lim)) log = log.slice(0, lim)
	}
	res.json({ username: user.username, _id: user._id, count: log.length, log })
})

const port = process.env.PORT || 3000
if (!module.parent) {
	app.listen(port, () => console.log(`App listening on port ${port}`))
}

module.exports = app
