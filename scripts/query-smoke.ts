import { QueryClient } from '@tanstack/react-query';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});
let calls = 0;
const data = await qc.fetchQuery({
  queryKey: ['orders', '今天'],
  queryFn: async () => { calls++; return [{ id: 'A-001', total: 99 }]; },
});
await qc.fetchQuery({ queryKey: ['orders', '今天'], queryFn: async () => { calls++; return []; } });
console.log('smoke-ok', JSON.stringify(data), 'calls=' + calls);
