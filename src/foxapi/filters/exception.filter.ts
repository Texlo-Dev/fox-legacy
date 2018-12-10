import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse(); // < RETURNS OutgoingMessage

    response.code(500).send({ message: "ERROR" });
    // UnhandledPromiseRejectionWarning: TypeError: response.code is not a function
  }
}
