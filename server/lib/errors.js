class HttpError extends Error {

	constructor (message, status = 500) {
		super(message);
		this.message = message;
		this.status = status;
		this.name = 'HttpError';
	}

}

export { HttpError }
