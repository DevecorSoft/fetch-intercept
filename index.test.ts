import nock from "nock"
import { fetchFactory, jsonBodyInterceptor, rejectInterceptor, ResponseInterceptor } from "./index.ts"

describe('response interceptors', () => {

  describe('json body interceptor', () => {
    it('should able to extract json body when 200', async () => {
      const expectation = nock('http://localhost')
        .get('/path/to/resources')
        .reply(200, {id: 'resource id'})

      const fetch = fetchFactory().intercepts.interceptResponse(jsonBodyInterceptor).fetch
      const res = await fetch('/path/to/resources')

      expect(res).toEqual({id: 'resource id'})
      expectation.done()
    })

    it('should not error when 500', async () => {
      const expectation = nock('http://localhost')
        .get('/path/to/resources')
        .reply(500)

      const fetch = fetchFactory().intercepts.interceptResponse(jsonBodyInterceptor).fetch
      await fetch('/path/to/resources')

      expectation.done()
    })
  })

  describe('reject interceptor', () => {
    it('should throw error', (done) => {
      const expectation = nock('http://localhost')
        .get('/path/to/resources')
        .reply(200, {id: 'resource id'})

      const fetch = fetchFactory().intercepts.interceptResponse(rejectInterceptor).fetch
      fetch('/path/to/resources')
        .then(() => done('the fetch should be rejected but it was resolved'))
        .catch(() => done())
        .finally(() => expectation.done())
    })
  })

  describe('custom interceptor', () => {
    it('should able to customize server error interceptor', async () => {
      const expectation = nock('http://localhost')
        .get('/path/to/resources')
        .reply(500)

      const toErrorPageInterceptor: ResponseInterceptor = (response) => {
        if (response.status === 500) {
          location.assign('/error')
        }
        return response
      }
      const fetch = fetchFactory().intercepts.interceptResponse(toErrorPageInterceptor).fetch
      await fetch('/path/to/resources')

      expect(location.pathname).toEqual("/error")
      expectation.done()
    })
  })

  describe('multiple interceptors', () => {
    it('should be able to add multiple interceptors', async () => {
      const expectation = nock('http://localhost')
        .get('/path/to/resources')
        .reply(200, {id: 'resource id'})

      const fetch = fetchFactory().intercepts.interceptResponse(
        jsonBodyInterceptor,
        (response) => response.id
      ).fetch
      const id = await fetch('/path/to/resources')

      expect(id).toEqual('resource id')
      expectation.done()
    })
  })
})

describe('request interceptors', () => {

  describe('context path interceptor', () => {
    it('should add context path into url', async () => {
      const contextPath = '/api/v1'
      const expectation = nock('http://localhost')
        .get(`${contextPath}/path/to/resources`)
        .reply(200, {id: 'resource id'})

      const fetch = fetchFactory().intercepts.interceptRequest((input, init) => {
        return [`${contextPath}${input}`, init]
      }).fetch
      await fetch('/path/to/resources')

      expectation.done()
    })

    describe('authorization interceptor', () => {
      it('should add authorization', async () => {
        const expectation = nock('http://localhost')
          .get('/path/to/resources')
          .matchHeader('Authorization', 'Bearer the-jwt-token')
          .reply(200, {id: 'resource id'})

        const fetch = fetchFactory().intercepts.interceptRequest((input, init) => {
          init = init ?? {}
          init.headers = new Headers()
          init.headers.append('Authorization', 'Bearer the-jwt-token')
          return [input, init]
        }).fetch
        await fetch('/path/to/resources')

        expectation.done()
      })
    })

    describe('multiple interceptors', () => {
      it('should be able to add multiple request interceptors', async () => {
        const contextPath = '/api/v1'
        const expectation = nock('http://localhost')
          .get(`${contextPath}/path/to/resources`)
          .matchHeader('Authorization', 'Bearer the-jwt-token')
          .reply(200, {id: 'resource id'})

        const fetch = fetchFactory().intercepts.interceptRequest(
          (input, init) => [`${contextPath}${input}`, init],
          (input, init) => {
            init = init ?? {}
            init.headers = new Headers()
            init.headers.append('Authorization', 'Bearer the-jwt-token')
            return [input, init]
          }
        ).fetch
        await fetch('/path/to/resources')

        expectation.done()
      })
    })
  })
})
