// S17 练习场:E1 把 vnode 打印出来看结构;E2~E4 在纸上人肉 diff
// 运行:pnpm lab phase2-react/exercises/02_render_diff/playground.tsx
import { renderToString } from 'react-dom/server';

const vnode = (
  <table>
    <tbody>
      <tr><td>A-001</td></tr>
    </tbody>
  </table>
);
console.log(JSON.stringify(vnode, null, 2));
