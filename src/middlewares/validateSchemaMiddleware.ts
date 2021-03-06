import { NextFunction, Request, Response } from 'express';
import { stripHtml } from 'string-strip-html';
import authSchema from '../schemas/authSchema.js';
import testSchema from '../schemas/testSchema.js';
import userSchema from '../schemas/userSchema.js';

function sanitizeString(string: string) {
	return stripHtml(string).result.trim();
}

const schemas = {
	'/login': authSchema,
	'/register': userSchema,
	'/instructors/tests/create': testSchema
};

export default async function validateSchemaMiddleware(req: Request, res: Response, next: NextFunction) {
	const { body } = req;

	let schema;
	if (req.path.includes('instructors')) {
		schema = schemas['/instructors/tests/create'];
	} else {
		schema = schemas['/' + req.path.split('/')[1]];
	}

	Object.keys(body).forEach((key) => {
		if (typeof body[key] === 'string') body[key] = sanitizeString(body[key]);
	});

	const validation = schema.validate(body, { abortEarly: false });
	if (validation.error) return res.status(422).send(validation.error.message);

	next();
}
