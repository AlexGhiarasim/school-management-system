// Builds the Postman collection from the OpenAPI document of the running API.
//
//   npm run start:dev          (in another terminal)
//   npm run postman
//
// Usage: node scripts/generate-postman.mjs [openapi-url] [output-file]
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const SOURCE = process.argv[2] ?? 'http://localhost:3000/api/docs-json';
const OUTPUT =
  process.argv[3] ??
  '../docs/postman/School-Management-System.postman_collection.json';

const FOLDER_ORDER = [
  'Auth',
  'Students',
  'Teachers',
  'Classes',
  'Subjects',
  'Grades',
  'Statistics',
  'Admins',
  'Health',
];

const LOGINS = [
  { name: 'Login as admin', email: 'admin@school.test', password: 'Admin123!' },
  {
    name: 'Login as teacher',
    email: 'laura.marin@school.test',
    password: 'Teacher123!',
  },
  {
    name: 'Login as student',
    email: 'mihai.constantin@student.school.test',
    password: 'Student123!',
  },
];

// Example values for fields whose schema has no example of its own.
const EXAMPLES_BY_NAME = {
  email: 'maria.popescu@school.test',
  password: 'Password123',
  currentPassword: 'Password123',
  newPassword: 'NewPassword123',
  firstName: 'Maria',
  lastName: 'Popescu',
  phone: '+44 7700 900123',
  dateOfBirth: '2010-05-17',
  date: '2026-10-01',
  name: 'Example',
  token: 'the-token-from-the-reset-email',
  language: 'ro',
  value: 8,
};

const response = await fetch(SOURCE);

if (!response.ok) {
  throw new Error(`Could not read ${SOURCE}: ${response.status}`);
}

const api = await response.json();
const schemas = api.components?.schemas ?? {};

function resolve(schema) {
  return schema?.$ref ? schemas[schema.$ref.split('/').pop()] : schema;
}

function example(schema, name) {
  const resolved = resolve(schema);

  if (!resolved) return undefined;
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.enum) return resolved.enum[0];
  if (name in EXAMPLES_BY_NAME && resolved.type !== 'object') {
    return EXAMPLES_BY_NAME[name];
  }

  switch (resolved.type) {
    case 'string':
      return resolved.format === 'email' ? EXAMPLES_BY_NAME.email : 'string';
    case 'number':
    case 'integer':
      return resolved.minimum ?? 1;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object': {
      const properties = resolved.properties ?? {};
      // An update has no required field, so it shows all of them.
      const keys = resolved.required?.length
        ? resolved.required
        : Object.keys(properties);

      return Object.fromEntries(
        keys.map((key) => [key, example(properties[key], key)]),
      );
    }
    default:
      return null;
  }
}

function jsonBody(value) {
  return {
    mode: 'raw',
    raw: JSON.stringify(value, null, 2),
    options: { raw: { language: 'json' } },
  };
}

function toRequest(path, method, operation) {
  const parameters = operation.parameters ?? [];
  const pathName = path.replace(/\{(\w+)\}/g, ':$1');
  const query = parameters
    .filter((parameter) => parameter.in === 'query')
    .map((parameter) => ({
      key: parameter.name,
      value: String(example(parameter.schema, parameter.name) ?? ''),
      // Optional filters start switched off, so a request works as it is.
      disabled: !parameter.required,
    }));
  const variables = parameters
    .filter((parameter) => parameter.in === 'path')
    .map((parameter) => ({ key: parameter.name, value: '1' }));
  const bodySchema =
    operation.requestBody?.content?.['application/json']?.schema;
  const isPublic = !operation.security?.length;

  return {
    name: `${method.toUpperCase()} ${pathName.replace('/api', '')}`,
    request: {
      method: method.toUpperCase(),
      ...(isPublic && { auth: { type: 'noauth' } }),
      header: bodySchema
        ? [{ key: 'Content-Type', value: 'application/json' }]
        : [],
      ...(bodySchema && { body: jsonBody(example(bodySchema, 'body')) }),
      url: {
        raw: `{{baseUrl}}${pathName}`,
        host: ['{{baseUrl}}'],
        path: pathName.split('/').filter(Boolean),
        ...(query.length && { query }),
        ...(variables.length && { variable: variables }),
      },
      description: [operation.summary, operation.description]
        .filter(Boolean)
        .join('\n\n'),
    },
  };
}

// A login saves the token, and every other request uses it.
function loginRequest({ name, email, password }) {
  return {
    name,
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Signed in', () => pm.response.to.have.status(200));",
            "pm.collectionVariables.set('token', pm.response.json().accessToken);",
          ],
        },
      },
    ],
    request: {
      method: 'POST',
      auth: { type: 'noauth' },
      header: [{ key: 'Content-Type', value: 'application/json' }],
      body: jsonBody({ email, password }),
      url: {
        raw: '{{baseUrl}}/api/auth/login',
        host: ['{{baseUrl}}'],
        path: ['api', 'auth', 'login'],
      },
      description: 'Signs in and stores the token for the other requests.',
    },
  };
}

const folders = new Map();

for (const [path, operations] of Object.entries(api.paths)) {
  for (const [method, operation] of Object.entries(operations)) {
    const tag = operation.tags?.[0] ?? 'Other';
    const items = folders.get(tag) ?? [];

    if (path === '/api/auth/login') {
      items.unshift(...LOGINS.map(loginRequest));
    } else {
      items.push(toRequest(path, method, operation));
    }

    folders.set(tag, items);
  }
}

const rank = (tag) =>
  FOLDER_ORDER.includes(tag) ? FOLDER_ORDER.indexOf(tag) : FOLDER_ORDER.length;

const collection = {
  info: {
    name: api.info?.title ?? 'API',
    description:
      'Run one of the "Login as" requests first. It saves the token, which every other request sends.\n\n' +
      'Change the baseUrl variable if the API runs somewhere else.',
    schema:
      'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{token}}', type: 'string' }],
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000' },
    { key: 'token', value: '' },
  ],
  item: [...folders.entries()]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([name, item]) => ({ name, item })),
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(collection, null, 2)}\n`);

const count = [...folders.values()].reduce(
  (sum, items) => sum + items.length,
  0,
);
console.log(`Wrote ${count} requests in ${folders.size} folders to ${OUTPUT}`);
