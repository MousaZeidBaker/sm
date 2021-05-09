
interface HttpErrorResponse {
  errors: {
    status: number
    title: string
    detail: string
  }[]
}

export const NotFoundHttpResponse: HttpErrorResponse = {
  errors: [
    {
      status: 404,
      title: 'Not Found',
      detail: 'Not Found'
    }
  ]
}

export const MethodNotAllowedHttpResponse: HttpErrorResponse = {
  errors: [
    {
      status: 415,
      title: 'Method Not Allowed',
      detail: 'Method Not Allowed'
    }
  ]
}

export const InternalServerHttpResponse: HttpErrorResponse = {
  errors: [
    {
      status: 500,
      title: 'Internal Server Error',
      detail: 'Internal Server Error'
    }
  ]
}
