"""Register exception handlers for the FastAPI app."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .exceptions import ResumeParserError
from .models import ParseError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ResumeParserError)
    async def handle_parser_error(request: Request, exc: ResumeParserError):
        status = 422
        if exc.__class__.__name__ == "UnsupportedFileTypeError":
            status = 415
        elif exc.__class__.__name__ == "FileTooLargeError":
            status = 413
        elif exc.__class__.__name__ == "EmptyContentError":
            status = 422
        logger.warning("Parser error: %s — %s", exc.message, exc.detail)
        return JSONResponse(
            status_code=status,
            content=ParseError(message=exc.message, detail=exc.detail).model_dump(),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception):
        logger.error("Unexpected error: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content=ParseError(
                message="An unexpected error occurred while parsing the resume",
                detail=str(exc),
            ).model_dump(),
        )
