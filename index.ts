export interface RequestInterceptor {
  (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]): [input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]]
}

export interface ResponseInterceptor {
  (response: Response): Promise<any> | any
  (response: any): Promise<any> | any
}

interface Intercepts {
  readonly interceptRequest: (...interceptor: RequestInterceptor[]) => FetchFactory,
  readonly interceptResponse: (...interceptor: ResponseInterceptor[]) => FetchFactory
}

interface FetchFactory {
  intercepts: Intercepts
  fetch: typeof fetch
}

export function fetchFactory(): FetchFactory {
  const requestInterceptors: Array<RequestInterceptor> = []
  const responseInterceptors: Array<ResponseInterceptor> = []
  const factory: FetchFactory = {
    intercepts: {
      interceptResponse: (...interceptor) => {
        responseInterceptors.push(...interceptor)
        return factory
      },
      interceptRequest: (...interceptor) => {
        requestInterceptors.push(...interceptor)
        return factory
      }
    },
    fetch: (input, init) => {
      const [_input, _init] = requestInterceptors.reduce(
        (acc, intercept) => intercept(...acc),
        [input, init]
      )

      return responseInterceptors
        .reduce(
          (acc, interceptor) => {
            return acc.then(interceptor)
          },
          fetch(_input, _init)
        )
    },
  }
  return factory
}

export const jsonBodyInterceptor: ResponseInterceptor = (response) => {
  if (response.ok) {
    return response.json()
  }
  return response
}

export const rejectInterceptor: ResponseInterceptor = () => Promise.reject()
