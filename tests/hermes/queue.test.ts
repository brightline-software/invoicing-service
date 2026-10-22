import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/hermes/queue', () => ({
  hermes: { add: vi.fn() },
  DEFAULT_JOB_OPTIONS: { attempts: 5 },
}));

import { hermes } from '../../src/hermes/queue';
import { enqueueInvoiceEmail } from '../../src/hermes/jobs';

describe('Hermes jobs', () => {
  it('uses the invoice id as idempotency key for new invoices', async () => {
    await enqueueInvoiceEmail('inv-1', { reason: 'new' });
    expect(hermes.add).toHaveBeenCalledWith(
      'invoice.email',
      { invoiceId: 'inv-1', reason: 'new' },
      expect.objectContaining({ jobId: 'email:inv-1' }),
    );
  });
});
