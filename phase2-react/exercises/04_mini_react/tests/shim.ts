// fake-DOM shim —— mini-React 禁写区的测试地基(Node 里没有真 DOM)
// mini-React 只允许使用以下 DOM API(白名单):
//   document.createElement(tag) / document.createTextNode(text)
//   el.appendChild(c) / el.insertBefore(c, ref) / el.removeChild(c)
//   el.setAttribute(k, v) / el.removeAttribute(k) / 文本节点.textContent 赋值

export class FakeText {
  private _text: string;
  parent: any = null;
  constructor(text: string) { this._text = String(text); }
  get textContent(): string { return this._text; }
  set textContent(v: string) { this._text = String(v); }
}

export class FakeElement {
  tagName: string;
  children: any[] = [];
  attrs = new Map<string, string>();
  parent: any = null;
  constructor(tag: string) { this.tagName = String(tag).toUpperCase(); }
  appendChild(c: any) { c.parent = this; this.children.push(c); return c; }
  insertBefore(c: any, ref: any) {
    if (!ref) return this.appendChild(c);
    const i = this.children.indexOf(ref);
    this.children.splice(i < 0 ? this.children.length : i, 0, c);
    c.parent = this;
    return c;
  }
  removeChild(c: any) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parent = null; return c; }
  replaceChild(c: any, old: any) {
    const i = this.children.indexOf(old);
    if (i >= 0) this.children.splice(i, 1, c);
    c.parent = this;
    return old;
  }
  setAttribute(k: string, v: string) { this.attrs.set(k, String(v)); }
  removeAttribute(k: string) { this.attrs.delete(k); }
  get textContent(): string { return this.children.map(c => c.textContent).join(''); }
}

export function installDom(): void {
  (globalThis as any).document = {
    createElement: (t: string) => new FakeElement(t),
    createTextNode: (s: any) => new FakeText(s),
  };
}

export function createContainer(): FakeElement {
  installDom();
  return new FakeElement('#container');
}

export function dumpHTML(el: any): string {
  if (el instanceof FakeText) return el.textContent;
  const attrs = [...el.attrs.entries()].map(([k, v]) => ` ${k}="${v}"`).join('');
  return `<${el.tagName.toLowerCase()}${attrs}>${el.children.map(dumpHTML).join('')}</${el.tagName.toLowerCase()}>`;
}

/** 只序列化容器的孩子们(不带容器包装) */
export function dumpChildren(el: any): string {
  return el.children.map(dumpHTML).join('');
}
