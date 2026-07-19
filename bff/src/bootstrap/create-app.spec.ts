/// <reference types="jest" />

jest.mock('../app.module.js', () => ({
  AppModule: class AppModule {},
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger') as typeof import('@nestjs/swagger');
  const chain = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  };

  return {
    ...actual,
    DocumentBuilder: jest.fn(() => chain),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  };
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module.js';
import {
  bootstrap,
  configureApp,
  createApp,
  createValidationPipe,
  setupSwagger,
} from './create-app.js';

describe('create-app bootstrap', () => {
  const listen = jest.fn().mockResolvedValue(undefined);
  const useGlobalPipes = jest.fn();
  const enableShutdownHooks = jest.fn();
  const setGlobalPrefix = jest.fn();
  const enableCors = jest.fn();
  const configGet = jest.fn();
  const getOrThrow = jest.fn().mockReturnValue('http://localhost:5173');
  const get = jest.fn();

  const app = {
    useGlobalPipes,
    enableShutdownHooks,
    setGlobalPrefix,
    enableCors,
    get,
    listen,
  } as unknown as INestApplication;

  beforeEach(() => {
    jest.clearAllMocks();
    configGet.mockImplementation((key: string, fallback?: number | string) => {
      if (key === 'PORT') return fallback;
      if (key === 'NODE_ENV') return fallback;
      return undefined;
    });
    getOrThrow.mockReturnValue('http://localhost:5173');
    get.mockReturnValue({ get: configGet, getOrThrow });
    jest.mocked(NestFactory.create).mockResolvedValue(app);
  });

  it('creates a validation pipe', () => {
    expect(createValidationPipe()).toBeInstanceOf(ValidationPipe);
  });

  it('configures prefix, cors, pipes and swagger', () => {
    const result = configureApp(app);

    expect(setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(enableCors).toHaveBeenCalled();
    expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(SwaggerModule.setup).toHaveBeenCalled();
    expect(result).toBe(app);
  });

  it('skips swagger when disabled or in production', () => {
    configureApp(app, { swagger: false });
    expect(SwaggerModule.setup).not.toHaveBeenCalled();

    jest.clearAllMocks();
    get.mockReturnValue({
      get: (key: string, fallback?: string) =>
        key === 'NODE_ENV' ? 'production' : fallback,
      getOrThrow,
    });

    configureApp(app);
    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it('sets up swagger metadata', () => {
    setupSwagger(app);

    expect(DocumentBuilder).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, {});
  });

  it('creates and bootstraps the app', async () => {
    await expect(createApp()).resolves.toBe(app);
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);

    configGet.mockImplementation((key: string, fallback?: number) =>
      key === 'PORT' ? 4000 : fallback,
    );
    get.mockReturnValue({ get: configGet, getOrThrow });

    await expect(bootstrap()).resolves.toBe(app);
    expect(listen).toHaveBeenCalledWith(4000);
  });

  it('listens on 3002 by default', async () => {
    await bootstrap();
    expect(listen).toHaveBeenCalledWith(3002);
  });
});
