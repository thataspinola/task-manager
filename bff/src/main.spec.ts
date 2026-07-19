/// <reference types="jest" />

jest.mock('./instrument.js', () => ({}));

jest.mock('./bootstrap/create-app.js', () => ({
  bootstrap: jest.fn().mockResolvedValue(undefined),
}));

describe('main entrypoint', () => {
  const originalWorkerId = process.env.JEST_WORKER_ID;

  afterEach(() => {
    process.env.JEST_WORKER_ID = originalWorkerId;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('does not auto-start bootstrap inside Jest', async () => {
    process.env.JEST_WORKER_ID = '1';

    const { bootstrap } = await import('./bootstrap/create-app.js');
    await import('./main.js');

    expect(bootstrap).not.toHaveBeenCalled();
  });

  it('auto-starts bootstrap outside Jest', async () => {
    delete process.env.JEST_WORKER_ID;

    const { bootstrap } = await import('./bootstrap/create-app.js');
    await import('./main.js');

    expect(bootstrap).toHaveBeenCalledTimes(1);
  });
});
