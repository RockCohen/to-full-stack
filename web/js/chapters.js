// chapters.js — 全栈之旅 · 互动课程内容(阶段 0~3 · 12 章)
// 写作铁律:每个概念必须"旧世界先行"——先亮 Java/CS 里你已有的代码或场景,再给 TS 的孪生,再做综合分析;
// 写作铁律二(世界观):每章开头用 .worldview 声明"本章管的是哪一类读写",正文用读写语言点题
//   (赋值是写、读字段是读、收窄收的是读权限、渲染是快照读),结尾用 .punch 打卡不变量表。
// 写作铁律三(零 Web 基础,但有校准门槛):读者是后端开发,没有 TS/JS/HTML/CSS 基础。这四样的概念
//   (含 DOM、CSS 样式、选择器等)首次出现,要么当段解释,要么就地进 .primer 发散补充盒
//   (<details> 可折叠,老手跳过、新手必读),并尽量锚一个 Java/CS 对应物;
//   主讲线上只允许出现已解释过的概念。
//   校准门槛:只补"无法从名字或形状一眼认出"的概念——console.log、setTimeout 这类一眼可辨的不提;
//   发散盒宁缺毋滥,别把读者当小白。
// 写作铁律四(业务宇宙):全课程例题逐步收敛到虚构的"订单与支付"业务线(状态机/Result/并发竞态/限流/缓存);
//   新内容一律取材于它;存量例题在各自修订窗口迁移,不批量翻新已审阅内容。
// 禁止连续两段纯 TS/JS 叙述而不回锚。排版上用 .duo 双栏对照组件让映射可见。
// 场次映射:见 phase0-ts-async/AI助学手册.md。
export const CHAPTERS = [
  {
    id: 'c00', group: '阶段 0 · 类型', title: '类型与收窄', mech: '看血统 vs 看体检报告',
    read: String.raw`
<p>这一章讲 TS 的类型系统。但按本课程的规矩，<b>每个概念都先回到你的 Java 世界</b>——先看你已经写了十年的代码和踩过的坑，再看 TS 的孪生长什么样，最后做综合分析：哪里一样、哪里不同、类比在哪里失效。类型系统不是 TS 的发明，它是一门老学科；你在 Java 里付出的每一分学费，这里都能报销。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>类型系统管的是<b>读写的合法性</b>：给变量赋值是一次写，读一个字段是一次读——类型系统的全部工作，就是在编译期判定"这次读写安不安全"。带着这个镜头看，本章机制会各就各位：结构化类型＝写兼容判定；收窄＝同一份数据在不同控制流位置的<b>合法读视图</b>；readonly＝编译期写屏障；zod＝外部数据进门时的第一次读必须验货。它们其实是同一条审计法的五个条款，而本章的暗线也只有一条：<b>让读写审计不断左移</b>——从事故现场，到运行时验货，再到编译期证明。</div>
<details class="primer" open><summary>🧰 发散 · 给 Java 眼睛的语法速查（30 秒，老手可跳）</summary>
<ul>
<li><b>const</b> ≈ final 变量（引用不可重新赋值）；要重新赋值得用 <code>let</code>。</li>
<li><code>(a, b) =&gt; a + b</code> 就是 lambda：<code>(a, b) -&gt; a + b</code>。箭头函数在本课程无处不在，看到箭头请自动翻译成 lambda。</li>
<li><code>name: string</code> ≈ <code>String name</code>——冒号后面跟类型，方向和 Java 相反；<code>string[]</code> ≈ <code>String[]</code>。</li>
<li><code>type Result = ...</code> 是给类型起别名（≈ typedef），本章主角之一；<code>interface</code> 声明形状——两者编译后双双蒸发。</li>
<li><code>JSON.parse(...)</code> ≈ 反序列化：字符串变回对象——名字自解释，知道即可。</li>
<li><b>{ ... } 对象字面量</b>：JS 造对象不用先写类——大括号一对，字段当场写进去，≈ "会带方法的 JSON"。方法还有简写：<code>spring() {}</code> 就是"有个叫 spring 的方法"。Java 人最常愣住的一处：没有 new。</li>
<li><b>function handle(r: Result): number</b> ≈ <code>number handle(Result r)</code>：function 关键字开头，返回类型写在参数表后面（方向和 Java 相反）。</li>
</ul>
</details>
<div class="fourq">
  <div><b>目的</b>让非法状态过不了编译；让"改了一半忘了另一半"的代码在保存时就爆红。</div>
  <div><b>形式</b>结构化类型、联合类型＋收窄、never 穷尽检查。</div>
  <div><b>质料</b>类型标注＋编译器的控制流分析（CFA）。</div>
  <div><b>动力</b>阶段 2 里 React 的 props 契约、状态机的每个分支，全靠它兜底。</div>
</div>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>名义类型的"税"：你在 Java 里天天交</h3>
<p>先看 Java 世界的一件日常烦心事。两个类字段完全相同，就是没有继承关系——赋值？编译器拒绝：</p>
<div class="duo">
  <div class="pane jv"><span class="pane-tag">☕ Java · 名义类型：只认血统</span><pre>class JavaDev  { String name; void spring() {} }
class ReactDev { String name; void spring() {} }

JavaDev me = new JavaDev();
ReactDev alias = me;
// ❌ incompatible types:
//    JavaDev cannot be converted to ReactDev</pre></div>
  <div class="pane ts"><span class="pane-tag">🌐 TS · 结构化类型：只看体检</span><pre>interface JavaDev  { name: string; spring(): void }
interface ReactDev { name: string; spring(): void }

const me: JavaDev = { name: '老王', spring() {} };
const alias: ReactDev = me;
// ✅ 形状相同，赋值合法</pre></div>
</div>
<p>Java 为什么拦？因为它信奉<b>名义类型</b>（nominal typing）：类型是"户口本"，兼容与否看出身。这套纪律很严，但你为它交的税也是真金白银——想想你项目里那些<b>字段一模一样却不能互赋的类</b>：DTO、Entity、VO 三兄弟，最后靠什么和解？手写转换器、<code>BeanUtils.copyProperties</code>、MapStruct。这些工具全家桶的存在本身，就是名义类型收的税。</p>
<p>TS 把这笔税免了，而且它不是异端——你学过的语言里早有结构化的亲戚：<b>Go 的 interface 是隐式实现的，你甚至不用写 implements，长得像就自动满足</b>——那就是结构化类型；Python 的鸭子类型是它的动态形态（"走起来像鸭子就叫它鸭子"＝运行时版的体检报告）；C++ 模板对类型参数的要求也是结构化的。TS 选结构化，是加入了主流的另一阵营，而非标新立异。</p>
<p><b>综合分析：</b>"看形状"只是表象，再往下想一层——<b>赋值是一次写，而写入的真正承诺是"槽声明的每一次读都能兑现"</b>。所以 TS 判断的不是"它们长得像吗"，而是<b>"JavaDev 的每一个可能值，放进 ReactDev 类型的槽里，未来的每一次读会不会扑空？"</b>只要前者的值域覆盖后者的要求，这次写就安全——结构化类型的本质，是对<b>未来读取</b>的担保。类型不是标签，是<b>值的集合</b>；赋值兼容＝集合包含，而包含关系担保的是读。记住这个视角——它是离散数学的集合论，不是什么新发明——后面 never 的怪癖会变得理所当然。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>联合＋收窄：Java 21 刚到货的武器，TS 当日用品</h3>
<p>第二个概念：<b>一个值"要么是成功，要么是失败"</b>。你在 Java 里怎么表达？最诚实的答案是：委屈了很多年。Java 8 时代只能手搓一个抽象父类＋两个子类，或者上 vavr 的 <code>Either</code>；直到 Java 21，sealed interface＋record＋switch 模式匹配才算把官方武器发下来：</p>
<div class="duo">
  <div class="pane jv"><span class="pane-tag">☕ Java 21 · sealed + record + 模式匹配</span><pre>sealed interface Result {
  record Ok(List&lt;String&gt; data) implements Result {}
  record Err(String message) implements Result {}
}

static int handle(Result r) {
  return switch (r) {
    case Result.Ok(var data) -&gt; data.size();
    case Result.Err(var msg) -&gt; msg.length();
  };  // 漏一个分支？编译器直接报错
}</pre></div>
  <div class="pane ts"><span class="pane-tag">🌐 TS · 联合类型 + 判别收窄</span><pre>type Result =
  | { ok: true;  data: string[] }
  | { ok: false; err: string };

function handle(r: Result): number {
  if (r.ok) {
    return r.data.length; // ✅ 收窄：r 必是成功分支
  }
  return r.err.length;    // ✅ 此分支里 r 必是失败分支
}</pre></div>
</div>
<p><b>综合分析：</b>思想一模一样——都是"和类型"（几种可能各占一个分支），都靠一个判别字段（sealed 的子类名 / <code>ok</code> 布尔）来分岔。区别只在体感：Java 21 才标配、写起来要摆半屏；TS 一行定义、<code>if</code> 一写就生效。而且收窄这件事<b>你其实早就用过</b>——Java 16 的模式匹配变量就是它：<code>if (obj instanceof String s) { s.length(); }</code>，编译器知道进了这个分支 s 就是 String——Kotlin 管这叫 smart cast，学名叫<b>控制流类型收窄</b>。TS 把它从 instanceof 推广到了任意判别字段。用读写的话说：走过 <code>if (r.ok)</code> 之后，变窄的不是数据，是<b>你的读权限</b>——"此刻允许读哪些字段"的集合，跟着控制流走。</p>
<h3>never 穷尽检查：Java 21 的"漏分支报错"，TS 的白魔法版</h3>
<p>上面 Java 代码里那行注释值得单独讲：<b>switch 漏了一个分支，编译直接报错</b>——这是 sealed 带来的穷尽性保护。你一定吃过它的反面的亏：老 Java 里给枚举加了新值，全项目的 if-else 链默默漏改，线上才炸。Java 21 的 switch 表达式把这道防线焊死了；TS 用一个奇怪但优雅的技巧，把同样的保护装进了任何分支结构：</p>
<pre>function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return 3.14 * s.r * s.r;
    case 'square': return s.a * s.a;
    default:
      const _exhaustive: never = s; // 漏分支时，这行爆红
      return _exhaustive;
  }
}</pre>
<p>为什么这招<strong>必然</strong>有效？往下挖一层。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>类型的代数：你在大一离散数学里都学过</h3>
<p>用第①层"类型即值的集合"的视角回看，怪东西全部变整齐：<code>A | B</code> 是两个集合的<b>并集</b>（类型论叫和类型）；<code>never</code> 是<b>空集</b>——不存在任何属于它的值；<code>unknown</code> 是<b>全集</b>。于是教科书里的集合代数直接搬进来用：</p>
<pre>string | never  ≡  string      // 集合 ∪ ∅ = 原集合：never 是"加法零元"
A | unknown    ≡  unknown     // 并上全集：unknown 是"吸收元"（所以 any/unknown 会"污染"）
空集是任何集合的子集            // 所以只有 never 能赋给任何类型</pre>
<p>现在穷尽检查的原理可以一句话说破：<b>switch 就是做减法</b>——每处理一个分支，编译器把该构造子从 s 的类型集合里减掉；全处理完，剩下的集合是空集，空集的名字叫 never，所以 <code>const _x: never = s</code> 合法通过；<b>漏了一个分支，剩下的就是那个非空的漏网类型，把它赋给空集类型，当然报错</b>。这不是编译器内置的特判补丁，是集合代数的自然推论——你在数学卷子上写过一百遍"空集是任何集合的子集"。用审计的话说：它证明的是"<b>不存在未被审计的读取分支</b>"。</p>
<h3>收窄的引擎与它的失效边界：一次"事务快照"</h3>
<p>收窄是谁执行的？编译器的<b>控制流分析</b>（CFA）：在每个代码位置为每个变量维护一张"到这里为止已确认的类型"的表——<code>if (r.ok)</code> 的 true 分支入口，表里 r 的条目被改写成成功分支。收窄跟着控制流走，因为这张表本来就跟着控制流走。</p>
<p>但这张表有一条失效边界，后端直觉特别容易在这里翻车：</p>
<pre>function handle(r: Result) {
  if (r.ok) {
    const log = () => r.data.length;  // ✅ 同步闭包：TS 仍然信任收窄
  }
  // 但若 r 是 let、且闭包会【延迟执行】（如 setTimeout 回调），
  // TS 会撤回收窄担保——等你回调跑的时候，r 可能早被改掉了
}</pre>
<p><b>综合分析：</b>这个决策的气味你在后端一定闻过——<b>事务隔离的快照读</b>：你读到的状态只在当前事务内可信；跨时间边界再去读，系统不担保还是原值。TS 的选择是"不信任"，而不是像后端那样"加锁"——因为 JS 主线程根本没有锁（阶段 0 下一章会讲为什么它也不需要）。类比失效点：Java 的担保由锁和内存屏障维护，TS 的担保由"你不能再赋值"的编译期约定维护，一个管运行时，一个管编译时。</p>
<h3>安检门的两副面孔：一次编译器设计的经典权衡</h3>
<pre>interface Point { x: number }

const a: Point = { x: 1, y: 2 };   // ❌ 直接字面量：多余的 y 没申报，拦下
const tmp = { x: 1, y: 2 };
const b: Point = tmp;              // ✅ 绕道变量：放行</pre>
<p>这个 Java 里没有对应物，不妨用"如果 Java 要拦谁拦"来理解它：<code>heigth</code> 式的拼写手滑，Java 世界靠谁拦？没人拦，靠 code review 人肉拦。TS 把这道 code review 自动化进了编译器——但只对<b>字面量</b>启用，因为字面量是"当场新造的人"，类型系统对它有完整信息，多出的字段九成是手滑；而<b>变量</b>可能来自更大的上下文，是合法的"子集传参"（你调后端接口时多带几个字段是常态），拦了会误伤大片。<b>宁可放过、不可错杀</b>——这是编译器设计里的经典权衡，和 Java 数组的协变坑（<code>String[]</code> 能赋给 <code>Object[]</code>，运行时才炸 <code>ArrayStoreException</code>）是同族问题：类型系统每个检查都有成本，收多收少全是取舍。</p>
<div class="depth-tag">第 ④ 层 · 设计立场与边界</div>
<h3>泛型擦除：同一门苦学，两种命运</h3>
<p>泛型擦除你在 Java 里是<b>亲身痛过</b>的：<code>List&lt;String&gt;</code> 和 <code>List&lt;Integer&gt;</code> 运行时是同一个类；<code>new T[]</code> 编不过；Gson 反序列化泛型集合得传 <code>TypeToken</code> 这种黑咒语——因为运行时根本不知道 T 是谁。TS 的泛型更绝：直接<b>真蒸发</b>，编译产物里类型痕迹清零。两条路线不同，原因都是"必须向后兼容"：Java 要兼容 2004 年泛型诞生前的旧 JVM 字节码，TS 要产出普通 JS——而标准 JS 引擎里压根没有"类型"这个运行时概念。</p>
<p>于是推出全章最重要的分工结论——这不是 TS 偷懒，是写进设计纲领的立场：微软官方《TypeScript Design Goals》白纸黑字列着"<b>不向语言中添加运行时类型信息</b>"。所以接口返回的 JSON 长没长对，类型管不着——Java 世界这个活儿是谁干的？Bean Validation／<code>@Valid</code> 入参校验层。前端对应物叫 zod（阶段 3 见）。<b>TS 类型管编译期的法律，zod 管运行时的警察</b>，缺一不可。用读写世界观收个尾：<b>前端的一切外部数据都是"读进来"的——接口返回、localStorage、URL 参数；数据进门的第一读，必须验货。</b></p>
<h3>两颗小雷（都和 Java 的直觉方向相反）</h3>
<ul>
<li><code>readonly</code> 是编译期的<b>写屏障</b>——只授读权限、回收写权限。≈ Java 的 final <b>引用</b>：引用不动，对象照样能掏——<code>final StringBuilder sb</code> 照样能 <code>append</code>，你早知道这两回事。而且 TS 的 readonly 是<b>浅层</b>的，只管第一层属性；真要深层不可变得 <code>as const</code>。类比失效点：它不等于运行时冻结，更不等于 <code>Object.freeze</code>。</li>
<li>Java 的 <code>enum</code> 是一个功能完整的类（可以有字段、方法、构造器）；TS 的 enum 编译后是个<b>运行时对象</b>（数字枚举还带反向映射 <code>Status[1]</code>）——一个想往"类"长，一个意外往"对象"长，方向相反。所以很多 TS 团队禁用 enum，改用字面量联合 <code>type S = 'active' | 'frozen'</code>，顺便白拿收窄能力。</li>
</ul>
<h3>对暗号</h3>
<table>
<tr><th>你熟悉的世界</th><th>TS 前端</th><th>一句话</th></tr>
<tr><td>DTO/VO 转换器、MapStruct（名义类型的税）</td><td>结构化类型</td><td>Go 早就这么干了：形状对就行</td></tr>
<tr><td>Java 21 sealed＋record＋switch</td><td>联合类型＋收窄</td><td>和类型：一个 Java 21 才到货，一个是日用品</td></tr>
<tr><td>instanceof 模式匹配变量（Java 16）</td><td>任意判别字段的收窄</td><td>收窄你其实用过，叫 smart cast</td></tr>
<tr><td>switch 漏分支编译错（穷尽）</td><td>never 穷尽检查</td><td>集合减到空集即 never，漏网必爆红</td></tr>
<tr><td>事务隔离的快照读</td><td>收窄不跨延迟闭包边界</td><td>跨时间边界的状态，编译器拒绝担保</td></tr>
<tr><td>code review 拦 heigth 手滑</td><td>字面量多余属性检查</td><td>宁可放过不可错杀的编译器权衡</td></tr>
<tr><td>List 假擦除＋TypeToken 黑咒语</td><td>真蒸发＋zod</td><td>编译期幻觉，运行时补票</td></tr>
<tr><td>final 引用（StringBuilder 照样 append）</td><td>readonly（浅层、仅编译期）</td><td>引用不动，对象能掏</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>多余属性检查如果连变量赋值也拦，你写过的哪些"传参多带字段"的合法代码会遭殃？这和 Java 数组协变的 <code>ArrayStoreException</code> 权衡方向相反——各自"宁可错杀/宁可放过"了什么？</li>
<li>把你在后端写过的某个"字符串状态机"分别用 Java 21 sealed 和 TS 联合类型各写一遍，数一数各自的行数与样板占比。</li>
<li><code>A | never ≡ A</code> 与 <code>x + 0 = x</code> 同构。顺着代数思路推：<code>A &amp; unknown ≡ ?</code>；"返回 never 的函数"在 Java 里最像哪个方法（提示：<code>System.exit</code>）？</li>
<li>把"审计左移"画成一条时间轴：事故期 → 运行时 → 编译期。把你后端项目的质量手段（单元测试、Bean Validation、静态分析、监控告警）钉到轴上，再把本章五个机制钉上去——你在后端做过的左移，和本章比，谁走得更远？前端又欠了哪一格？</li>
</ol>
<p>回头看整章，其实只有一条主线：<b>让读写审计不断左移</b>。结构化类型把"能不能写"从 code review 提前到保存键；收窄把"此刻能读什么"提前到控制流；never 把"分支漏没漏"钉死在 default 行；zod 守住的，是唯一必须留在运行时的哨位——数据进门的第一次读。<b>审计越左移，事故就越早变成报错；报错越早，修复越便宜。</b>这条左移曲线你不会陌生：后端的"测试左移"、DevSecOps 的"安全左移"，喊的是同一句话——只不过这一次，你是给前端的读写装审计。</p>
<p class="soul">🤔 留给你想：结构化类型让"血统"失效，那 TS 项目里还需要继承吗？什么时候一个 extends 仍然是好设计？提示：想想"复用形状"和"复用行为"的区别——Go 用组合＋接口埋葬了继承，也没耽误事。这个问题想通，你看 React 组件复用的眼光会变。</p>
<p class="punch">📍 <b>不变量打卡</b>：本章往主旋律表里放了两块砖——"怎么不打架"行：readonly＝编译期写屏障、收窄＝控制流内的合法读视图；"数据怎么流动"行：外部数据进门的第一读必须验货（zod）。收尾时把你的新概念填进 <code>notes/不变量表.md</code>，AI 助教收尾时也会提醒你。懒得组织语言？把这行原样抄进表：<code>c00 类型＝编译期读写审计（左移）：结构化＝写担保｜收窄＝读视图｜never＝穷尽｜readonly＝写屏障｜zod＝入口验货</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>JEP 441 · Pattern Matching for switch（Java 21 正式）</b>（<a href="https://openjdk.org/jeps/441" target="_blank">openjdk.org/jeps/441</a>）。sealed＋穷尽 switch 的官方规范，本文"Java 21 到货的武器"的原件。</li>
<li><b>TypeScript 官方手册 · Narrowing / Type Compatibility</b>（<a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html" target="_blank">handbook/2/narrowing</a> · <a href="https://www.typescriptlang.org/docs/handbook/type-compatibility.html" target="_blank">type-compatibility</a>）。收窄与结构化类型的"法条"原文，含多余属性检查只针对新鲜字面量的官方说明。</li>
<li><b>TypeScript Design Goals</b>（<a href="https://github.com/Microsoft/TypeScript/wiki/TypeScript-Design-Goals" target="_blank">github.com/Microsoft/TypeScript → Design Goals</a>）。官方设计纲领："不添加运行时类型信息"——zod 存在的根源，第④层的出处。</li>
<li><b>Effective Go · Interfaces（隐式实现）</b>（<a href="https://go.dev/doc/effective_go#interfaces" target="_blank">go.dev/doc/effective_go</a>）。结构化类型在生产级语言里的最著名实践："如果某个类型——现有类型或新造类型——拥有正确的方法，它就自动满足该接口。"</li>
<li><b>延伸 · 类型即定理</b>：Curry-Howard 对应——"类型即命题、程序即证明"。never 在这个体系里对应"假"（没有值能证明它），所以"返回 never 的函数要么抛异常要么不返回"。想深入读 Philip Wadler《Propositions as Types》（ACM，有公开讲稿）。</li>
</ul></details>`,
    quiz: [
      {
        q: 'Java 世界里"字段完全相同的两个类不能互赋"，产生了什么产业现象？TS 怎么免了这笔税？', kind: 'choice',
        options: [
          { t: '催生了 DTO 转换器全家桶（MapStruct 等）；TS 用结构化类型免单——形状对即可赋值', correct: true, why: '' },
          { t: '催生了 ORM 框架；TS 用 any 免单', correct: false, why: '' },
          { t: '从来不是个问题，Java 也能直接赋值', correct: false, why: '' },
        ],
        why: '名义类型看血统，形状相同也没用，转换器全家桶就是这笔"税"。Go 的隐式接口、Python 鸭子类型是结构化的亲戚——TS 只是加入另一个主流阵营。',
      },
      {
        q: 'TS 的收窄（if (r.ok) 之后 r.data 合法），你在 Java 里的最近亲戚是？', kind: 'choice',
        options: [
          { t: 'Java 16 的 instanceof 模式匹配变量：if (obj instanceof String s)', correct: true, why: '' },
          { t: 'Java 的泛型擦除', correct: false, why: '' },
          { t: 'Java 里没有对应物，这是 TS 独有', correct: false, why: '' },
        ],
        why: '那叫控制流类型收窄（Kotlin 叫 smart cast）：编译器沿控制流记录"此处已确认的类型"。TS 把它从 instanceof 推广到任意判别字段。',
      },
      {
        q: '为什么漏了分支时，default 里那句 never 赋值"必然"爆红？', kind: 'choice',
        options: [
          { t: 'switch 是减法：已处理分支从类型集合里逐个减掉，漏网时剩下非空集合，赋给空集类型（never）当然报错', correct: true, why: '' },
          { t: 'never 是关键字，编译器看到就检查', correct: false, why: '' },
          { t: '运行时才检查，只是报错位置显示在 default', correct: false, why: '' },
        ],
        why: '集合代数：never 是空集，A | never ≡ A（零元）。Java 21 的 sealed switch 用编译器特判实现同一个穷尽保护，TS 用代数性质实现。',
      },
      {
        q: '收窄在"会延迟执行的闭包＋可变变量"面前为什么失效？用后端的一个概念说明编译器的处境。', kind: 'text',
        why: '参考：收窄是对"当前控制流快照"的担保，类似事务隔离的快照读——回调执行时变量可能已被改写，跨时间边界的状态无法担保；TS 选择不信任而非加锁。答到"快照/时机变化/拒绝担保"即过关。',
      },
    ],
    sim: { type: 'narrow' },
  },

  {
    id: 'c02', group: '阶段 0 · 异步', title: '事件循环', mech: '单线程＋两级队列',
    read: String.raw`
<p>初学前端时，你大概率会冒出这个疑问（甚至有点想笑）："JS 是单线程的？那怎么同时伺候一个页面上的几十个请求、动画、点击？"——先别急着下结论，把这句话的主语换掉："单个 EventLoop 线程，怎么同时伺候几千个连接？"是不是你在 Netty 里天天回答的题？<b>同一道题，同一个答案：不等待，登记回调，就绪了再跑。</b>这一章就把 JS 的"调度器"拆开看：直觉、机制、规范里怎么写、以及它在 Node 里的变体。看完你就懂 await 的真面目，以及"前端卡了"九成是"某个函数跑太久"这句话的技术根源——你会发现，这台机器你其实早就维护过。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>把页面想成一个<b>小型数据库</b>：JS 堆里的状态是它的数据，事件循环就是它的<b>存储引擎</b>——单线程串行化处理每一次读写。微任务是本次读写触发的<b>级联操作</b>（必须同批完成），宏任务是排队的下一个请求，渲染是定期把内存态<b>读</b>给屏幕的快照。本章讲的全部调度规则，就是这个存储引擎的读写排队章程。</div>
<div class="fourq">
  <div><b>目的</b>单线程永不阻塞，还能同时"等"一百个 I/O。</div>
  <div><b>形式</b>调用栈＋微任务队列＋宏任务队列，事件循环三拍。</div>
  <div><b>质料</b>任务（task）、微任务（microtask）、调用栈帧。</div>
  <div><b>动力</b>Promise/async、阶段 2 的 React 并发调度、S8 要手写的 Promise，全是它的下游。</div>
</div>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>唯一的售票窗口</h3>
<p>Java 的 <code>Future.get()</code> 可以理直气壮把线程睡到结果回来。JS 不行：主线程是<b>唯一的售票窗口</b>，它一睡，渲染、点击全部停摆——你等的不只是那个结果，是全页面的命。两个世界的第一句暗号长这样：</p>
<div class="duo">
  <div class="pane jv"><span class="pane-tag">☕ Java · 阻塞式等待（雇了人等）</span><pre>Future&lt;String&gt; f = pool.submit(ioTask);
String r = f.get();   // 线程睡到结果回来
// 睡着的是这个线程,不是全世界
renderUI();           // 别的线程照常干活</pre></div>
  <div class="pane ts"><span class="pane-tag">🌐 JS · 让出式等待（登记叫号）</span><pre>const p = ioTask();        // I/O 在飞
const r = await p;         // 让出:余下代码登记为微任务
// 没有线程在睡,是主线程"先去忙别的"
renderUI();                // await 之后才会执行</pre></div>
</div>
<p>所以 JS 社区二十年只研究一件事：<b>优雅地让出，再被叫回来</b>。你在 Netty 里见过这个物种：Reactor 线程永不阻塞，注册回调，就绪事件到了再处理。事件循环就是 Reactor 模式，只是这次雇的"worker"是你的浏览器标签页。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>三拍节奏（背下它，时序题永远查得到原因）</h3>
<pre>第一拍：把调用栈跑空（同步代码说到就到，从不排队）
第二拍：只要栈空，就清空整个微任务队列（Promise.then / queueMicrotask / await 余下代码）
        —— 注意：微任务里新生的微任务，同轮一起清
第三拍：取【一个】宏任务执行（setTimeout / I/O 回调），跑完回到第一拍</pre>
<details class="primer"><summary>🧰 发散 · Promise 是什么（没写过 JS，先展开补上这块）</summary>
<ul>
<li><b>Promise</b>：一个"承诺对象"——此刻还没有结果，将来必有。≈ Java 的 CompletableFuture，但有一个根本区别：<b>JS 的 Promise 没有 get()，永远不能阻塞等待</b>，只能用 <code>.then(cb)</code> 往上挂回调；结果一到，cb 被塞进微任务队列执行。<code>Promise.resolve(1)</code> ＝ 一个已经完成、值为 1 的承诺。setTimeout 的调度语义正文和模拟器会反复讲，此处不赘。</li>
<li><b>async / await</b>：Promise 的语法糖，第③层马上拆开。先背一句："await ＝ 让出，并把余下代码登记为微任务。"</li>
</ul>
</details>
<p>拿经典题演算（右侧模拟器 ① 可单步验证）：</p>
<pre>console.log('1');                               // 第一拍：打印 1
setTimeout(() => console.log('2'), 0);          // 登记：宏任务 ← cb2
Promise.resolve().then(() => console.log('3')); // 登记：微任务 ← cb3
console.log('4');                               // 第一拍：打印 4
// 栈空 → 第二拍：清微任务，打印 3 → 第三拍：取宏任务，打印 2
// 答案：1,4,3,2 —— setTimeout 的 0 是"尽快"，不是"现在"</pre>
<p>注意第二拍的精确表述：规范说的不是"每个宏任务之后清一次微任务"，而是"<b>每当执行栈为空，先执行微任务检查点</b>"。这个差别在模拟器 ④ 里看得很清楚：两条 then 链的回调在同一轮微任务清空里你一个我一个地交错执行——队列只有一条，公平轮转，没有"整链插队"。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>Run-to-completion：JS 为什么天生没有数据竞争</h3>
<p>事件循环有一条比"两级队列"更根本的宪法：<b>一个任务一旦开始执行，就一定跑到结束，中间不会插入任何其他任务</b>——这叫 run-to-completion。它的深意值得单独讲：你后端用 synchronized、CAS、并发容器千辛万苦买来的"串行化访问"，JS 出生就自带——<b>整个 JS 世界相当于只有一把全局锁，而且每个任务自动持锁到跑完</b>。所以 JS 里没有两个线程同时改同一个变量的可能性，数据竞争这个词在主线程上根本不存在。用读写世界观说：后端数据库用锁＋事务＋MVCC 把并发读写串行化，前端的存储引擎用"只雇一个员工"达成同一个目的——<b>串行化的两条路：加锁 vs 排队。</b></p>
<blockquote class="spec">If the running task is allowed to run to completion, no other task can interrupt it before it finishes.
<span class="src">—— 这不是引文，是宪法的意译；原文见 WHATWG HTML Standard §8.1.7 "Processing model" 与 ECMAScript 规范的 JobQueue 机制</span></blockquote>
<p>代价也明码标价：任务不可分割，所以<b>任何一个任务跑太久，全体陪绑</b>。浏览器给每个任务定了软预算：单个任务超过 50ms 就算"长任务"（Long Task），就可能挤掉渲染导致掉帧——"前端卡了＝某个函数跑太久"，根源就是这条宪法。</p>
<h3>渲染插在哪一拍：帧预算的真相</h3>
<p>任务和任务之间，浏览器还有一件事要做：<b>渲染</b>。完整的节拍其实是：</p>
<pre>取一个宏任务 → 清空微任务 → 【渲染机会：requestAnimationFrame → 样式 → 布局 → 绘制】→ 下一个宏任务</pre>
<p>这个"渲染机会"解释了一个经典工程问题：用 <code>setTimeout(fn, 0)</code> 做动画必掉帧——宏任务一轮最少间隔约 4ms，且不与屏幕刷新率（60Hz 即 16.7ms 一帧）对齐；而 <code>requestAnimationFrame</code> 被安排在渲染机会的开头，天然和帧对齐。再推一步：如果有一个任务跑了 200ms，这中间没有任何渲染机会，用户看到的就是 12 帧的冻结——这也是阶段 2 里 React 时间切片要解决的同一个问题：<b>把长任务切成小片，给渲染机会让路。</b></p>
<h3>await＝让出，不是等待</h3>
<p><code>async</code> 函数<b>不创建任何线程</b>。执行到 <code>await</code>：余下代码被登记成微任务，栈帧弹出，主线程归还——这叫<b>让出</b>（yield），不叫阻塞。模拟器 ③ 会让你亲眼看到"end 抢在 a3 前面"的现场。同理，<code>Promise.all</code> 是并发<b>等待</b>，不是并行计算：单线程同时挂起一百个 I/O，谁的响应先到先处理谁。</p>
<h3>两种死法：卡死 vs 饿死</h3>
<p>同步 <code>while(true)</code> 是<b>卡死</b>：栈永远退不出。微任务无限递归（<code>then(loop)</code> 自循环）是<b>饿死</b>：栈其实每次都空了，但微任务检查点永远清不完队列，永远走不到"取宏任务"和"渲染机会"那两步——模拟器 ② 里那个 100ms 的"逃生舱"，你永远等不到它响。用读写世界观说，这就是<b>级联写永不收敛</b>：像数据库里两个触发器互相触发，这个事务永远提交不了，排在后面的所有请求全部饿死。对照后端：往最高优先级队列塞自旋 job，低优先级队列全部饿死，自己 DoS 自己。</p>
<h3>Node 的变体：同一台戏，六个幕间</h3>
<p>Node 的事件循环是同一思想的变体：循环分六个 phase（定时器、待处理回调、poll、check 等），每个 phase 是一组宏任务的"幕间"；另外加了一个比微任务还急的 <code>process.nextTick</code> 队列。你只需要记住结构：<b>浏览器版＝一条宏任务队列＋一条微任务队列；Node 版＝六组宏任务队列＋一条 nextTick＋一条微任务。</b>细节阶段 3 写 mock 服务时用到了再查。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>JS 前端</th><th>一句话</th></tr>
<tr><td>Future.get()</td><td>await</td><td>一个阻塞，一个让出</td></tr>
<tr><td>Netty EventLoop / Reactor</td><td>事件循环</td><td>不等待，登记回调，就绪再跑</td></tr>
<tr><td>synchronized / CAS（买的串行化）</td><td>run-to-completion（自带的串行化）</td><td>全局一把锁，任务自动持锁到跑完</td></tr>
<tr><td>高优先级就绪队列</td><td>微任务队列（栈空即清）</td><td>清不空就饿死下一拍</td></tr>
<tr><td>刷盘时机 / 提交间隔</td><td>渲染机会（帧预算 16.7ms）</td><td>长任务挤掉渲染，用户看到冻结</td></tr>
<tr><td>没人 get() 的 Future，异常烂尾</td><td>unhandledRejection 崩进程</td><td>前端更记仇</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>为什么规范强制"then 的回调永远异步执行"（哪怕 Promise 已 resolved）？设想允许同步执行，调用方要写几套逻辑？</li>
<li>用"帧预算"的语言向产品经理解释：为什么列表一次渲染一万行会白屏，分批渲染就不卡？哪个数字是关键？</li>
<li>run-to-completion 让 JS 没有 data race，但 Promise 链里两个 async 函数并发读写同一个对象，仍可能产生"逻辑竞态"（门诊 4 号）。串行化解决了指令级竞争，解决不了"时序假设"——这两者的分界线在哪？</li>
</ol>
<p class="soul">🤔 留给你想：Netty 的 EventLoop 可以开多个（一个端口绑一个），JS 主线程只有一个。既然多开 EventLoop 能提高吞吐，浏览器为什么死活只给 JS 一个主线程？提示：想想两个任务同时摸 DOM 会发生什么——run-to-completion 只保证任务不互相打断，可保证不了两个"主线程"不互相踩。这个问题的答案，就是 Web Worker 为什么"通信靠消息、不能碰 DOM"。</p>
<p class="punch">📍 <b>不变量打卡</b>：本章填的是"谁说了算"行——事件循环就是前端的<b>读写调度器</b>，微/宏任务两级队列是读写请求的排队章程；顺带在"数据怎么流动"行记一笔——单线程并发等待一百个 I/O，排队≠不并发。回 <code>notes/不变量表.md</code> 打卡。可复制：<code>c01 事件循环＝前端的存储引擎（读写的调度器）；微任务＝级联写同批完成；渲染＝快照读；run-to-completion＝排队式串行化</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>MDN · 并发模型与事件循环</b>（<a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop" target="_blank">developer.mozilla.org → Event_loop</a>）。调用栈、堆、队列三件套的官方图解，本文三拍节奏的原文出处。</li>
<li><b>Jake Archibald · Tasks, microtasks, queues and schedules</b>（<a href="https://web.dev/articles/task-microtask" target="_blank">web.dev → task-microtask</a>）。微任务检查点的最著名深度长文，作者是 WHATWG HTML 规范编辑——他写的就是法条本身。</li>
<li><b>WHATWG HTML Standard · Event Loops（§8.1.7 Processing model）</b>（<a href="https://html.spec.whatwg.org/multipage/webappapis.html#event-loops" target="_blank">html.spec.whatwg.org → event-loops</a>）。法条原文：任务选择、微任务检查点、渲染机会的完整步骤，本文第③层的每句话都能在这里对到编号。</li>
<li><b>web.dev · Long Tasks / INP</b>（<a href="https://web.dev/articles/optimize-long-tasks" target="_blank">optimize-long-tasks</a>）。50ms 长任务预算与帧预算的工程口径，Google 官方性能指南。</li>
<li><b>Node.js 官方 · Event Loop 指南</b>（<a href="https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick" target="_blank">nodejs.org → event-loop-timers-and-nexttick</a>）。六 phase 与 nextTick 的服务端变体，浏览器版学完再看，Netty 既视感。</li>
</ul></details>`,
    quiz: [
      {
        q: '输出顺序是？', kind: 'choice',
        code: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
        options: [
          { t: '1,4,3,2', correct: true, why: '' },
          { t: '1,2,3,4', correct: false, why: '' },
          { t: '1,4,2,3', correct: false, why: '' },
        ],
        why: '第一拍同步跑完（1,4）→ 第二拍清微任务（3）→ 第三拍取一个宏任务（2）。setTimeout 的 0 是"尽快"，不是"现在"。',
      },
      {
        q: '第二拍的精确含义是？', kind: 'choice',
        options: [
          { t: '每个宏任务执行完，清一次微任务队列', correct: false, why: '' },
          { t: '每当执行栈为空，执行微任务检查点：清空整个微任务队列，新生的微任务同轮一起清', correct: true, why: '' },
          { t: '每 16.7ms 清一次微任务队列', correct: false, why: '' },
        ],
        why: '"栈空即清"才是规范原文（microtask checkpoint）。所以纯微任务程序也会不断清队列——这正是饿死宏任务的机制。',
      },
      {
        q: 'run-to-completion 给了 JS 什么？代价是什么？', kind: 'choice',
        options: [
          { t: '给了天生的串行化（无数据竞争）；代价是任务不可分割，长任务全体陪绑', correct: true, why: '' },
          { t: '给了多核并行；代价是内存翻倍', correct: false, why: '' },
          { t: '给了异常安全；代价是没有栈信息', correct: false, why: '' },
        ],
        why: '整个 JS 世界≈一把全局锁＋任务自动持锁到跑完——后端用 synchronized/CAS 买的东西它出生就有。但"指令级串行"≠"时序正确"，门诊 4 号的响应乱序就是反例。',
      },
      {
        q: '用 setTimeout(fn, 0) 逐帧更新动画为什么必掉帧？说出两个数字。', kind: 'text',
        why: '参考：宏任务最少间隔约 4ms 且不与刷新对齐；屏幕 60Hz 时帧预算 16.7ms，渲染只发生在"渲染机会"里（rAF 对齐帧）。超长任务还会挤掉渲染机会造成冻结。答出 4ms/16.7ms 任意两个数字＋渲染机会位置即过关。',
      },
    ],
    sim: { type: 'eventloop' },
  },

  {
    id: 'c01', group: '阶段 0 · 泛型', title: '泛型与蒸发', mech: '真擦除 vs 假擦除',
    read: String.raw`
<p>承接 c00 的两句话：类型是<b>值的集合</b>，类型系统是<b>读写合法性的编译期审计</b>。本章主角泛型，你在 Java 里天天写——List&lt;Order&gt;、Repository&lt;T&gt;、ResponseEntity&lt;T&gt;。但 TS 的泛型藏着一个和 Java 方向相反的秘密：<b>Java 假擦除，TS 真蒸发</b>。本章把这个秘密挖到底，因为它直接决定了另一件大事：<b>前端数据进门要不要验货。</b>例题全部来自我们的业务宇宙——订单与支付。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>泛型管的是读写的<b>形状参数化</b>：函数与容器对"将来流进来的数据长什么样"留一个占位符，编译期再兑现。而 TS 泛型的全部担保都在编译期一次性兑现，运行时颗粒无收——所以<b>外部数据进门的第一读，必须另设关卡</b>。本章暗线：同样是擦除，Java 是历史包袱，TS 是刻意立场；立场的代价由谁付？由"进门第一读"付。</div>
<div class="fourq">
  <div><b>目的</b>一套逻辑服务无限形状；让"形状错误"在编译期爆红。</div>
  <div><b>形式</b>类型参数、约束 extends、工具类型（Omit / Partial / Pick / keyof）。</div>
  <div><b>质料</b>编译期的类型运算——类型级的函数。</div>
  <div><b>动力</b>阶段 2 的 React 泛型组件、TanStack Query 的泛型客户端，全靠它。</div>
</div>
<details class="primer"><summary>🧰 发散 · 尖括号与工具类型（30 秒，老手可跳）</summary>
<ul>
<li><b>&lt;T&gt;</b> 读作"类型 T 的占位符"，≈ Java 泛型的 &lt;T&gt;；调用时可显式给 <code>first&lt;Order&gt;(list)</code>，也可以让编译器从实参推断。</li>
<li><b>&lt;T extends X&gt;</b> ≈ Java 的 bounded type：进来的形状必须满足 X，否则编译不过。</li>
<li><b>T[]</b> ≈ T 数组；<code>: number</code> 冒号后跟类型（c00 讲过，方向和 Java 相反）。</li>
<li><b>Omit / Partial / Pick / keyof</b> 是"工具类型"——编译期就帮你算出新类型的预置函数，本章各出场一次。</li>
<li><code>const { cost, ...rest } = o</code> 是解构：把 cost 单独拎出来，剩下的打包成 rest——一行顶十行字段复制。</li>
</ul>
</details>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>把"形状里的变量"提成参数</h3>
<p>先看你在 Java 里写过一百遍的东西——"取列表第一项"本来要为每种类型写一遍，泛型把它提成参数：</p>
<div class="duo">
  <div class="pane jv"><span class="pane-tag">☕ Java · 假擦除（运行时还有 List）</span><pre>static &lt;T&gt; T firstOf(List&lt;T&gt; list) {
  return list.get(0);
}

// 调用:编译器插入 checkcast 强转
Order o = firstOf(orders);</pre></div>
  <div class="pane ts"><span class="pane-tag">🌐 TS · 真蒸发（运行时查无此人）</span><pre>function first&lt;T&gt;(list: T[]): T {
  return list[0];
}

// 调用:类型实参只在编译期
const o = first&lt;Order&gt;(orders);</pre></div>
</div>
<p><b>综合分析：</b>直觉完全一致——把形状里的变量提成参数，用"未知"换"复用"。用 c00 的值集合视角说：<code>T[]</code> 的承诺是"无论将来 T 是什么集合，读出来的元素都在 T 里"——<b>对未知的读写，先立好契约</b>。真正的分歧在擦除方式，压到第③层揭盅。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>约束与工具类型：投影即读权限</h3>
<p>约束你直接平移：<code>&lt;T extends { id: string }&gt;</code> ＝ "只有长着 id 字段的形状才配进来"，≈ Java 的 bounded type。真正新鲜的是<b>工具类型</b>——订单域的第一个实战：</p>
<pre>interface Order {
  id: string;
  buyer: string;
  total: number;
  cost: number;   // 进货成本——绝不能出现在前端!
}

type OrderView = Omit&lt;Order, 'cost'&gt;;   // 投影:对外视图

function toView(o: Order): OrderView {
  const { cost, ...rest } = o;   // 解构:cost 单拎,其余打包
  return rest;
}</pre>
<p>后端算出来的 <code>cost</code> 字段绝不该流出到前端——<code>Omit</code> 不是性能优化，是<b>读权限的声明</b>：谁拿到了 OrderView，谁就<b>拿不到</b>读 cost 的资格，多读一个字段编译器当场拦下。这 ≈ 你后端的 VO/DTO 投影，只是从"运行时复制字段"变成"编译期改写形状"。再看 PATCH 语义的老朋友：</p>
<pre>function patch(o: Order, p: Partial&lt;Order&gt;): Order {
  return { ...o, ...p };   // ...展开:把 o 的字段抄一遍,再用 p 的覆盖
}</pre>
<p><code>Partial&lt;Order&gt;</code> ≈ "每个字段都变成可选"——正是 HTTP PATCH 的类型化表达。<b>类比失效预警：</b><code>patch(order, { total: undefined })</code> 和"没传 total"在 Partial 眼里一个样——<b>"可缺"不等于"可空"</b>，这个鸿沟你在 Java 里用 <code>@NotNull</code> 组合堵过，前端同样要用运行时校验堵（zod，阶段 3）。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>擦除：同一门苦学，两种命运</h3>
<p>Java 泛型是<b>假擦除</b>：为兼容 2004 年泛型诞生前的旧字节码，<code>List&lt;String&gt;</code> 运行时只是 List，元素是 Object，读取靠编译器偷塞的 checkcast 强转。但也因为类型签名写在声明处，反射还能摸到——<code>getGenericType()</code> 真的能拿到 List&lt;String&gt; 的 String；Gson 的 TypeToken 就是用匿名子类硬造一个"声明处"来骗反射的黑咒语。</p>
<p>TS 是<b>真蒸发</b>：它的产物就是普通 JS，而标准 JS 引擎里根本没有"类型"这个运行时概念——不是不想留脚印，是纸都不存在。右侧模拟器摆了三大铁案：泛型函数全蒸发、interface 整块蒸发、<b>enum 叛徒留脚印</b>。擦除的读写后果一句话：<b>运行时读到的数据是裸的</b>——typeof 只能告诉你它是个 object，字段对不对、类型对不对，没有任何担保。连 <code>new T()</code> 两边都不行，理由恰好对应两种擦除：Java 不知道 T 的构造器；TS 的产物里 T 压根不存在。</p>
<div class="depth-tag">第 ④ 层 · 设计立场与边界</div>
<h3>立场与分寸</h3>
<p>TS 真蒸发不是偷懒，是写进设计纲领的立场（官方 Design Goals："不向语言中添加运行时类型信息"）；Java 也在翻案路上——Valhalla 项目想给 JVM 带来值类型与泛型特化，十几年了还在路上。立场定了，代价就定了：<b>TS 类型管编译期的法律，运行时必须有另一个警察</b>（zod）——数据进门的第一读必须验货。最后是分寸：<b>泛型是参数化的抽象，抽象是要还的债</b>。"第二个具体场景出现之前，不写泛型"——这条纪律你在后端遵守过（别过早抽象 Repository 顶层数），前端一模一样。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>TS 前端</th><th>一句话</th></tr>
<tr><td>List&lt;Order&gt; 假擦除＋checkcast</td><td>真蒸发＋运行时裸奔</td><td>担保全部在编译期兑现</td></tr>
<tr><td>反射摸声明处泛型（TypeToken 骗局）</td><td>不需要——反正蒸发</td><td>声明处 vs 使用处的差别</td></tr>
<tr><td>&lt;T extends Comparable&gt;</td><td>&lt;T extends { id: string }&gt;</td><td>bounded type：有门槛才准进</td></tr>
<tr><td>VO/DTO 投影</td><td>Omit / Pick</td><td>投影即读权限，Omit 出成本价</td></tr>
<tr><td>PATCH ＋ @NotNull 校验</td><td>Partial ＋ zod</td><td>可缺 ≠ 可空</td></tr>
<tr><td>过早抽象的债</td><td>过度泛型的债</td><td>第二个场景再抽象</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>OrderView 少了 cost——如果某天内部工具确实要看成本，投影怎么改？"谁能读 cost"这件事，类型说了算还是权限系统说了算？边界画在哪？</li>
<li><code>patch(order, { total: undefined })</code> 会把 total 变成什么？"可缺"和"可空"的鸿沟，你在 Java 里用什么注解组合堵过？前端的对应用法是什么？</li>
<li>Java 擦除后留了 List 容器，TS 连容器都不留。这两种"留"与"不留"，分别让哪些 bug 更晚/更早暴露？（提示：一个是运行时强转炸，一个是字段读 undefined）</li>
</ol>
<p class="soul">🤔 留给你想：泛型是"参数化的形状"，抽象是要还的债。你在后端信奉"三次原则"还是"第二个场景就抽象"？React 组件马上要面对同样的抉择——一个按钮组件，先写死文案，还是第一天就泛型化？想通这个，你就有了组件 API 设计的第一直觉。</p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>TypeScript 官方手册 · Generics</b>（<a href="https://www.typescriptlang.org/docs/handbook/2/generics.html" target="_blank">handbook/2/generics</a>）。泛型、约束、工具类型的法条原文。</li>
<li><b>TypeScript Design Goals</b>（<a href="https://github.com/Microsoft/TypeScript/wiki/TypeScript-Design-Goals" target="_blank">Design Goals</a>）。"不添加运行时类型信息"的官方立场，第④层的出处。</li>
<li><b>Oracle Java 教程 · Type Erasure</b>（<a href="https://docs.oracle.com/javase/tutorial/java/generics/erasure.html" target="_blank">docs.oracle.com → erasure</a>）。Java 假擦除的官方说明：替换类型为限定类型、插入强转、桥方法。</li>
<li><b>OpenJDK · Valhalla（JEP 401 Value Classes）</b>（<a href="https://openjdk.org/jeps/401" target="_blank">openjdk.org/jeps/401</a>）。Java 真泛型与值类型的漫长翻案路，读了就知道"历史包袱"四个字有多重。</li>
</ul></details>`,
    quiz: [
      {
        q: 'first([1, 2, 3])（数组是 number[]）之后，T 是什么？运行时还在吗？', kind: 'choice',
        options: [
          { t: '编译期推断 T = number；运行时类型蒸发，只是普通函数', correct: true, why: '' },
          { t: '编译期和运行时 T 都是 number', correct: false, why: '' },
          { t: 'T 要显式写出，否则编译报错', correct: false, why: '' },
        ],
        why: '推断让你不必写 first<number>(...)；但全部担保在编译期兑现，产物里 first 就是个普通函数——真蒸发。',
      },
      {
        q: 'OrderView = Omit<Order, "cost"> 这个动作，本质是什么？', kind: 'choice',
        options: [
          { t: '读权限的声明：拿到 OrderView 的人读不到 cost，多读编译器就拦', correct: true, why: '' },
          { t: '性能优化：少复制一个字段', correct: false, why: '' },
          { t: '运行时的加密', correct: false, why: '' },
        ],
        why: '投影即读权限——VO/DTO 投影的类型化版本。但记住：运行时数据没有类型，真要拦住"没投影的对象"，还得 zod 验货。',
      },
      {
        q: '在编译产物里找 interface Order，结果是？', kind: 'choice',
        options: [
          { t: '一行不剩——它只存在于编译期', correct: true, why: '' },
          { t: '变成一段注释保留下来', correct: false, why: '' },
          { t: '变成一个空对象', correct: false, why: '' },
        ],
        why: 'interface 是纯编译期幻象。对照 Java：接口编译后是真实的 .class 文件，反射可见——这是两种擦除最直观的差别。',
      },
      {
        q: '"第二个具体场景出现之前，不写泛型"——用后端的话说明这条纪律防的是什么？', kind: 'text',
        why: '参考：防过早抽象。只有一个场景时你不知道"变量"该提在哪，猜错了泛型比重复更难改；两个场景对照，参数自然浮出。组件 API 设计同理（阶段 2 见）。',
      },
    ],
    sim: { type: 'erase' },
  },

  {
    id: 'c03', group: '阶段 0 · 异步', title: 'Promise 预演', mech: '异步读的凭证化',
    read: String.raw`
<p>下一站是全仓库的第一个禁写区：从空文件手写 MyPromise（S4/S5）。规矩是 AI 不给代码、只提问——所以本章也守同样的纪律：<b>只带你看 Promise 的"外部行为"</b>——凭证怎么流转、链怎么排队、错误怎么传播；至于内部怎么存、怎么排，一个字不漏，那是你要亲手长的东西。看完本章，你应该带着三连问走进禁写区，而不是带着答案。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>Promise 管的是<b>异步读的凭证化</b>：数据还没到，先给你一张取件凭证；凭证有状态（待定 / 已兑现 / 已拒绝），单向流转、一经定档永不更改；凭证之间串成链，错误沿链穿透，也可以半路兜底。一句话：<b>Promise 把"未来某刻的一次读"变成了可传递、可组合的对象</b>——这是"数据怎么流动"这条不变量在前端的第一个正式答案。</div>
<div class="fourq">
  <div><b>目的</b>把"回调地狱"变成可组合的凭证链。</div>
  <div><b>形式</b>三状态单向流转 ＋ then 登记 ＋ 微任务执行。</div>
  <div><b>质料</b>状态、值/原因、一张回调登记表。</div>
  <div><b>动力</b>S4/S5 你要亲手造它；async/await 是它的语法糖；阶段 3 的 TanStack Query 内部全是它。</div>
</div>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>一张取件凭证：CompletableFuture 的 TS 表亲</h3>
<div class="duo">
  <div class="pane jv"><span class="pane-tag">☕ Java · CompletableFuture</span><pre>CompletableFuture&lt;Order&gt; f =
    fetchOrder(id);

f.thenApply(o -&gt; o.total())
 .exceptionally(e -&gt; fallback());</pre></div>
  <div class="pane ts"><span class="pane-tag">🌐 TS · Promise</span><pre>const f = fetchOrder(id);
// Promise&lt;Order&gt;:此刻还没结果

f.then(o =&gt; o.total)
 .catch(() =&gt; fallback());</pre></div>
</div>
<p>下单之后商家给你一张<b>取件凭证</b>：现在没货，凭证在手上，货到凭凭证取。两个世界的结构一模一样——<b>数据还没到，读的资格先发给你</b>。差别在下一层：Java 的 Future 还留着 <code>get()</code> 这个阻塞后门，JS 的 Promise 从宪法层面删掉了它（c02 讲过：主线程是唯一售票窗口）。</p>
<details class="primer"><summary>🧰 发散 · 本章用到的 Promise 签名（c02 认识了承诺对象，这里补齐签名）</summary>
<ul>
<li><b>p.then(onFulfilled, onRejected)</b>：两个回调都可以省——省掉的那个位置等于"本环节不处理"，错误/值会照规矩穿透。</li>
<li><b>p.catch(onRejected)</b> ≈ <code>p.then(undefined, onRejected)</code>，纯语法糖，在链尾设卡用。</li>
<li><b>Promise.resolve(v) / Promise.reject(e)</b>：直接造一张已定档的凭证。</li>
<li><b>Promise.all([...]) / Promise.race([...])</b>：组合器，第③层细讲。</li>
</ul>
</details>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>凭证的一生：三状态、单向、不可逆</h3>
<p>凭证只有三种状态，且流转是<b>单向单次</b>的：</p>
<pre>pending（待定：值还没到）
   ├──&gt; fulfilled（已兑现：锁进一个值）   —— 只能走一次
   └──&gt; rejected （已拒绝：锁进一个原因） —— 只能走一次
定档之后【永不更改】≈ 事务提交后不可回滚</pre>
<p><code>then(onFulfilled, onRejected)</code> 是唯一的登记口：凭证未定档，回调挂进登记表等；凭证一定档，登记的回调全部推入微任务队列；<b>已定档的凭证再挂回调，照样异步执行</b>——规范强制，保证"同步异步一套逻辑"。模拟器 ① 把这张凭证的一生拆成了五步，去走一遍。</p>
<h3>链式：每个 then 都返回一张新凭证</h3>
<p><code>p.then(cb)</code> 的返回值<b>不是 p 自己</b>，是一张新凭证：cb 的返回值成为新凭证的值；cb 返回的如果又是一张凭证，那就<b>平化</b>——等内层定档，值透传（≈ Java 的 thenCompose，只是 TS 天然平、不用选 API）。值就这样沿链一站一站传递。模拟器 ② 用三张凭证演示了"一拍一拍向前"。</p>
<h3>错误：穿透，直到有人接住</h3>
<p>链中某环 rejected 且这个环节没给 onRejected → 错误<b>原样穿透</b>到下一环，≈ 异常一路上抛；某个环节的 onRejected 执行并返回了正常值 → <b>该环节的凭证"修复"回 fulfilled</b>，后续照常走，≈ catch 里 return 一个兜底值。模拟器 ③ 的"危险姿势"（只给成功回调）值得反复看——门诊 1 号的病灶和它同族。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>两个设计决定与一组组合器</h3>
<p><b>为什么"then 必异步"？</b>设想已定档凭证同步执行回调：同一段代码，凭证未定档时回调晚跑、已定档时立刻跑——调用方被迫写两套逻辑。规范一刀切：<b>永远异步</b>，一致性的代价是固定的一拍延迟，值。</p>
<p><b>组合器：</b><code>Promise.all([p1, p2])</code> ≈ CountDownLatch——全部兑现才交付，一票否决；<code>Promise.race</code> ≈ 谁先定档谁赢（门诊 4 号的响应竞态，正规解法之一就是它）。S5 你会亲手实现这两个，先把语义背熟。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>TS 前端</th><th>一句话</th></tr>
<tr><td>thenApply / thenCompose</td><td>then（返回凭证自动平化）</td><td>一个要手动选，一个天然平</td></tr>
<tr><td>exceptionally</td><td>then 第二参 / catch</td><td>兜底读</td></tr>
<tr><td>CountDownLatch</td><td>Promise.all</td><td>全员到齐，一票否决</td></tr>
<tr><td>完成前 get() 阻塞</td><td>永远没有 get()</td><td>宪法差异：排队 vs 阻塞</td></tr>
<tr><td>CompletableFuture 定稿不可变</td><td>凭证定档不可逆</td><td>写一次，封账</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>门诊 1 号的病灶是"then 里忘了 return"。用凭证的语言复述一遍：那一环的新凭证被定档成了什么？下游拿到的是什么？</li>
<li>如果规范允许"已定档凭证同步执行回调"，同一个函数的调用方要写哪两套逻辑？举一个会炸的具体场景。</li>
<li>all 的"一票否决"并不总对：同时查三个订单详情，坏了一个你还想要另外两个的结果——语义该是什么？查查 allSettled，说说它放弃了什么、换来了什么。</li>
</ol>
<p class="soul">🤔 留给你想：凭证把"未来的读"变成了可以传递、组合、排队的对象。你后端的 MQ 干的是同一件事——把"未来的处理"凭证化成一条消息。它们像在哪？不像在哪？（提示：消息会丢、会重，凭证呢？）这个问题想通，阶段 3 的"服务端状态缓存"你会有既视感。</p>
<p class="punch">📍 <b>不变量打卡</b>：本章在"数据怎么流动"行再放一块砖——<b>异步读的凭证化</b>：把"未来某刻的一次读"变成可传递、可组合的对象。可复制：<code>c03 Promise＝异步读的取件凭证；三状态单向定档＝写一次封账；then 链＝级联读排队；穿透与修复＝错误的传递与兜底</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>MDN · Promise</b>（<a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank">developer.mozilla.org → Promise</a>）。API 法条：then/catch/all/race 的签名与语义。</li>
<li><b>Promises/A+ 规范</b>（<a href="https://promisesaplus.com" target="_blank">promisesaplus.com</a>）。三状态单向流转、then 必异步的原文——S4/S5 禁写区对拍的理论依据，实现卡壳时读它第 2、3 节。</li>
<li><b>Domenic Denicola · We have a problem with promises</b>（<a href="https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html" target="_blank">pouchdb.com 经典长文</a>）。五大常见错误，含"忘 return"与"穿透"——正好是门诊 1 号的理论版。</li>
<li><b>Jake Archibald · Tasks, microtasks</b>（<a href="https://web.dev/articles/task-microtask" target="_blank">web.dev → task-microtask</a>）。c01 出现过：then 回调进微任务的时序细节，本章模拟器的时序依据。</li>
</ul></details>`,
    quiz: [
      {
        q: '一张已经 fulfilled 的凭证，此刻再调 p.then(cb)，cb 什么时候执行？', kind: 'choice',
        options: [
          { t: '同步立刻执行——反正值已经有了', correct: false, why: '' },
          { t: '仍然异步：cb 进微任务队列，栈空后执行', correct: true, why: '' },
          { t: '永远不会执行——定档后登记无效', correct: false, why: '' },
        ],
        why: '规范强制"then 必异步"：已定档凭证同步跑回调的话，同一段代码会有时同步有时异步，调用方得写两套逻辑。一致性 > 省一拍。',
      },
      {
        q: '链中某环 rejected，下一环的 onRejected 返回了正常值"兜底"。再下一环的 onFulfilled 会收到什么？', kind: 'choice',
        options: [
          { t: '收到"兜底"——该环节的凭证已修复回 fulfilled', correct: true, why: '' },
          { t: '继续收到原来的错误', correct: false, why: '' },
          { t: '链条终止,什么都收不到', correct: false, why: '' },
        ],
        why: 'onRejected 返回正常值＝兜底读成功，凭证"修复"回 fulfilled ≈ catch 里 return 兜底值。模拟器 ③ 演过全程。',
      },
      {
        q: 'resolve 的参数是另一张凭证（内层 Promise）时，会发生什么？', kind: 'choice',
        options: [
          { t: '内层凭证被当成值原样锁进去', correct: false, why: '' },
          { t: '平化：等内层定档,把内层的值/原因透传给外层', correct: true, why: '' },
          { t: '类型错误,直接 reject', correct: false, why: '' },
        ],
        why: '这叫递归解析/平化——链式能"自动续期"的关键。≈ thenCompose 的自动版:TS 天然平,不用选 API。',
      },
      {
        q: '禁写区开工三问是哪三问？（凭记忆写下来,这是 S4 的入场券）', kind: 'text',
        why: '参考:凭证的状态【存什么】?什么时候【变】?变完【欠谁一个通知】(登记的回调去哪)?——三问问清,实现就完成了大半。',
      },
    ],
    sim: { type: 'promise' },
  },

  {
    id: 'c04', group: '阶段 1 · 闭包', title: '闭包与寿命', mech: '变量逃逸到堆',
    read: String.raw`
<p>阶段 0 的最后,我们预告过一个问句:"什么东西能活得比函数的栈帧久?"这一章给答案——<b>闭包</b>。先对暗号:Java 的匿名内部类只能捕获 <code>final</code> 变量,你背过原因——被捕获的值要活过方法生命周期,语言干脆只放行不可变的。JS 拆了这堵墙:<b>函数可以把任何局部变量连引用一起带走</b>。自由,以及随之而来的泄漏,都是这一章的教材。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>闭包管的是<b>数据的寿命</b>:"数据放在哪"这道题,栈和堆的分工在 JS 里有一个温柔的例外——局部变量本该随帧死亡,但被内函数抓住后,<b>整张变量表逃逸到堆上续命</b>。谁抓着,谁活;没人抓,GC 收。寿命不再由语法决定,由<b>引用</b>决定。</div>
<div class="fourq">
  <div><b>目的</b>让变量活过创建它的函数;让"状态"可以藏在函数里。</div>
  <div><b>形式</b>内函数 + 捕获的变量环境(整张表,不是单个值)。</div>
  <div><b>质料</b>词法作用域 + 堆上的环境对象。</div>
  <div><b>动力</b>S12/S13 的响应式 store、React 的 Hooks 内存模型,地基全是它。</div>
</div>
<details class="primer"><summary>🧰 发散 · 本章的两个 JS 语法点(30 秒)</summary>
<ul>
<li><b>内层函数直接用外层变量</b>,不需要任何声明——不像 Java 匿名内部类要求 final,JS 没有这道手续。</li>
<li><b>函数可以作为值返回</b>:<code>return function () {...}</code> ≈ 返回一个 lambda 对象,但它连环境一起带走了。</li>
</ul>
</details>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>计数器:变量逃逸的第一现场</h3>
<pre>function makeCounter() {
  let count = 0;
  return function () { count += 1; return count; };
}
const a = makeCounter();
a(); a(); a();        // 1, 2, 3 —— count 活着,而且一直在长</pre>
<p>按 Java 直觉,makeCounter 返回后 count 就该没了。它凭什么活着?去模拟器走五步:你会亲眼看到那张变量表<b>从调用栈搬家到堆上</b>——这就是"逃逸"。你的 JVM 用逃逸分析千方百计阻止对象逃出栈,React 反其道而行,你在阶段 0 结尾埋的那个问句,此刻可以正式回答了。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>捕获的是变量,不是值</h3>
<p>两个细节决定你能不能写对闭包:</p>
<ul>
<li><b>多次调用 makeCounter,得到多个独立环境</b>——各自的 count 各自长;</li>
<li><b>同一次调用返回的多个内函数,共享同一个环境</b>——一个改,全都看得见(活钱包:deposit 和 check 看到同一个 balance)。</li>
<li><b>var 与 let 在循环里是两个世界</b>:var 整个函数一个盒子(三次迭代共享一个 i),let 每轮一个新盒子。门诊 1 号的全案。</li>
</ul>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>闭包在堆上到底多占了什么</h3>
<p>被捕获的不是单个变量,是<b>整张变量环境表</b>:makeCounter 的环境里只有 count,抓走它顺带抓住表上所有兄弟变量——哪怕内函数只用了其中一个。这就是"闭包抓大对象导致泄漏"的机制层真相:<b>你只想留一个小回调,环境表把大数组一起拽进了堆</b>。实验卡 E1 会让你在 DevTools 里亲眼确认这笔开销。</p>
<p>顺带把 Java 那堵墙补完整:JVM 的逃逸分析努力把对象留在栈上(标量替换),闭包是语言级的"强制逃逸"——<b>一对相反的操作,同一套内存模型</b>。类比的边界也在这里:Java 的担保是编译期的(final 检查),JS 的代价是运行时的(引用断没断全靠你)。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java/OS 世界</th><th>JS 前端世界</th><th>一句话</th></tr>
<tr><td>匿名内部类捕获 final</td><td>闭包捕获任意变量(引用)</td><td>语言把关 vs 自由放行</td></tr>
<tr><td>逃逸分析(阻止上堆)</td><td>闭包(主动上堆)</td><td>同一套内存模型的正反面</td></tr>
<tr><td>GC 可达性</td><td>"还有没人抓着环境"</td><td>寿命由引用决定</td></tr>
<tr><td>private 字段</td><td>闭包当防火墙(实验 E4)</td><td>作用域即封装</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>makeWallet 的 deposit 和 check 共享同一个 balance——如果想让它们各用各的,该怎么改?改完还叫"闭包共享"吗?</li>
<li>"每个循环迭代共享一个 var"和"每轮一个 let",堆上分别是几张变量表?</li>
<li>用闭包实现一个 memoize(缓存入参→结果),cache 应该抓在哪张环境上?被 memoize 的函数 forever 持有 cache——什么情况下这是泄漏,什么情况下是设计?</li>
</ol>
<p class="soul">🤔 留给你想:闭包让"数据"活过了函数,下一章(响应式 store)让"数据的变化"活过了函数——订阅者会一直被通知,直到有人退订。寿命管理从变量升级到了<b>关系</b>。想想:你后端的 MQ 订阅关系,是谁负责清理的?</p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>MDN · Closures</b>(developer.mozilla.org → Closures)。官方定义:"函数与其词法环境的组合"——"词法环境"即本章的"变量表"。</li>
<li><b>MDN · Memory Management</b>(→ Memory_Management)。可达性与回收入门,呼应 c05。</li>
<li><b>You Don't Know JS: Scope &amp; Closures</b>(Kyle Simpson,GitHub 开源)。把"词法作用域"讲成一门正经学问的书,第 5 章专攻闭包的动态与静态之争。</li>
<li><b>延伸 · 逃逸分析的逆操作</b>:JVM 逃逸分析(标量替换)与闭包(强制逃逸)是同一内存模型的正反面——本文第③层的出处。</li>
</ul></details>`,
    quiz: [
      {
        q: '三次调用 makeCounter 得到三个计数器;每个计数器被调用三次。count 在堆上是几份环境?', kind: 'choice',
        options: [
          { t: '3 份——每次调用 makeCounter 产生一个独立环境', correct: true, why: '' },
          { t: '1 份——所有计数器共享一个 count', correct: false, why: '' },
          { t: '9 份——每次调用计数器都新建环境', correct: false, why: '' },
        ],
        why: '环境在【调用 makeCounter】时创建;同一个环境可以抓给任意多个内函数共享。捕获的是变量(地址),不是值的拷贝。',
      },
      {
        q: '循环里给三个回调捕获 var i,循环结束后触发,它们读到的 i 是?', kind: 'choice',
        options: [
          { t: '各自的 0/1/2——每轮一个新变量', correct: false, why: '' },
          { t: '全是 3——三个回调共享同一个 var 盒子,循环跑完 i=3', correct: true, why: '' },
          { t: 'undefined——var 变量循环后自动销毁', correct: false, why: '' },
        ],
        why: 'var 函数级作用域=一个函数一个盒子。let 才是每轮一个新绑定。Java 匿名内部类的 final 限制,防的就是这个。',
      },
      {
        q: '闭包"抓大放小"指的是?', kind: 'choice',
        options: [
          { t: '内函数只用了一个变量,但整张环境表(含大数组)都被拽进堆', correct: true, why: '' },
          { t: '闭包会自动只捕获用到的那个变量', correct: false, why: '' },
          { t: '闭包把大对象压缩存储', correct: false, why: '' },
        ],
        why: '捕获粒度是整张环境表。想让大数组不被"顺带"抓住,就别让它和内函数处在同一个作用域(或用完置空)。',
      },
      {
        q: '用闭包实现"防重提交"(once):第一调用执行并缓存结果,之后直接返回缓存。写下你的实现思路,并指出 done/result 活在哪。', kind: 'text',
        why: '参考:返回一个内函数,done/result 抓在内函数的环境表上;第二次调用 done 已为 true,直接返回 result。S15 脱稿验收的 debounce 是它的进阶版。',
      },
    ],
    sim: { type: 'closure' },
  },

  {
    id: 'c05', group: '阶段 1 · 内存', title: '内存与 GC', mech: '可达性即生死',
    read: String.raw`
<p>c04 结尾说:寿命由引用决定。这一章把"引用决定生死"的裁判请出来——<b>垃圾回收(GC)</b>。好消息是:你不用学一套新理论。V8 的回收判定和你背过的 JVM 一模一样:<b>从 GC Roots 出发沿引用走,走不到的就是垃圾</b>。坏消息是:前端没有 jmap 的行话体系,排泄漏要换 Chrome DevTools 这套工具——手艺不变,方言要重学。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>GC 管的是<b>"数据放在哪"的最终裁决权</b>:堆上每一块内存,由可达性分析判定去留。读写世界观在此多出一条铁律——<b>GC 是这台机器上唯一能合法"暂停你的读写"的后台系统</b>(主线程唯一售票窗口的宪法都要为它让路),所以 V8 用增量、并发标记把停顿压到最短。泄漏即"永远可达",内存即"可达性游戏"。</div>
<div class="fourq">
  <div><b>目的</b>自动回收够不着的内存,让"忘了释放"不再等于崩溃。</div>
  <div><b>形式</b>GC Roots 起点的可达性分析;分代处理(新生代/老生代)。</div>
  <div><b>质料</b>引用链、堆的分代区域、标记位。</div>
  <div><b>动力</b>SPA 页面一开一天,泄漏累积直到卡死;排泄漏是前端性能工程的一半。</div>
</div>
<details class="primer"><summary>🧰 发散 · GC 词汇速查(30 秒)</summary>
<ul>
<li><b>GC Roots</b>:可达性分析的起点——全局对象(Window/globalThis)、当前调用栈、正在执行的回调等"天然的活着的东西"。</li>
<li><b>可达 / 不可达</b>:从 Roots 顺着引用走,走得到=可达(活);走不到=不可达(垃圾候选)。</li>
<li><b>Heap Snapshot(堆快照)</b>:给堆拍一张"定格照片",≈ jmap dump;两三张对比,增量就是嫌疑犯。</li>
<li><b>Retainers(保留者)</b>:某个对象"为什么还没被回收"的引用链倒查清单——从它一路指回 Roots。</li>
</ul>
</details>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>泄漏只有一种成因:你以为用完了,引用链还在</h3>
<p>后端泄漏的场景你熟:连接忘关、静态集合只进不出、ThreadLocal 不清。前端的同款名单:</p>
<ul>
<li><b>定时器</b>:setInterval 的回调闭包抓着页面数据,页面没了定时器还在(门诊 2 号);</li>
<li><b>事件监听器</b>:每进一次页面 addEventListener 一次,从不 removeEventListener;</li>
<li><b>闭包</b>:被缓存的回调抓着大数组(c04 的"抓大放小");</li>
<li><b>全局/缓存集合</b>:Map 只进不出,没有淘汰策略。</li>
</ul>
<p>共同点只有一句话:<b>有一条你没想到的引用链,从 Roots 一直连到它</b>。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>分代处理:V8 给 JVM 的等价物</h3>
<p>对象分两类命:朝生夕死的临时对象(每帧创建的中间量)和活得久的(页面级状态)。V8 和 JVM 一样分代治理:</p>
<ul>
<li><b>新生代</b>:Scavenge 复制算法——空间小、拷贝快,活得久的晋升到老生代;</li>
<li><b>老生代</b>:标记-清除＋整理——慢,但用"增量标记＋并发回收"把停顿切碎,保护主线程。</li>
</ul>
<p>为什么拼命压停顿?回到 c02 的宪法:<b>主线程是唯一售票窗口</b>,GC 一停顿,渲染、交互全部冻结。所以 V8 的工程史几乎就是"如何让 GC 偷偷干活"的历史——你的 JVM 调优笔记(G1 的停顿控制)在这里是同一门课。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>可达性的三个反直觉</h3>
<ol>
<li><b>"还有引用"≠"还在用"。</b>定时器抓着一个再也不会被读的数组——GC 只能当它活着。泄漏不看"意图",只看"链条"。</li>
<li><b>"断一条"≠"死"。</b>可达性是"还存在引用"不是"还存在一个引用"——必须断掉<b>最后一条</b>通往 Roots 的链。实验 E2 专门让你体感。</li>
<li><b>"不可达"≠"立刻没了"。</b>GC 择机而动;堆快照是定格照片,不是实时监控——第三张快照里它才消失。</li>
</ol>
<div class="depth-tag">第 ④ 层 · 边界</div>
<h3>持久层不归 GC 管</h3>
<p>localStorage/IndexedDB 里的数据没有引用链也活着——持久层的"回收"靠 TTL、配额和显式删除,≈ 你的数据库靠 DELETE 和 TTL 索引,不靠 JVM。读写世界观的一致性又添一例:<b>内存的生死归 GC,持久层的生死归策略</b>——分层存储,各管各的死法。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java/OS 世界</th><th>JS 前端世界</th><th>一句话</th></tr>
<tr><td>JVM 分代收集</td><td>V8 Scavenge/标记清除</td><td>同一套可达性分析</td></tr>
<tr><td>jmap dump ＋ MAT 支配树</td><td>Heap Snapshot ＋ Retainers</td><td>排泄漏的手艺平移</td></tr>
<tr><td>连接/线程池忘 close</td><td>监听器/定时器忘移除</td><td>泄漏＝引用链未断</td></tr>
<tr><td>GC 停顿(STW)</td><td>主线程冻结(掉帧)</td><td>售票窗口的短暂闭馆</td></tr>
<tr><td>TTL/DELETE</td><td>Storage 的过期与配额</td><td>持久层不归 GC 管</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>三快照对比法里,"第二张到第三张之间净增不回落"的构造函数为什么是头号嫌疑犯?用可达性语言说出它的嫌疑成立条件。</li>
<li>WeakMap 的键是"弱引用"——不阻止回收。用它做"对象→元数据"的缓存,为什么天然不泄漏?(答不出先查再口述)</li>
<li>页面里有一个全局事件总线(Map),所有模块往里注册回调——这个 Map 是泄漏的温床还是设计的必然?什么条件下它是前者?</li>
</ol>
<p class="soul">🤔 留给你想:GC 解决了"内存的释放",但解决不了"资源的释放"——定时器、监听器、连接,它们不是内存,却抓着内存。你后端的"资源必须 close"纪律,在前端的长相是什么?S12/S13 的响应式 store 会给出一个官方答案:让注册函数<b>返回退订函数</b>——把"清理"做成返回值,忘不了的才是好 API。</p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>MDN · Memory Management</b>(developer.mozilla.org → Memory_Management)。可达性、标记-清扫的官方入门。</li>
<li><b>V8 博客 · Trash talk: the Orinoco garbage collector</b>(v8.dev/blog/trash-talk)。新生代 Scavenge、老生代标记清除、并发/增量标记的工程细节——给你的 JVM 分代知识画等号的最佳读物。</li>
<li><b>Chrome DevTools · Memory 面板文档</b>(developer.chrome.com → heap-snapshots)。三快照对比法与 Retainers 的官方操作手册,S11 实验卡的依据。</li>
<li><b>延伸 · 一词之差</b>:内存泄漏(memory leak)与内存溢出(out of memory)——泄漏是慢性病,溢出是急性发作;前者靠快照排查,后者靠 dump 现场分析。你后端的 OOM 排查手艺,在这里同样适用,只是工具换了名字。</li>
</ul></details>`,
    quiz: [
      {
        q: 'GC 判定对象"该回收"的唯一依据是?', kind: 'choice',
        options: [
          { t: '从 GC Roots 出发沿引用走,走不到(不可达)', correct: true, why: '' },
          { t: '对象存在的时间超过阈值', correct: false, why: '' },
          { t: '程序显式调用了 delete', correct: false, why: '' },
        ],
        why: '可达性分析,和 JVM 同款。"还有引用"和"还够得着"必须同时看——断一条链不够,要断最后一条。',
      },
      {
        q: '下列哪个【不是】前端内存泄漏的常见成因?', kind: 'choice',
        options: [
          { t: '页面销毁后 setInterval 仍在跑,闭包抓着大数组', correct: false, why: '' },
          { t: '每次进入页面 addEventListener,从不移除', correct: false, why: '' },
          { t: '使用 let 声明循环变量', correct: true, why: '' },
        ],
        why: 'let 每轮一个新绑定,循环结束环境自然不可达。泄漏的三惯犯:定时器、监听器、被闭包/缓存抓住的大对象。',
      },
      {
        q: '为什么 V8 要把 GC 做成增量/并发的?', kind: 'choice',
        options: [
          { t: '主线程是唯一售票窗口——GC 停顿=全站冻结,必须切碎停顿保护渲染', correct: true, why: '' },
          { t: '为了省电', correct: false, why: '' },
          { t: '因为 JS 有多线程,GC 可以随便开线程', correct: false, why: '' },
        ],
        why: '宪法(c02)要求主线程永不停摆;GC 是唯一能合法暂停读写的后台系统,所以它的每一次优化都是在对宪法让步。',
      },
      {
        q: '三快照对比法:哪三张?看到什么就该怀疑泄漏?', kind: 'text',
        why: '参考:基准快照 → 触发操作 → 再拍;操作多轮后再拍一张。若某构造函数随操作次数【净增且从不回落】(如 detached DOM、closure),取它的 Retainers 倒查引用链,找到忘断的那一条。答出"三张的时机＋净增不回落＋Retainers 倒查"即过关。',
      },
    ],
    sim: { type: 'reach' },
  },

  {
    id: 'c06', group: '阶段 1 · 响应式', title: '响应式 store 预演', mech: '订阅代替轮询',
    read: String.raw`
<p>下一站是阶段 1 的禁写区:手写响应式 store(S12/S13)。和 c03 一样,本章守禁写区纪律——<b>只看外部行为,不碰实现</b>。要解决的问题一句话:状态变了,关心它的人怎么知道?你后端的答案数据库早就给过——不是让调用方轮询,是<b>订阅-通知</b>。模拟器会把这个机制演成三幕剧:订阅、精准叫醒、以及一次"原地修改"的翻车。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>响应式 store 管的是<b>状态读写的组织方式</b>:所有写走唯一的 setState(整体替换,生成新版本),所有读通过订阅者注册;状态每次变化生成新版本、通知关心它的人。<b>用"版本的引用变化"代替"字段比较",用"订阅"代替"轮询"。</b>这就是 c00"Copy-on-Write"和 c02"不可变仲裁"的合体形态——React 状态管理的雏形。</div>
<div class="fourq">
  <div><b>目的</b>状态一变,关心它的人自动知道;不关心的人不被打扰。</div>
  <div><b>形式</b>唯一的写入口 setState(整体替换)＋两种订阅(全量/选择器)＋退订函数。</div>
  <div><b>质料</b>状态版本、回调登记表、Object.is 比较。</div>
  <div><b>动力</b>S12/S13 亲手造;阶段 2 的 useState/useSelector 是它的官方豪华版。</div>
</div>
<details class="primer"><summary>🧰 发散 · Object.is 与"引用比较"(30 秒)</summary>
<ul>
<li><b>Object.is(a, b)</b>:判断 a 和 b 是否"同一个值"——对对象来说就是<b>同一个引用</b>(≈ Java 的 == 比较引用)。</li>
<li><b>引用变化</b>:生成新对象 → 引用必不同;原地改字段 → 引用不变。<b>订阅者只认引用。</b></li>
<li>所以"通知谁"的判定成本极低:比一下引用,不用深挖字段。</li>
</ul>
</details>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>轮询、订阅,以及 React 的第三条路</h3>
<p>"状态变了,界面跟着变"有三种实现:<b>轮询</b>(每 100ms 读一遍状态,简单但浪费且延迟);<b>订阅-通知</b>(状态变了,主动叫醒订阅者,精准但订阅要管理);<b>重渲染＋diff</b>(状态变了全部重算,再对比找出差异,React 的选择,用"算力换心智负担")。本章造第二种,阶段 2 你会见到第三种为什么建立在第二种之上。<b>读写的镜头看:轮询是"反复读",订阅是"读一次注册,之后只收变化"——把 N 次读压成 1 次注册＋0 次空读。</b></p>
<div class="depth-tag">第 ② 层 · 机制(三幕剧,模拟器逐幕演出)</div>
<h3>第一幕:唯一的写入口</h3>
<pre>store.setState({ items: ['A-001'], total: 99 });   // 整体替换,生成 v2</pre>
<p>写只有一扇门:setState。<b>关键约束:绝不原地修改旧版本</b>——旧 v1 原样保留(旧账不可改),新状态作为 v2 存在。订阅者靠"引用变没变"感知变化;偷改 v1 的字段,引用不变,订阅者全然不知——模拟器第三幕的翻车现场。这就是 c00 的 Copy-on-Write 从类型世界搬进了状态世界。</p>
<h3>第二幕:全量订阅与退订函数</h3>
<pre>const off = store.subscribe(state => renderList(state));  // 登记
off();                                                    // 退订:之后不再被叫醒</pre>
<p>subscribe 把回调登记进表,setState 时按登记顺序逐个通知;返回的函数负责注销自己。<b>为什么退订必须是返回值?</b>c05 的答案:订阅是"引用链",不退就是泄漏——把清理做成返回值,忘不了的才是好 API。你后端 JDBC 返回 Connection 而你负责 close,是同一个契约的旧版。</p>
<h3>第三幕:选择器——只有"与我有关"的变化才叫醒我</h3>
<pre>store.watch(s =&gt; s.total, total =&gt; renderTotal(total));   // 只盯 total 切片</pre>
<p>每次 setState 后,watch 用 select 从新状态算出切片,和上次的切片做 Object.is 比较——<b>变了才通知</b>。买家资料没变就不叫醒买家组件:一轮 setState 加了一单,合计组件被叫醒、买家组件继续睡。这就是"精准叫醒"——也是 React 里 useSelector 防止无关重渲染的全部原理。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>为什么"整体替换"是根基</h3>
<p>订阅者靠引用比较,引用比较的前提是<b>旧状态永不被原地修改</b>——一旦有人偷改,所有"没变"的判断全部失真,数据与视图分家(c06 模拟器第三幕的翻车)。这就是 c00 类比失效清单里"readonly 不等于不可变"的正式解法:<b>不可变不是类型特性,是团队的写纪律</b>——S13 的对拍脚本会用第 07 例锁死它,写了原地修改立刻红。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>响应式 store</th><th>一句话</th></tr>
<tr><td>观察者模式/事件总线</td><td>subscribe/notify</td><td>订阅代替轮询</td></tr>
<tr><td>数据库版本号/MVCC 快照</td><td>状态版本(v1→v2),旧账不改</td><td>靠引用变化感知</td></tr>
<tr><td>Change Data Capture(只订阅关心的表)</td><td>watch 选择器</td><td>无关变化,不叫醒</td></tr>
<tr><td>连接的 close() 契约</td><td>subscribe 返回退订函数</td><td>清理做成返回值</td></tr>
<tr><td>volatile 引用替换(整对象发布)</td><td>setState 整体替换</td><td>换引用,不改内容</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>全量订阅每次都收到通知——组件收到后怎么决定"要不要真的重渲染"?这条成本链和 watch 的过滤是什么关系?</li>
<li>两个订阅者,一个抛异常,另一个还会收到通知吗?你的实现该不该保证"通知互不干扰"?(≈ MQ 的消费者隔离)</li>
<li>watch 的 select 每次都要重算切片——如果 select 本身很贵(遍历大数组求和),怎么避免每次 setState 都全量重算?(提示:memoize,S9 的老朋友)</li>
</ol>
<p class="soul">🤔 留给你想:订阅-通知把"变化"变成了<b>关系</b>——谁关心谁,要登记,要退订,要防泄漏。c04 说闭包把变量寿命交给引用,c05 说 GC 只认引用……到这一章,连"组件和状态的关系"都成了要管理的引用。你后端那句"能不共享就不共享",在这里长成了"要共享,就必须有订阅与退订的纪律"。带着这个理解,进 S12 的禁写区。</p>
<p class="punch">📍 <b>不变量打卡</b>:本章填的是"怎么不打架"行——<b>订阅-通知＋不可变版本</b>是前端对"并发读写的仲裁"的答案(代替锁);顺带在"数据怎么流动"行记一笔:状态流 = 唯一写入口 → 版本链 → 精准通知。可复制:<code>c06 响应式＝订阅代替轮询;setState＝唯一写入口+整体替换;watch＝按切片精准叫醒;退订函数＝把清理做成返回值</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>MDN · Observer pattern(观察者模式)</b>(developer.mozilla.org → Design_patterns)。订阅-通知的祖师爷,本章机制的设计模式学名。</li>
<li><b>Zustand 官方 README</b>(github.com/pmndrs/zustand)。S13 实现的"官方豪华版":create + set + 订阅,API 几乎就是你手写的那套——先手写再看它,会有"它抄了我"的快感(S13 毕业后再看,禁写期内禁看)。</li>
<li><b>react-redux · useSelector 文档</b>(react-redux.js.org → api/hooks#useselector)。选择器订阅在 React 里的标准形态,阶段 2 的伏笔。</li>
<li><b>延伸 · 一词之差</b>:响应式(Reactive)与反应堆(Reactor)共享同一个词根——"事件到了才动"。c02 的 Netty、c06 的 store、阶段 2 的 React,名字里全是它。</li>
</ul></details>`,
    quiz: [
      {
        q: '订阅者靠什么感知"状态变了"?', kind: 'choice',
        options: [
          { t: '引用变化:setState 生成新版本,引用不同即通知', correct: true, why: '' },
          { t: '深度比较新旧状态的每个字段', correct: false, why: '' },
          { t: '定时轮询状态值', correct: false, why: '' },
        ],
        why: '引用比较(Object.is)是 O(1) 的;深比较是 O(n) 的。代价是写侧纪律:绝不原地修改,必须整体替换——对拍 07 例锁的就是它。',
      },
      {
        q: '原地修改旧状态的字段(state.total = 0),订阅者会怎样?', kind: 'choice',
        options: [
          { t: '立刻收到通知并重新渲染', correct: false, why: '' },
          { t: '不知道——引用没变,数据与视图从此分家', correct: true, why: '' },
          { t: '运行时报错阻止你', correct: false, why: '' },
        ],
        why: '没人替你监督"不许偷改"。不可变不是类型特性,是写纪律——这就是为什么模拟器第三幕要专门翻一次车。',
      },
      {
        q: 'watch(total) 的存在意义是?', kind: 'choice',
        options: [
          { t: '只关心 total 的订阅者,在其他切片变化时继续睡——精准叫醒,防无效重渲染', correct: true, why: '' },
          { t: '让 total 变得只读', correct: false, why: '' },
          { t: '自动把 total 同步到服务器', correct: false, why: '' },
        ],
        why: 'select + Object.is 过滤,把"全城广播"升级为"精准叫醒"。React 的 useSelector 同理,防的是无关组件重渲染。',
      },
      {
        q: '为什么 subscribe 要返回退订函数?不退订会发生什么?用 c05 的语言说一遍。', kind: 'text',
        why: '参考:订阅是一条从登记表指向回调(及其闭包环境)的引用链;不退订,链不断,GC 永远够得着——监听器泄漏(门诊 2 号)。把清理做成返回值,忘不了。',
      },
    ],
    sim: { type: 'store' },
  },

  {
    id: 'c07', group: '阶段 2 · 组件', title: '组件与 JSX', mech: 'UI = f(state)',
    read: String.raw`
<p>欢迎来到全书重镇的第一站。写 React 之前,必须先认识浏览器页面里的三个角色——你没有任何 Web 基础,所以这是<b>强制前置</b>,10 分钟补齐:<b>DOM</b> 是浏览器把 HTML 解析成的内存对象树(每个标签一个节点),它是"界面数据"本身,≈ 你的 ORM 实体树;<b>HTML</b> 是建树的原始标记;<b>CSS</b> 是树上节点的皮肤系统。JS 操作界面 = 操作 DOM 树——记住这句,React 的全部工作就一句话:<b>让函数直接产出这棵树的描述稿,由 React 对比真实 DOM 做最小更新。</b></p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>React 把后端的荣耀带给了界面:<b>UI = f(state)</b>——界面是状态的纯函数投影。渲染是一次<b>只读事务</b>:读 state(不许写),产出界面的 SHOULD 快照;真正的写(碰真实 DOM)由 React 统一提交。<b>读写分离,从架构上写死。</b></div>
<div class="fourq">
  <div><b>目的</b>让界面代码获得类型安全与可组合性。</div>
  <div><b>形式</b>JSX 语法糖 + 函数组件(props 只读)。</div>
  <div><b>质料</b>vdom 对象树(纯 JS,可打印)。</div>
  <div><b>动力</b>本阶段一切内容的载体;你写的每个组件都在练它。</div>
</div>
<details class="primer"><summary>🧰 发散 · 零基础三件套 + renderToString(必读)</summary>
<ul>
<li><b>DOM</b>:浏览器里的界面树。JS 拿到它,就能读/改界面——但直接改又慢又乱,React 的存在意义就是"你声明,我来改"。</li>
<li><b>HTML</b>:&lt;div id="a"&gt;文本&lt;/div&gt; ≈ 一行建树脚本。JSX 长得像它,但本质是 JS。</li>
<li><b>CSS</b>:节点皮肤(颜色/布局),不在本课程深讲,见到 class/className 知道是它即可。</li>
<li><b>renderToString(组件)</b>:React 官方 API——在 Node 里把组件渲染成 HTML 字符串。**本阶段所有实验都靠它**,不需要浏览器就能"看见"界面。</li>
</ul>
</details>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>组件 = 接收 props 的函数</h3>
<p>你在 Java 里写过 <code>render(Order order): String</code> 这样的报表方法吗?React 组件就是它的类型安全版。去模拟器把三个预设玩一遍:标签与表达式、列表与 key、条件渲染——十分钟后你会发现"模板引擎"这个词退休了。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>两条铁律</h3>
<ul>
<li><b>props 只读</b>:组件不许修改 props——要改数据,找状态的拥有者(它重渲染时会把新 props 发下来)。≈ 方法入参不可变。</li>
<li><b>渲染必须纯函数</b>:同样的 props 必须渲染出同样的结果;请求、改外部变量等副作用一律不许出现在渲染里。<b>类比失效预警:你后端的 Service 方法可以有副作用(发 MQ、写库),React 渲染函数一次都不行</b>——渲染可能被 React 随时重放(StrictMode 故意跑两遍),副作用会成倍发生。副作用的容器叫 useEffect(S23)。</li>
</ul>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>JSX 蒸发后剩下什么</h3>
<p>用 c02 的蒸发器思维看 JSX:编译产物是 <code>createElement(...)</code> 函数调用链,产出一棵普通 JS 对象树(类型/属性/孩子)——这就是<b>虚拟 DOM</b>。它"虚拟"在于:还不是真 DOM,是界面的 SHOULD 快照 ≈ WAL 里的待写页。谁消费它?下一章的 diff。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>React 世界</th><th>一句话</th></tr>
<tr><td>报表方法 render(order)</td><td>组件函数</td><td>数据进,描述稿出</td></tr>
<tr><td>JSP/Thymeleaf 模板</td><td>JSX</td><td>类型安全的模板 = 语言本身</td></tr>
<tr><td>方法入参不可变约定</td><td>props 只读</td><td>改数据找拥有者</td></tr>
<tr><td>Service 方法的副作用自由</td><td>渲染纯函数(失效!)</td><td>副作用另有容器 useEffect</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>列表渲染为什么用 map 而不是 for 循环+push?(提示:map 的返回值是什么?for 的返回值呢?——和"描述稿"的关系)</li>
<li>渲染函数里调了发请求的函数,StrictMode 会怎么惩罚它?为什么说这是"故意跑两遍抓副作用"?</li>
<li>把你在后端写过的某个"数据 → 报表"方法翻译成 React 组件,入参出参各是什么?</li>
</ol>
<p class="soul">🤔 留给你想:UI = f(state) 意味着"界面不可能和状态不一致"——只要 f 是纯的。你后端的"缓存与库表不一致"问题,在这个模型里还存在吗?它被转移到了哪里?</p>
<p class="punch">📍 <b>不变量打卡</b>:可复制 <code>c07 组件与 JSX:UI=f(state);渲染=只读事务;props 只读;渲染纯函数(副作用左移到 useEffect)</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>zh.react.dev · 描述 UI</b>(zh.react.dev/learn/describing-the-ui)。官方入门三连的第一章,与本章一一对应,中文直接读。</li>
<li><b>MDN · DOM 入门</b>(developer.mozilla.org → DOM)。DOM 树的官方定义,补三件套用。</li>
<li><b>react.dev · renderToString</b>(react.dev/reference/react-dom/server/renderToString)。本课程实验的标准姿势:服务端渲染字符串。</li>
</ul></details>`,
    quiz: [
      {
        q: 'JSX 编译后是什么?运行时还存在吗?', kind: 'choice',
        options: [
          { t: '普通 JS 函数调用链(createElement),产出 JS 对象树;HTML 从未存在', correct: true, why: '' },
          { t: '就是 HTML,浏览器直接解析', correct: false, why: '' },
          { t: '编译成 WebAssembly 加速渲染', correct: false, why: '' },
        ],
        why: 'JSX 是语法糖,产物是纯 JS 对象树(vdom)——"虚拟"二字的含义:它是界面的 SHOULD 快照,不是真 DOM。',
      },
      {
        q: '渲染函数里能不能直接发请求?为什么?', kind: 'choice',
        options: [
          { t: '能,React 保证只调用一次', correct: false, why: '' },
          { t: '不能——渲染必须纯函数,React 可能重放渲染(StrictMode 故意跑两遍),副作用会成倍发生', correct: true, why: '' },
          { t: '能,但要放在 try/catch 里', correct: false, why: '' },
        ],
        why: '渲染 = 只读事务。副作用有专门容器 useEffect:提交后才执行,还带清理函数(阶段 2 的 S23)。',
      },
      {
        q: '组件为什么不能修改 props?', kind: 'choice',
        options: [
          { t: '性能原因,改了会变慢', correct: false, why: '' },
          { t: 'props 是父组件状态的投影——要改数据,通知拥有者(父)重新下发', correct: true, why: '' },
          { t: '旧版 React 不行,新版可以', correct: false, why: '' },
        ],
        why: 'props 是"数据的投影"而非数据本体;所有写收敛到状态拥有者(≈ 所有写走 Service,不直改表)。',
      },
      {
        q: '把你后端某个"数据→报表"方法翻译成 React 组件:入参、出参、纯度各是什么?', kind: 'text',
        why: '参考:入参=props(数据快照),出参=JSX 描述稿;必须是纯函数(同样输入同样输出,零副作用)。写出具体方法名并说明翻译即可。',
      },
    ],
    sim: { type: 'jsx' },
  },

  {
    id: 'c08', group: '阶段 2 · 渲染', title: '虚拟 DOM 与 diff', mech: '脏页最小回写',
    read: String.raw`
<p>setState 之后发生了什么?你的组件函数<b>重新执行</b>,产出一棵新的 vdom 树;React 拿新旧两棵树做 diff,只把差异应用到真实 DOM。用你数据库的语言:<b>vdom 是 WAL 里的待写页,真实 DOM 是数据页,diff+commit 是检查点</b>。直接操作 DOM ≈ 绕过缓存手写每一页;先写 vdom 再 diff ≈ 攒一批、算最小集、一次落盘。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>diff 管的是<b>写的最小化</b>:状态到像素的写路径上,React 用"先算 SHOULD、再算差异"把真实 DOM 的写次数压到最低。<b>写越少,帧越稳</b>——这是 c02"主线程售票窗口"宪法在渲染层的直接推论。</div>
<div class="fourq">
  <div><b>目的</b>把真实 DOM 的写次数压到最低;让"重渲染"便宜到可以随便触发。</div>
  <div><b>形式</b>新旧 vdom 同层对比;同类型更新/异类型重建/列表按 key 对齐。</div>
  <div><b>质料</b>vdom 对象树 + 真实 DOM 节点引用。</div>
  <div><b>动力</b>S18~S20 你要亲手实现它;key 串位门诊的解药也在这里。</div>
</div>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>diff 的两条简化规则</h3>
<p>完整树的差异计算是 O(n³) 级的难题,React 用两条简化把它降到 O(n):</p>
<ul>
<li><b>同层比较,不跨层移动</b>——节点只会"删了重建",不会"跨层搬家";</li>
<li><b>同类型复用,异类型重建</b>——位置相同且都是 td → 更新属性/文本;一个是 td 一个是 span → 拆了重建(DOM 标签名不可变,物理限制)。</li>
</ul>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>列表与 key:主键的意义</h3>
<p>列表的孩子顺序会变,按位置配对必然出错——所以列表元素要发身份证:</p>
<ul>
<li><b>有 key</b>:按 key 对齐身份——新增的插入、删除的移除、保留的原封不动(行内状态稳如泰山);</li>
<li><b>无 key</b>:按位置配对——删首行 = 后面全部"改写内容",行内状态串位(门诊 1 号)。</li>
</ul>
<p>模拟器 ②③ 把同一个"删首行"演了两遍:<b>无 key 3 次 DOM 操作 + 状态串位;有 key 1 次删除</b>。<b>key 就是主键:身份必须稳定,所以别用数组下标(下标随删除漂移)。</b></p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>为什么 diff 便宜:引用比较打底</h3>
<p>diff 的入口有个便宜的剪枝:如果组件的 props 和 state 的<b>引用都没变</b>,React 可以直接跳过整棵子树(≈ c06 手写的 Object.is 过滤的放大版)。这就接回 c00/c06 的铁律:<b>不可变更新不是风格,是让"有没有变"这个判断保持 O(1) 的基础设施。</b>你改了旧对象,引用没变,React 就装没看见——门诊 3 号。</p>
<div class="depth-tag">第 ④ 层 · 边界</div>
<h3>vdom 不是性能银弹</h3>
<p>vdom 的价值是<b>可编程的渲染事务</b>(声明式、可 diff),不是"比手写 DOM 快"——极致手写永远更快,但不可维护。React 用少量算力(生成 vdom+diff)换取心智负担的大幅下降——"算力换心智"的又一笔交易,和 GC 同款定价。</p>
<h3>对暗号</h3>
<table>
<tr><th>数据库世界</th><th>React 世界</th><th>一句话</th></tr>
<tr><td>WAL 待写页</td><td>vdom</td><td>先算 SHOULD,再落盘</td></tr>
<tr><td>检查点(最小回写)</td><td>diff 提交</td><td>只写脏页</td></tr>
<tr><td>主键稳定</td><td>列表 key</td><td>身份漂移 = 状态串位</td></tr>
<tr><td>引用比较判脏</td><td>props/state 引用剪枝</td><td>不可变是 O(1) 判脏的基础</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>"同层比较,不跨层移动"——如果你要把一个子树从 A 容器搬到 B 容器,React 会怎么处理?手动怎么规避浪费?</li>
<li>1000 行表格改 1 行:"全量重建"与"diff 最小更新"各动多少节点?乘以每次节点操作的成本,用你后端的"写放大"语言描述。</li>
<li>为什么"渲染必须纯"是 diff 正确性的前提?(提示:diff 假设"同 props → 同 vdom";渲染不纯,这个假设塌了会怎样?)</li>
</ol>
<p class="soul">🤔 留给你想:diff 的两条简化(同层、按 key)都是"放弃最优解,换取线性成本"。你后端有没有同款决策?(提示:一致性哈希放弃绝对均匀换扩容低成本。)想通"工程即取舍",React 的源码 reads like poetry。</p>
<p class="punch">📍 <b>不变量打卡</b>:可复制 <code>c08 vdom+diff＝脏页最小回写;key＝主键(身份稳定);不可变引用＝O(1) 判脏;vdom 不是银弹,是可编程的渲染事务</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>zh.react.dev · Render and Commit</b>(zh.react.dev/learn/render-and-commit)。渲染三步(触发→渲染→提交)的官方解释,与本章三层一一对应。</li>
<li><b>zh.react.dev · 保持列表纯粹</b>(zh.react.dev/learn/keeping-lists-in-order-with-key)。key 的官方专章:为什么 index-key 是炸弹。</li>
<li><b>Linux 内核 · 写时复制(COW)</b>:fork 的页表技巧——React 不可变更新的内存版同构,维基百科词条即可。</li>
</ul></details>`,
    quiz: [
      {
        q: 'diff 为什么"同类型复用更新,异类型拆了重建"?', kind: 'choice',
        options: [
          { t: 'DOM 标签名不可变;类型不同意味着子树结构假设全变,重建成本反而低', correct: true, why: '' },
          { t: 'React 偷懒没实现标签改名', correct: false, why: '' },
          { t: '因为浏览器规定 td 必须在 table 里', correct: false, why: '' },
        ],
        why: '这是 diff 的第一个分支:类型是比较的锚。类型变了,后面所有子节点都无法按位置信任,重建最安全。',
      },
      {
        q: '无 key 列表删除首行,React 实际做了什么?', kind: 'choice',
        options: [
          { t: '精准删除那一行,其余不动', correct: false, why: '' },
          { t: '按位置配对:后续每行被"改写内容",最后一行被删除——3 次 DOM 操作', correct: true, why: '' },
          { t: '整表重建', correct: false, why: '' },
        ],
        why: '按位置配对时,身份随位置漂移。行内有状态时还会串位(门诊 1 号)。key=主键,不是序号。',
      },
      {
        q: 'diff 入口能做"引用没变就跳过整棵子树"的剪枝,它依赖什么前提?', kind: 'choice',
        options: [
          { t: 'state/props 的不可变更新——引用没变 ⇒ 内容必然没变', correct: true, why: '' },
          { t: 'React 会深度比较新旧对象', correct: false, why: '' },
          { t: '浏览器提供脏节点标记', correct: false, why: '' },
        ],
        why: '这就是 COW 打底:不可变更新让"判脏"保持 O(1)。偷改旧对象,剪枝就失灵(门诊 3 号)。',
      },
      {
        q: 'vdom 为什么"不是性能银弹"?用一笔账说明它交易了什么。', kind: 'text',
        why: '参考:付出"每次都生成 vdom + diff"的算力,换来"声明式、可 diff、心智简单"与"最小化真实 DOM 写"。极致手写更快但不可维护——算力换心智,与 GC 同款定价。',
      },
    ],
    sim: { type: 'diff' },
  },

  {
    id: 'c09', group: '阶段 2 · Hooks', title: 'Hooks 与副作用', mech: 'Fiber 上的固定槽位',
    read: String.raw`
<p>全书铺垫了五章的终极答案,到了。函数组件每次渲染都是从头执行——栈帧里的局部变量活不过一帧。那 <code>useState</code> 凭什么记得住上一次的值?因为状态根本不在栈帧里:<b>它记在组件的"户口本"(Fiber 节点)的 Hook 槽位链表上</b>。useState 做三件事:首帧在链表上按顺序开新槽;此后每帧按<b>同样的调用顺序</b>认领同一个槽;setState 安排一次重渲染。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>Hooks 是"数据寿命"问题的终局形态:c04 让变量逃逸到堆,c06 让"数据的变化"活过函数(订阅),本章让<b>组件的状态</b>活过渲染——逃逸的目标是 Fiber(组件的堆上户口本),寻址方式是<b>调用顺序</b>。副作用(useEffect)则被从渲染中彻底剥离,变成槽位上的"提交后任务"。<b>状态逃逸 + 读写分离,在 Hooks 里合体。</b></div>
<div class="fourq">
  <div><b>目的</b>让函数组件拥有状态与副作用,且保持渲染纯函数。</div>
  <div><b>形式</b>按调用顺序的槽位链表;useState 认领槽位;useEffect 登记提交后任务。</div>
  <div><b>质料</b>Fiber 节点上的 Hook 数组 + 依赖数组。</div>
  <div><b>动力</b>你写的每个 React 组件;阶段 3 的数据获取 Hooks。</div>
</div>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>户口本比喻(一句话版)</h3>
<p><code>@Service</code> 的 Bean 凭什么第二次注入还是同一个对象?因为它的状态活在 IoC 容器的堆里。函数组件凭什么记住 state?因为它的状态活在 Fiber 的槽位里。<b>方法栈帧会死,户口本不死</b>——这就是全部秘密。模拟器两帧动画,把这叫"槽位寻址"演给你看。</p>
<div class="depth-tag">第 ② 层 · 机制</div>
<h3>Rules of Hooks = 调用约定</h3>
<p>槽位按<b>调用顺序</b>寻址:第 1 个 useState 认领槽位①,第 2 个认领槽位②……一旦你在 if 里多调/少调一个,槽位表与上一帧对不上——后面所有 Hook 全部错位,等于寄存器分配表被扯歪。所以:</p>
<ul>
<li>Hook 只能在组件函数顶层调用,不能进 if/循环/嵌套函数;</li>
<li>你的 mini-React 顺序守卫会在第二次渲染时当场抛错(门诊 5 号演过)。</li>
</ul>
<h3>useEffect:副作用的三合一容器</h3>
<p><code>useEffect(fn, deps)</code> ≈ <code>@PostConstruct</code> + <code>@PreDestroy</code> + 缓存 key 三合一:挂载后执行 fn(初始化);deps 变化时先跑上次返回的清理函数、再重跑 fn(刷新);组件卸载时跑清理(收尾)。fn 里可以有副作用——发请求、设定时器、碰 DOM,它运行在<b>提交后</b>,渲染依然是纯的。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>依赖数组就是缓存 key</h3>
<p>effect 的重跑判定 = deps 数组逐项 Object.is 比较。<b>漏写一个依赖 = 缓存 key 不完整 = 读到旧值</b>(stale closure,阶段 1 门诊 4 号的回声);<b>不写 deps = 每次渲染都重跑</b> = 缓存击穿风暴(门诊 2 号)。你后端的缓存纪律("key 必须覆盖全部入参")在这里原样生效。</p>
<div class="depth-tag">第 ④ 层 · 边界</div>
<h3>不要把 Hooks 当语法糖</h3>
<p>对比 class 组件时代:this、生命周期方法、this 绑定三大坑,Hooks 全部消解——代价是把"组织代码"的责任交还给你:相关的状态与副作用要么待在同一个 Hook 里,要么被拆得清清楚楚。<b>Hooks 不是更少的代码,是更明确的依赖声明。</b></p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>Hooks 世界</th><th>一句话</th></tr>
<tr><td>实例字段(堆上)</td><td>useState 槽位(Fiber 上)</td><td>状态逃逸,按序寻址</td></tr>
<tr><td>@PostConstruct + @PreDestroy</td><td>useEffect + 清理函数</td><td>生命周期三合一,deps 是触发器</td></tr>
<tr><td>缓存 key 必须覆盖入参</td><td>依赖数组必须完整</td><td>漏 key = 读旧值</td></tr>
<tr><td>IoC 注入</td><td>useContext</td><td>跨层注入,免钻孔</td></tr>
<tr><td>@Cacheable</td><td>useMemo/useCallback</td><td>手动缓存,key 自己管</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>自定义 Hook(以 use 开头的函数,内部调 useState/useEffect)为什么也必须遵守 Rules of Hooks?(提示:它和组件共享同一张槽位表吗?)</li>
<li>useEffect 里 setState 会发生什么?什么条件下是正确用法(数据拉取回填),什么条件下是风暴(门诊 2 号)?分界线在哪?</li>
<li>把 c06 手写的 store.watch 迁移到 React:watch(select, fn) 对应哪个官方 API?退订函数对应 useEffect 的哪一部分?</li>
</ol>
<p class="soul">🤔 留给你想:Hooks 让"状态"与"副作用"都变成了可以按需组合的函数单元——这是函数式编程"组合优于继承"在 UI 领域的胜利。你后端的 Spring 从 XML 到注解到函数式 Bean 定义,走的是不是同一条路?想通这个,你看 React 的一切设计都会觉得"理所当然"。</p>
<p class="punch">📍 <b>不变量打卡</b>:可复制 <code>c09 Hooks＝Fiber 上的固定槽位(状态逃逸终局);Rules of Hooks＝调用约定;useEffect＝@PostConstruct/@PreDestroy+缓存 key;依赖数组漏写＝stale closure</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>zh.react.dev · 使用 Hooks</b>(zh.react.dev/learn#managing-state)。官方 Hooks 全系列,State as a Snapshot 一章直击"set 之后读旧值"。</li>
<li><b>react.dev · Rules of Hooks</b>(react.dev/reference/rules/rules-of-hooks)。官方对调用约定的完整说明+eslint 插件原理。</li>
<li><b>Overreacted · A Complete Guide to useEffect</b>(overreacted.io)。Dan Abramov 的 effect 长文, deps 的心智模型("每次渲染都是自己的快照")——S23 之后读,收获翻倍。</li>
<li><b>延伸 · Fiber 名字的含义</b>:Fiber=纤维/协程——React 把渲染工作拆成可中断的纤维单元,呼应 c02"把长任务切小片给渲染让路"。名字即架构。</li>
</ul></details>`,
    quiz: [
      {
        q: '函数组件每次渲染都从头执行,useState 凭什么记住上一次的值?', kind: 'choice',
        options: [
          { t: '状态存在全局变量里', correct: false, why: '' },
          { t: '状态存在组件在 Fiber 节点的 Hook 槽位链表上(堆),按调用顺序认领', correct: true, why: '' },
          { t: 'useState 内部偷偷创建了闭包变量', correct: false, why: '' },
        ],
        why: '状态从栈帧逃逸到堆上的固定槽位——这正是 c04 闭包(逃逸)+ c06 store(版本化)的合体。槽位按调用顺序寻址。',
      },
      {
        q: '把 useState 写进 if 里,第二次渲染会发生什么?机制层原因?', kind: 'choice',
        options: [
          { t: '没影响,React 自动处理', correct: false, why: '' },
          { t: '槽位表与上一帧对不上(数量/顺序),后续 Hook 全部错位——守卫抛错', correct: true, why: '' },
          { t: '只是代码风格问题', correct: false, why: '' },
        ],
        why: 'Hook 按调用顺序寻址=调用约定。条件调用让槽位表形状漂移,等于寄存器分配表被扯歪——必须抛错。',
      },
      {
        q: 'useEffect 的依赖数组本质上是什么?漏写一个依赖的后果?', kind: 'choice',
        options: [
          { t: '缓存 key:漏写的依赖变化时 effect 不重跑,读到旧快照(stale closure)', correct: true, why: '' },
          { t: '性能提示,漏了只是慢一点', correct: false, why: '' },
          { t: '会自动被编译器补全', correct: false, why: '' },
        ],
        why: '依赖数组=effect 重跑的判定条件,逐项 Object.is 比较。你后端"缓存 key 必须覆盖全部入参"的纪律原样生效。',
      },
      {
        q: '画出"启动定时器 A → 切换到 B → 卸载"的 useEffect 执行时序,并用 @PostConstruct/@PreDestroy 对暗号。', kind: 'text',
        why: '参考:挂载帧→启动 A;切到 B→先清理 A(PreDestroy)再启动 B(PostConstruct);卸载→清理 B。清理函数永远在下一个 effect 之前执行。',
      },
    ],
    sim: { type: 'hooks' },
  },

  {
    id: 'c10', group: '阶段 3 · 网络', title: '同源策略与 CORS', mech: '执法在浏览器,立法在服务端',
    read: String.raw`
<p>你的接口用 curl 验收全绿,一上浏览器就报 TypeError——这不是玄学,是一位你还没见过的执法者在工作。<b>同源策略</b>是浏览器的单方面执法:页面(源 A)读不到源 B 的响应,除非 B 在响应头里点名放行(CORS)。本章把这个执法过程演给你看——S27 的实验里,你会在 Node 里亲手扮演它。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>本章管的是<b>跨进程读写的准入</b>:浏览器(源 A)想读服务器(源 B)的数据,中间有一道检查站。检查站的特殊之处:<b>立法在服务器(响应头),执法在浏览器,而犯人往往以为自己在被服务器拦</b>。你后端配 Nginx/Spring 的 CORS,维护的正是这张放行清单。</div>
<div class="fourq">
  <div><b>目的</b>允许"经过许可的跨源读",拦下"未经许可的跨源读"。</div>
  <div><b>形式</b>响应头放行清单 + 非简单请求的预检(OPTIONS)问路。</div>
  <div><b>质料</b>Origin、Access-Control-Allow-* 三类头、credentials 规则。</div>
  <div><b>动力</b>S27 亲手扮演执法者;门诊 2 号是它的翻车现场。</div>
</div>
<details class="primer"><summary>🧰 发散 · "源"与两个存放的地方(60 秒)</summary>
<ul>
<li><b>源(origin)= 协议+域名+端口</b>三者全同才算同源。localhost:5180 和 localhost:8080 是不同源——端口也算。</li>
<li><b>Cookie</b>:浏览器为某域名自动携带的小票据;HttpOnly 的 Cookie JS 读不到。</li>
<li><b>localStorage</b>:页面在浏览器里的本地存储柜,JS 随手可读写,不自动随请求发送。</li>
</ul>
</details>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>一位只对浏览器生效的法官</h3>
<p>curl、Postman、Node 脚本跨端口拿数据,畅通无阻——它们没有"源"的概念,<b>没有执法者的地方就没有同源策略</b>。所以排查 CORS 的第一课:别盯服务端日志找"被拦的请求",<b>预检失败的请求根本不会发出</b>。映射失效点就在这:你后端"网关挡我=服务器挡我"的直觉,在这里翻车——拦截发生在客户端。</p>
<div class="depth-tag">第 ② 层 · 机制(模拟器逐幕演出)</div>
<h3>简单请求:不问路,但安检照旧</h3>
<pre>GET /api/orders  →  200(响应头里必须有 Access-Control-Allow-Origin)</pre>
<p>免检名单是 HTML 表单时代的历史遗产(GET/HEAD/POST + 表单三兄弟的内容类型)——<b>安全策略只能增量演进,白名单先冻结历史再管新事物</b>。但免预检 ≠ 免执法:响应缺 ACAO 头,数据照样被扣下,JS 拿到 TypeError——网络面板 200 全绿,服务器日志一片祥和。</p>
<h3>预检:四项检查清单</h3>
<pre>OPTIONS /api/orders
  Origin: http://localhost:5180
  Access-Control-Request-Method: POST
→ 204 + Allow-Origin / Allow-Methods / Allow-Headers</pre>
<p>带自定义头或 JSON body 的跨源请求,浏览器先替你问路。四项全过才发真请求。<b>对照</b>:这就是你在网关配"放行 OPTIONS"的全部意义——报文级重现见模拟器第二幕。</p>
<h3>凭证与通配符的冲突</h3>
<p>带 Cookie 的跨源请求(<code>credentials: 'include'</code>),<code>ACAO: *</code> 无效——凭证通道必须指名道姓 + <code>Allow-Credentials: true</code>。存放姿势的总账:Cookie(HttpOnly) XSS 偷不走但 CSRF 要防;localStorage(JWT) CSRF 免疫但 XSS 一锅端。<b>宁可防 CSRF(可控),不可赌 XSS(防不胜防)。</b></p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>为什么执法方在客户端</h3>
<p>因为<b>浏览器是 Cookie 的保管人</b>:它替用户自动携带凭证,所以它必须替用户把关"哪些跨源读配得上这些凭证"。App、curl 不保管 Cookie,所以不需要 CORS——这也预告了它的真实身份:<b>CORS 不是安全边界,是跨源协作机制</b>。真正的安全在鉴权与幂等(你的老本行),S41 的联调实验会正面撞上这个事实。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>CORS</th><th>一句话</th></tr>
<tr><td>网关放行 OPTIONS</td><td>预检 + 四项检查</td><td>先问路,再通行</td></tr>
<tr><td>IP 白名单</td><td>ACAO 指名(带凭证不许 *)</td><td>凭证通道,指名道姓</td></tr>
<tr><td>Session 票据(HttpOnly)</td><td>Cookie</td><td>防偷不防借手(CSRF)</td></tr>
<tr><td>调用方自己带 token</td><td>localStorage + Authorization 头</td><td>防借手但怕撬锁(XSS)</td></tr>
<tr><td>curl 测网关</td><td>curl 测不出 CORS</td><td>执法方不在服务器</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>预检结果浏览器会缓存(Access-Control-Max-Age)。这和你给网关做放行规则缓存是同一个机制吗?失效时机怎么定?</li>
<li>为什么 text/plain 的 POST 免预检?这个口子今天还安全吗——浏览器替你把关了什么?</li>
<li>团队把 JWT 放 localStorage,他们说"这样不用防 CSRF"。他们的赌注是什么?你接不接?</li>
</ol>
<p class="soul">🤔 留给你想:同源策略保护的不是服务器,是<b>用户浏览器里的凭证与数据</b>。你做过的每一层安全——内网隔离、鉴权、审计——保护对象各不相同。CORS 的存在提醒你:<b>信任的边界画在哪,执法就得布在哪</b>。服务器管不到的地方,总得有人管。</p>
<p class="punch">📍 <b>不变量打卡</b>:本章填"谁说了算"行——跨源读写的准入由<b>浏览器单方面执法</b>,服务端响应头是法律文本。顺带在"数据怎么流动"行记一笔:预检是一道 <code>OPTIONS</code> 问路协议,真请求要等放行。可复制:<code>CORS＝立法在服务端,执法在浏览器;预检＝跨源读写的问路协议;凭证通道不许通配符</code></p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>MDN · CORS</b>(developer.mozilla.org → Web/HTTP/CORS)。预检清单的规范原文,"简单请求"一节有历史包袱的全貌。</li>
<li><b>fetch 规范 · CORS check</b>(fetch.spec.whatwg.org)。四项检查的执法伪代码,模拟器第二幕的官方版。</li>
<li><b>OWASP · CSRF Cheat Sheet</b>。SameSite/Cookie 的威胁模型,凭证存放姿势的另一半账本。</li>
<li><b>延伸 · 一词之差</b>:CORS 的 "Resource Sharing" 是客套话——它真正定义的是<b>默认拒绝</b>,分享是例外。读规范时把 "Cross-Origin **Resource Sharing**" 读成 "默认禁止的跨源读",少走弯路。</li>
</ul></details>`,
    quiz: [
      {
        q: 'curl 测接口一切正常,浏览器却报 CORS 错误。为什么?', kind: 'choice',
        options: [
          { t: '同源策略只在浏览器执法——curl 没有执法者,永远测不出', correct: true, why: '' },
          { t: 'curl 版本太旧,不支持 CORS 头', correct: false, why: '' },
          { t: '浏览器缓存了旧的失败结果', correct: false, why: '' },
        ],
        why: '执法方在浏览器。预检失败的真请求根本不会发出,服务端日志一片祥和——排查 CORS 别盯服务端日志。',
      },
      {
        q: '预检(OPTIONS)失败时,真正的 POST 请求发生了什么?', kind: 'choice',
        options: [
          { t: '根本不会发出——浏览器在预检阶段就拒收了', correct: true, why: '' },
          { t: '照常发出,只是响应被丢弃', correct: false, why: '' },
          { t: '由服务器决定要不要处理', correct: false, why: '' },
        ],
        why: '预检的意义就在这:先问路,再上路。这也是"服务端日志里找不到那次请求"的原因。',
      },
      {
        q: '带 Cookie 的跨源请求(credentials: include),哪种响应头组合能放行?', kind: 'choice',
        options: [
          { t: 'ACAO: * + Allow-Credentials: true', correct: false, why: '' },
          { t: 'ACAO 指名匹配源 + Allow-Credentials: true', correct: true, why: '' },
          { t: 'ACAO: * 单独即可', correct: false, why: '' },
        ],
        why: '凭证通道必须指名道姓——通配符在带凭证的世界里一律拒收。guest Wi-Fi 可以对所有人开放,公司 VPN 不行。',
      },
      {
        q: 'JWT 放 localStorage 与 Session 放 HttpOnly Cookie,各自免疫什么、害怕什么?用一句话对账。', kind: 'text',
        why: '参考:localStorage(JWT) 不自动携带→CSRF 免疫,但 JS 可读→XSS 一锅端;HttpOnly Cookie JS 读不到→XSS 偷不走,但自动携带→CSRF 要防。纪律:宁可防可控的 CSRF,不可赌防不胜防的 XSS。',
      },
    ],
    sim: { type: 'cors' },
  },

  {
    id: 'c11', group: '阶段 3 · 缓存', title: '缓存与失效', mech: 'queryKey≈key,staleTime≈TTL',
    read: String.raw`
<p>你在服务端管了多年缓存——Caffeine 的 TTL、Redis 的失效、网关的合并回源。本章是个好消息:<b>浏览器里也有一台,概念一一对应,一条都不用重学</b>。TanStack Query 不是新物理,是同一套缓存物理学的前端方言。S28/S29 的实验会让你用真家伙把每一条对回去。</p>
<div class="worldview"><span class="wv-title">🌊 读写世界观 · 本章的位置</span>前端从本章起正式分成两种状态:<b>服务端状态</b>(订单列表、支付状态——真相在数据库,前端持有的是<b>带 TTL 的缓存副本</b>)与<b>客户端状态</b>(输入框的筛选词——真相就在组件里)。Query 管前者。缓存的读是"先查坐标再决定回源",缓存的写是"<b>失效,而不是双写</b>"——你后端的老答案,在界面层原样生效。</div>
<div class="fourq">
  <div><b>目的</b>界面快、省请求,且永远显示"权威副本"。</div>
  <div><b>形式</b>queryKey 坐标 + staleTime 新鲜窗 + invalidateQueries 失效。</div>
  <div><b>质料</b>内存缓存表、Promise 去重、gcTime 回收。</div>
  <div><b>动力</b>S28/S29 真家伙实验;Capstone 三端共用这套纪律。</div>
</div>
<div class="depth-tag">第 ① 层 · 直觉</div>
<h3>一台长在浏览器里的 Caffeine</h3>
<p>对照表先给,本 warmer 的任务是把每行对到你用过的 API:key(Caffeine 的 get(key))、TTL(expireAfterWrite)、evict(invalidate)、回源(cacheLoader)、请求合并(singleflight)。工具换了,物理没换——<b>这章你的起点比别人高十年</b>。</p>
<div class="depth-tag">第 ② 层 · 机制(模拟器逐幕演出)</div>
<h3>queryKey:缓存坐标,一个不能少</h3>
<pre>queryKey: ['orders', filter]   // 完整坐标:接口 + 全部参数</pre>
<p>key 少放一个变量 = 缓存串数据(门诊 3 号):筛选"老张"命中了"老王"的缓存,而且<b>静默无错</b>。你给 Caffeine 设计时不会犯,因为 key 是显式参数;这里它长得像数组,降低了警觉。<b>规范一句话:key 里放这条数据的完整坐标。</b></p>
<h3>staleTime:TTL 的前端口味</h3>
<pre>staleTime: 30_000   // 30 秒内同 key 直接收缓存</pre>
<p>默认 0——<b>缓存默认立场是"宁可多查,不可给旧"</b>:界面上的旧数据用户看得见。和你在服务端"为省 DB 敢给长 TTL"的动机正相反,但取舍的语法相同:问"这个数据的读者能容忍多旧"。过期的数据先给、后台换新(stale-while-revalidate)——你早见过的折中。</p>
<h3>写后失效:invalidate,不做双写</h3>
<pre>await qc.invalidateQueries({ queryKey: ['orders'] })  // 支付成功后</pre>
<p>为什么不把支付结果塞进缓存?写只能保证<b>那一行</b>新,列表的合计、排序、权限过滤都由服务端算——让读自己回源,<b>一致性不靠客户端聪明,靠"读永远是权威副本"</b>。evict-on-write,和"缓存不做双写"是同一句祖训。附带红利:并发去重(singleflight)让同一 key 的 5 个并发请求合并成 1 次回源——网关合并回源的前端版。</p>
<div class="depth-tag">第 ③ 层 · 往下挖一层</div>
<h3>服务端状态与客户端状态的分家</h3>
<p>用 useState 存服务端数据 = 把数据库副本手抄进组件,抄完不更新——<b>数据与视图分家</b>(c06 的翻车现场,换了个起因)。分工:Query 管服务端状态(带 TTL 的缓存),useState/Zustand 管客户端状态(输入词、抽屉开合)。判断口诀:<b>真相在服务器,就是服务端状态</b>。</p>
<h3>对暗号</h3>
<table>
<tr><th>Java 后端</th><th>TanStack Query</th><th>一句话</th></tr>
<tr><td>Caffeine.get(key)</td><td>queryKey 数组(深度相等)</td><td>坐标唯一,一个不少</td></tr>
<tr><td>expireAfterWrite</td><td>staleTime(默认 0)</td><td>新鲜优先于省请求</td></tr>
<tr><td>evict / 失效广播</td><td>invalidateQueries</td><td>写后失效,不做双写</td></tr>
<tr><td>singleflight 合并回源</td><td>同 key 并发去重</td><td>并发窗口内只回源一次</td></tr>
<tr><td>cacheLoader 回源</td><td>queryFn</td><td>回源函数即读取路径</td></tr>
<tr><td>maximumSize / 驱逐</td><td>gcTime(默认 5 分钟)</td><td>不活跃才回收</td></tr>
</table>
<h3>发散问题</h3>
<ol>
<li>staleTime 拉长,省了请求,用户看到什么?给"订单列表"和"汇率"各定一个 TTL,说出你的容忍度逻辑。</li>
<li>queryKey 用对象参数({page:1})时,什么情况下两个"相同"的 key 不命中同一缓存?(提示:字段顺序、序列化稳定性)</li>
<li>失效的粒度:invalidateQueries(['orders']) 是前缀匹配。粒度太粗浪费什么?太细漏什么?</li>
</ol>
<p class="soul">🤔 留给你想:服务端缓存为"省"而生,前端缓存为"快与稳"而生——同一个机制,两种 KPI,而取舍的问题都指向同一句:<b>这个数据的读者能容忍多旧?</b>设计缓存时先找读者,再定参数。这句话对服务端和前端各怎么落地?</p>
<p class="punch">📍 <b>不变量打卡</b>:本章填"数据怎么流动"行——<code>服务端状态＝带 TTL 的缓存副本;queryKey＝缓存坐标;invalidate＝写后失效(不做双写);singleflight＝并发合并回源</code>。顺带在"怎么不打架"行记一笔:多端一致性靠"读永远回源",不靠各端聪明。</p>
<details class="refs"><summary>🏛 权威佐证与延伸</summary><ul>
<li><b>TanStack Query 官方文档</b>(tanstack.com/query)。重点《Queries》《Query Invalidation》——把对照表逐条对回去。</li>
<li><b>MDN · HTTP caching</b>。stale-while-revalidate 的 HTTP 层原版——浏览器缓存与 Query 缓存是两层,本章管内存层。</li>
<li><b>Go singleflight 包文档</b>(pkg.go.dev → golang.org/x/sync/singleflight)。请求合并的祖师爷,50 行读完。</li>
<li><b>延伸 · 一词之差</b>:stale(陈旧)与"脏"不是一个词——脏是"写了没同步"(关于写),stale 是"过了 TTL 但仍是上次真相"(关于读)。设计失效策略时,先分清你在治哪种病。</li>
</ul></details>`,
    quiz: [
      {
        q: 'queryKey: ["orders"] 没包含 filter,会发生什么?', kind: 'choice',
        options: [
          { t: '不同筛选共用同一缓存格——筛选"老张"命中"老王"的数据,静默无错', correct: true, why: '' },
          { t: 'TanStack 自动把参数补进 key', correct: false, why: '' },
          { t: '直接报错提醒你 key 不完整', correct: false, why: '' },
        ],
        why: '缓存串数据是最危险的静默错误。key 里放"这条数据的完整坐标",一个不能少——Caffeine 的老规矩,换了件数组的衣服。',
      },
      {
        q: 'staleTime 的默认值是 0(立即过期)。这个默认的哲学是?', kind: 'choice',
        options: [
          { t: '缓存默认立场"宁可多查,不可给旧"——界面上的旧数据用户看得见', correct: true, why: '' },
          { t: '性能优化:逼你显式配缓存', correct: false, why: '' },
          { t: '历史遗留,没有深意', correct: false, why: '' },
        ],
        why: '和你在服务端"为省 DB 敢给长 TTL"的动机正相反。取舍的问题都是同一句:读者能容忍多旧?',
      },
      {
        q: '支付成功后,为什么 invalidate 列表缓存而不是把新值写进缓存?', kind: 'choice',
        options: [
          { t: '写只保证那一行新;列表的合计/排序/权限都由服务端算——让读回源,一致性靠权威副本', correct: true, why: '' },
          { t: 'TanStack 不支持直接修改缓存', correct: false, why: '' },
          { t: '双写会触发接口限流', correct: false, why: '' },
        ],
        why: 'evict-on-write,不做双写——你后端缓存的祖训。一致性不靠客户端聪明,靠"读永远是权威副本"。',
      },
      {
        q: '5 个组件同时挂载,发起相同 queryKey 的请求,接口会被调用几次?去重的窗口边界在哪?', kind: 'text',
        why: '参考:并发窗口内合并为 1 次(singleflight);窗口外(第一个完成后才发起)走缓存判 staleTime。窗口边界 = 同一 key 的 Promise 在飞行中,后来者 await 同一份。',
      },
    ],
    sim: { type: 'query' },
  },
];
