describe('Regression: Products API', () => {
  let authToken
  let createdProductId

  before(() => {
    cy.request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'Admin@123'
    }).then((response) => {
      authToken = response.body.token
    })
  })

  it('GET /api/products — should return list of products', () => {
    cy.request({
      method: 'GET',
      url: '/api/products',
      headers: { Authorization: `Bearer ${authToken}` }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
    })
  })

  it('POST /api/products — should create a new product', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'POST',
        url: api.products.endpoint,
        headers: { Authorization: `Bearer ${authToken}` },
        body: api.products.createPayload
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body.name).to.eq(api.products.createPayload.name)
        expect(response.body.price).to.eq(api.products.createPayload.price)
        createdProductId = response.body.id
      })
    })
  })

  it('PUT /api/products/:id — should update an existing product', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'PUT',
        url: `${api.products.endpoint}/${createdProductId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: api.products.updatePayload
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.name).to.eq(api.products.updatePayload.name)
        expect(response.body.price).to.eq(api.products.updatePayload.price)
      })
    })
  })

  it('DELETE /api/products/:id — should delete a product', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'DELETE',
        url: `${api.products.endpoint}/${createdProductId}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })

  it('GET /api/products/:id — should return 404 for deleted product', () => {
    cy.fixture('api-responses').then((api) => {
      cy.request({
        method: 'GET',
        url: `${api.products.endpoint}/${createdProductId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    })
  })
})
