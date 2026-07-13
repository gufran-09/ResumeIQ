"""Custom exceptions for the resume parser service."""


class ResumeParserError(Exception):
    """Base exception for all parser errors."""

    def __init__(self, message: str, detail: str | None = None):
        self.message = message
        self.detail = detail
        super().__init__(self.message)


class UnsupportedFileTypeError(ResumeParserError):
    """Raised when the uploaded file type is not supported."""


class FileTooLargeError(ResumeParserError):
    """Raised when the uploaded file exceeds the size limit."""


class ParsingError(ResumeParserError):
    """Raised when text extraction from the file fails."""


class EmptyContentError(ResumeParserError):
    """Raised when the resume has no extractable text."""


class ModelNotLoadedError(ResumeParserError):
    """Raised when the spaCy NLP model is not available."""
