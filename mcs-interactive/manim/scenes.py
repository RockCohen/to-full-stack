"""
MCS 第 1 章 · Manim 影院短片（3 段）
渲染：manim/.venv/bin/manim -qm scenes.py Prime41  → media/
全部数学用 Unicode 文本（不依赖 LaTeX）。中文字体：PingFang SC。
"""
from manim import *

CJK = "PingFang SC"
RED_P = "#c0392b"
BLUE_P = "#2471a3"
AMBER_P = "#b4832a"
PAPER = "#f7f4ee"
INK = "#2b2a26"


class Prime41(Scene):
    """断言 p(n)=n²+n+41：39 连击 → n=40 崩塌。对应互动②。"""

    def construct(self):
        self.camera.background_color = PAPER

        title = Text("断言：p(n) = n² + n + 41 全是素数", font=CJK, font_size=34, color=INK)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=1.4)

        cols, cw, ch = 10, 1.02, 0.66
        cells = VGroup()
        for n in range(40):
            v = n * n + n + 41
            box = RoundedRectangle(
                corner_radius=0.07, width=cw, height=ch,
                stroke_color="#a9cdb8", stroke_width=1.4,
                fill_color="#2e7d4f", fill_opacity=0.14)
            top = Text(f"n={n}", font=CJK, font_size=11, color="#6f6a5e")
            bot = Text(str(v), font=CJK, font_size=15, color=INK)
            top.next_to(box.get_top(), DOWN, buff=0.06)
            bot.move_to(box.get_center()).shift(DOWN * 0.08)
            cells.add(VGroup(box, top, bot))
        cells.arrange_in_grid(rows=4, cols=cols, buff=(0.14, 0.18))
        cells.next_to(title, DOWN, buff=0.55).shift(DOWN * 0.15)

        counter = Text("连续命中 0 / 40", font=CJK, font_size=24, color="#2e7d4f")
        counter.next_to(cells, DOWN, buff=0.35)

        self.play(FadeIn(counter, shift=UP * 0.2), run_time=0.5)
        anims = []
        for i, c in enumerate(cells):
            anims.append(AnimationGroup(
                FadeIn(c, scale=0.6), Flash(c, color="#2e7d4f", flash_radius=0.28, num_lines=6, time_width=0.6)))
        self.play(LaggedStart(*anims, lag_ratio=0.09), run_time=4.6)
        for k in (10, 20, 30, 40):
            new = Text(f"连续命中 {k} / 40", font=CJK, font_size=24, color="#2e7d4f").move_to(counter)
            self.play(Transform(counter, new), run_time=0.25)

        p40 = cells[40 - 1] if False else None  # noqa: 占位防误读
        crash = VGroup(
            Text("n = 40", font=CJK, font_size=40, color=RED_P),
            Text("40² + 40 + 41 = 1681 = 41 × 41", font=CJK, font_size=34, color=RED_P),
            Text("不是素数！", font=CJK, font_size=40, color=RED_P),
        ).arrange(DOWN, buff=0.3)

        self.play(FadeOut(counter), cells.animate.set_opacity(0.25), run_time=0.6)
        self.play(FadeTransform(title, crash), run_time=0.9)
        self.play(Indicate(crash[2], color=RED_P), Wiggle(crash[1], scale_value=1.06), run_time=1.1)
        self.play(Flash(crash, color=RED_P, flash_radius=2.2, num_lines=16), run_time=0.7)
        self.wait(0.3)

        moral = Text("40 个例子 ≠ 证明；1 个反例 = 推翻", font=CJK, font_size=28, color=AMBER_P)
        moral.next_to(crash, DOWN, buff=0.5)
        self.play(Write(moral), run_time=1.2)
        self.wait(2.2)


class ApproachingSqrt2(Scene):
    """a² vs 2b² 永远差 1：逼近 √2 但永不重合。对应互动⑨。"""

    def construct(self):
        self.camera.background_color = PAPER
        title = Text("猎捕 a² = 2b²：无限逼近，永不重合", font=CJK, font_size=32, color=INK)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=1.2)

        pairs = [(1, 1), (3, 2), (7, 5), (17, 12)]
        frac_txt = ["1 / 1 = 1", "3 / 2 = 1.5", "7 / 5 = 1.4", "17 / 12 ≈ 1.4167"]
        scale = 3.6 / (2 * 12 * 12)  # 最大值 288 → 3.6 宽

        rows = VGroup()
        for (a, b), ft in zip(pairs, frac_txt):
            l2, r2 = a * a, 2 * b * b
            lbl = Text(f"a={a}, b={b}", font=CJK, font_size=20, color=INK)
            bar1 = Rectangle(width=max(l2 * scale, 0.06), height=0.42, fill_color="#2471a3",
                             fill_opacity=0.9, stroke_color="#2471a3", stroke_width=1.5)
            v1 = Text(f"a² = {l2}", font=CJK, font_size=17, color="#1a4d81").next_to(bar1, RIGHT, buff=0.12)
            bar2 = Rectangle(width=max(r2 * scale, 0.06), height=0.42, fill_color="#c0392b",
                             fill_opacity=0.9, stroke_color="#c0392b", stroke_width=1.5)
            v2 = Text(f"2b² = {r2}", font=CJK, font_size=17, color="#8f2b24").next_to(bar2, RIGHT, buff=0.12)
            col = VGroup(bar1, v1, bar2, v2).arrange(RIGHT, buff=0.12)
            diff = Text("差 −1" if l2 < r2 else "差 +1", font=CJK, font_size=17,
                        color=AMBER_P, weight=BOLD)
            diff.next_to(col, RIGHT, buff=0.35)
            fr = Text(ft, font=CJK, font_size=17, color="#6f6a5e").next_to(lbl, DOWN, buff=0.02)
            row = VGroup(VGroup(lbl, fr).arrange(DOWN, buff=0.05), col, diff).arrange(RIGHT, buff=0.5)
            rows.add(row)
        rows.arrange(DOWN, buff=0.42, aligned_edge=LEFT)
        rows.next_to(title, DOWN, buff=0.5)

        for row in rows:
            b1, b2 = row[1][0], row[1][2]
            self.play(
                FadeIn(row[0], shift=RIGHT * 0.3),
                GrowFromEdge(b1, LEFT), GrowFromEdge(b2, LEFT),
                FadeIn(row[1][1], shift=RIGHT * 0.3), FadeIn(row[1][3], shift=RIGHT * 0.3),
                FadeIn(row[2], scale=0.7),
                run_time=1.15)

        note = Text("|a² − 2b²| = 1：差可以永远是 1，但永远 ≠ 0", font=CJK, font_size=26, color=AMBER_P)
        note.next_to(rows, DOWN, buff=0.5)
        self.play(Write(note), run_time=1.2)

        punch = Text("所以 √2 不能写成分数 —— 这就是无理数", font=CJK, font_size=30, color="#0f4c81", weight=BOLD)
        punch.next_to(note, DOWN, buff=0.42)
        self.play(FadeIn(punch, shift=UP * 0.25), Circumscribe(punch, color="#0f4c81"), run_time=1.3)
        self.wait(2.4)


class PartyK6(Scene):
    """六人派对：任何红蓝涂法必有同色三角形，R(3,3)=6。对应互动⑦。"""

    def construct(self):
        self.camera.background_color = PAPER
        names = ["甲", "乙", "丙", "丁", "戊", "己"]
        R = 2.1
        pos = [np.array([R * np.cos(-PI / 2 + i * TAU / 6), R * np.sin(-PI / 2 + i * TAU / 6), 0])
               for i in range(6)]

        title = Text("任意 6 人，必有 3 人互相认识或 3 人互不相识", font=CJK, font_size=28, color=INK)
        title.to_edge(UP, buff=0.4)
        sub = Text("红 = 认识　蓝 = 不认识", font=CJK, font_size=20, color="#6f6a5e")
        sub.next_to(title, DOWN, buff=0.22)
        self.play(Write(title), FadeIn(sub), run_time=1.3)

        dots = VGroup(*[Dot(p, radius=0.16, color=INK, z_index=3) for p in pos])
        labels = VGroup()
        for nm, p in zip(names, pos):
            t = Text(nm, font=CJK, font_size=24, color=INK, z_index=4)
            t.move_to(p + (p - np.array([0, 0, 0])) / R * 0.44)  # 沿径向外移，避免压在点上
            labels.add(t)
        edges = {}
        for i in range(6):
            for j in range(i + 1, 6):
                ln = Line(pos[i], pos[j], stroke_color="#d8d0bf", stroke_width=5, z_index=1)
                edges[(i, j)] = ln
        graph = VGroup(*edges.values())
        dots.shift(UP * 0.2)
        labels.shift(UP * 0.2)

        self.play(Create(graph), run_time=1.0)
        self.play(FadeIn(dots), FadeIn(labels), run_time=0.6)

        def key(i, j):
            return (i, j) if i < j else (j, i)

        # 蓝：两个三角形之间的所有连线（K3,3）；红：圈 甲乙丙丁戊己 的环边
        blue_pairs = [(0, 3), (0, 4), (1, 4), (1, 5), (2, 5), (2, 3)]
        red_pairs = [(3, 4), (4, 5), (5, 3), (0, 1), (1, 2)]
        self.play(*[edges[key(*p)].animate.set_color(BLUE_P) for p in blue_pairs],
                  LaggedStart(*[edges[key(*p)].animate.set_color(RED_P) for p in red_pairs],
                              lag_ratio=0.12),
                  run_time=2.2)

        # 最后一条红边封三角，甲乙丙成同色三角
        last = edges[(0, 2)]
        tri = Polygon(pos[0], pos[1], pos[2], stroke_color=RED_P, stroke_width=7,
                      fill_color=RED_P, fill_opacity=0.25, z_index=2).shift(UP * 0.2)
        self.play(last.animate.set_color(RED_P), run_time=0.5)
        self.play(FadeIn(tri), run_time=0.4)
        self.play(Flash(tri, color=RED_P, flash_radius=1.6, num_lines=12), run_time=0.7)
        self.wait(0.4)

        verdict = Text("撞出同色三角形：甲–乙–丙", font=CJK, font_size=26, color=RED_P)
        verdict.next_to(graph, DOWN, buff=0.4)
        self.play(FadeIn(verdict, shift=UP * 0.2), run_time=0.6)
        self.wait(0.5)

        stat = Text("随机涂 500 次：0 次逃逸", font=CJK, font_size=24, color=INK)
        stat.next_to(verdict, RIGHT, buff=0.6).align_to(verdict, UP)
        self.play(FadeIn(stat), run_time=0.6)
        self.wait(0.4)

        final = Text("R(3,3) = 6：逃无可逃，这就是定理", font=CJK, font_size=30,
                     color="#0f4c81", weight=BOLD)
        final.to_edge(UP, buff=0.4)
        self.play(FadeOut(title), FadeOut(sub), FadeTransform(verdict, final),
                  tri.animate.set_opacity(0.12), run_time=1.2)
        self.play(Circumscribe(final, color="#0f4c81"), run_time=1.0)
        self.wait(2.4)
