// E5 专用:亲手抓一次"类型蒸发"。步骤见同目录 box-实验步骤.md
class Box<T> {
  constructor(public value: T) {}
  get(): T {
    return this.value;
  }
}

const b = new Box<number>(42);
console.log(b.get() + 1);
