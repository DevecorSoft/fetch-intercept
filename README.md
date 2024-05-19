# fetch-intercept

![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat&logo=jest)
![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat&logo=jest)
![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat&logo=jest)
![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat&logo=jest)

add interceptors to fetch api without any hack in to `window.fetch`

## Usage

### Request interceptors

#### authorization interceptor

```typescript
import {
  fetchFactory
} from "@devecorsoft/fetch-intercept"

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
```

### Response interceptors

#### Json body interceptor

```typescript
import { fetchFactory, jsonBodyInterceptor } from "@devecorsoft/fetch-intercept"

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
```

#### customize response interceptor

```typescript
import { fetchFactory, ResponseInterceptor } from "@devecorsoft/fetch-intercept"

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
```

see [tests](https://github.com/DevecorSoft/fetch-intercept/blob/main/index.test.ts) for more examples.
