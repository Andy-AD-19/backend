const chai = require('chai')
const request = require('supertest')
const app = require('./server')
const expect = chai.expect

let userId
let currentDateString = new Date().toDateString()

describe('Exercise Tracker API Tests', () => {
	// Test 2 & 3
	it('2-3. POST /api/users creates a new user and returns object with username and _id', async () => {
		const res = await request(app)
			.post('/api/users')
			.send({ username: 'fcc_test' })
		expect(res.status).to.equal(200)
		expect(res.body).to.be.an('object')
		expect(res.body).to.have.property('username', 'fcc_test')
		expect(res.body).to.have.property('_id').that.is.a('string')
		userId = res.body._id
	})

	// Test 4-6
	it('4-6. GET /api/users returns an array of user objects with username and _id', async () => {
		const res = await request(app).get('/api/users')
		expect(res.status).to.equal(200)
		expect(res.body).to.be.an('array')
		expect(res.body.length).to.be.at.least(1)
		expect(res.body[0]).to.be.an('object')
		expect(res.body[0]).to.have.property('username').that.is.a('string')
		expect(res.body[0]).to.have.property('_id').that.is.a('string')
	})

	// Test 7-8
	it('7-8. POST /api/users/:_id/exercises adds exercise and returns user object with exercise fields', async () => {
		const res = await request(app)
			.post(`/api/users/${userId}/exercises`)
			.send({ description: 'test', duration: '60', date: '1990-01-01' })
		expect(res.status).to.equal(200)
		expect(res.body).to.have.property('username', 'fcc_test')
		expect(res.body).to.have.property('_id', userId)
		expect(res.body).to.have.property('description', 'test')
		expect(res.body).to.have.property('duration', 60)
		expect(res.body).to.have.property('date', 'Mon Jan 01 1990')
	})

	// Add another exercise without date to test default date
	it('POST /api/users/:_id/exercises without date uses current date', async () => {
		const res = await request(app)
			.post(`/api/users/${userId}/exercises`)
			.send({ description: 'test_no_date', duration: '30' })
		expect(res.status).to.equal(200)
		expect(res.body).to.have.property('date', currentDateString)
	})

	// Add one more for filtering
	it('Add another exercise for filtering', async () => {
		await request(app)
			.post(`/api/users/${userId}/exercises`)
			.send({ description: 'test2', duration: '45', date: '1990-01-02' })
	})

	// Test 9-15
	it('9-15. GET /api/users/:_id/logs returns user object with count and log array; log items have string description, number duration, string date', async () => {
		const res = await request(app).get(`/api/users/${userId}/logs`)
		expect(res.status).to.equal(200)
		expect(res.body).to.be.an('object')
		expect(res.body).to.have.property('username', 'fcc_test')
		expect(res.body).to.have.property('count').that.is.a('number')
		expect(res.body).to.have.property('_id', userId)
		expect(res.body).to.have.property('log').that.is.an('array')
		expect(res.body.count).to.equal(res.body.log.length)
		expect(res.body.log[0]).to.have.property('description').that.is.a('string')
		expect(res.body.log[0]).to.have.property('duration').that.is.a('number')
		expect(res.body.log[0]).to.have.property('date').that.is.a('string')
		// Check date format (example: Mon Jan 01 1990)
		expect(res.body.log[0].date).to.match(
			/^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}$/
		)
	})

	// Test 16
	it('16. GET /api/users/:_id/logs with from, to, limit parameters filters the log', async () => {
		const res = await request(app).get(
			`/api/users/${userId}/logs?from=1990-01-01&to=1990-01-01&limit=1`
		)
		expect(res.status).to.equal(200)
		expect(res.body.count).to.equal(1)
		expect(res.body.log[0].date).to.equal('Mon Jan 01 1990')
	})
})

// Note: Test 1 is meta (provide own project) and not testable here.
