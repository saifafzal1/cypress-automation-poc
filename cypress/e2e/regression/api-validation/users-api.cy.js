describe('Regression: Users API', () => {
  let authToken
  let createdUserId

  before(() => {
    cy.request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'Admin@123'
    }).then((response) => {
      authToken = response.body.token
    })
  })

  it('GET /api/users — should return list of users', () => {
    cy.request({
      method: 'GET',
      url: '/api/users',
      headers: { Authorization: `Bearer ${authToken}` }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.be.greaterThan(0)
    })
  })

  it('POST /api/users — should create a new user', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'POST',
        url: api.users.endpoint,
        headers: { Authorization: `Bearer ${authToken}` },
        body: api.users.createPayload
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body.name).to.eq(api.users.createPayload.name)
        createdUserId = response.body.id
      })
    })
  })

  it('PUT /api/users/:id — should update an existing user', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'PUT',
        url: `${api.users.endpoint}/${createdUserId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: api.users.updatePayload
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.name).to.eq(api.users.updatePayload.name)
      })
    })
  })

  it('GET /api/users/:id — should return a single user', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'GET',
        url: `${api.users.endpoint}/${createdUserId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id', createdUserId)
      })
    })
  })

  it('DELETE /api/users/:id — should delete a user', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'DELETE',
        url: `${api.users.endpoint}/${createdUserId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })

  it('GET /api/users/:id — should return 404 for deleted user', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'GET',
        url: `${api.users.endpoint}/${createdUserId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    })
  })
})
