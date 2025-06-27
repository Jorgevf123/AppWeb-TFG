const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
require('dotenv').config(); 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI); 
});

afterAll(async () => {
  await mongoose.disconnect(); 
});

describe('Pruebas de autenticación', () => {
  jest.setTimeout(15000); 

  test('Login inválido devuelve 404 con mensaje de usuario no encontrado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistente@correo.com', password: '1234' });

    expect(res.statusCode).toBe(404); 
    expect(res.body.error).toMatch(/no encontrado/i); 
  });
});
test('Contraseña incorrecta devuelve 400 con mensaje adecuado', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@gmail.com', password: 'contramal' }); 

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/contraseña/i);
});

test('Login válido devuelve 200 y un token', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@gmail.com', password: '123' }); 

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body.user).toHaveProperty('nombre');
});

test('Registro con contraseña débil devuelve 400', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .field('nombre', 'Prueba')
    .field('apellidos', 'Débil')
    .field('email', `debil${Date.now()}@correo.com`)
    .field('password', '1234')
    .field('rol', 'cliente')
    .field('fechaNacimiento', '2000-01-01')
    .field('ubicacion', JSON.stringify({ lat: 40.4168, lng: -3.7038 }));

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/contraseña/i);
});

test('Registro con usuario menor de edad devuelve 400', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .field('nombre', 'Menor')
    .field('apellidos', 'Edad')
    .field('email', `menor${Date.now()}@correo.com`)
    .field('password', 'Segura1@')
    .field('rol', 'cliente')
    .field('fechaNacimiento', '2010-01-01') 
    .field('ubicacion', JSON.stringify({ lat: 40.4168, lng: -3.7038 }));

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/18 años/i);
});
test('Registro válido de cliente devuelve 201', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .field('nombre', 'Cliente')
    .field('apellidos', 'Válido')
    .field('email', `cliente${Date.now()}@correo.com`)
    .field('password', 'Segura1@')
    .field('rol', 'cliente')
    .field('fechaNacimiento', '1995-05-05')
    .field('ubicacion', JSON.stringify({ lat: 40.4168, lng: -3.7038 }));

  expect(res.statusCode).toBe(201);
  expect(res.body.message).toMatch(/usuario registrado/i);
});
test('Acceso a /me sin token devuelve 401', async () => {
  const res = await request(app).get('/api/auth/me');
  expect(res.statusCode).toBe(401);
  expect(res.body.error).toMatch(/token no proporcionado/i);
});

test('Acceso a /me con token válido devuelve datos del usuario', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@gmail.com', password: '123' });

  const token = loginRes.body.token;
  expect(token).toBeDefined();

  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('nombre');
  expect(res.body).toHaveProperty('email');
});







