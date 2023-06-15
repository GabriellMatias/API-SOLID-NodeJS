import { InvalidCredentiasError } from '@/use-cases/errors/invalid-credentiais-erro'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticade-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)
  try {
    const authenticateUseCase = makeAuthenticateUseCase()
    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )
    return reply.status(200).send(token)
  } catch (error) {
    if (error instanceof InvalidCredentiasError) {
      return reply.status(409).send({ message: error.message })
    }
    throw error
  }
}
