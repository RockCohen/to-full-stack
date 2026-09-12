#!/usr/bin/env python3
"""把 media/ 下的三段短片与封面帧以 base64 data URI 内嵌进 index.html，
使页面恢复为真正的零依赖单文件（file:// 双击即可播放，无需 media/ 目录随行）。
media/ 目录仍保留：作为渲染产物原件与改剧本重渲的输出目标。
用法：python3 embed_media.py   （在 mcs-interactive/ 目录下运行）
"""
import base64
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # mcs-interactive/
HTML = ROOT / "ch01.html"  # 短片目前只嵌在第一章；后续章节沿用 ANCHORS 机制时再扩展
MEDIA = ROOT / "media"

VIDEOS = ["prime41", "sqrt2"]  # party 有意不嵌：六人派对的 HTML 互动已优于线性视频（见 README 适配性原则）

# 影院块说明文字里的唯一锚点（内嵌后 src 已是 data URI，只能靠文案定位）
ANCHORS = {
    "prime41": "断言的葬礼",
    "party": "逃无可逃",
    "sqrt2": "无限逼近，永不重合",
}


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


def make_poster(mp4: Path, out: Path) -> None:
    """从短片 60% 处抽一帧压成 480px 宽的 jpeg 当封面。"""
    dur = float(subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(mp4)],
        capture_output=True, text=True, check=True).stdout.strip())
    subprocess.run(
        ["ffmpeg", "-y", "-v", "quiet", "-ss", str(dur * 0.6), "-i", str(mp4),
         "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "7", str(out)],
        check=True)


def remove(name: str) -> None:
    """从 index.html 撤除某段短片的影院块（适配性调整用：HTML 互动已覆盖的内容不嵌视频）。"""
    html = HTML.read_text(encoding="utf-8")
    pat = re.compile(
        r'\n  <div class="cinema reveal">\n(?:(?!</div>).)*?'
        + ANCHORS[name]
        + r'(?:(?!</div>).)*?</div>\n', re.S)
    html2, n = pat.subn("\n", html)
    if n == 0:
        sys.exit(f"未找到 {name} 的影院块")
    HTML.write_text(html2, encoding="utf-8")
    print(f"已撤除 {name} 影院块（-{(len(html)-len(html2))//1024} KB）")


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "remove":
        if len(sys.argv) != 3:
            sys.exit("用法: embed_media.py remove <prime41|party|sqrt2>")
        remove(sys.argv[2])
        return
    html = HTML.read_text(encoding="utf-8")
    total_before = len(html)

    for name in VIDEOS:
        mp4 = MEDIA / f"{name}.mp4"
        poster = MEDIA / f"{name}-poster.jpg"
        if not mp4.exists():
            sys.exit(f"缺少 {mp4}，请先渲染或恢复 media/ 目录")
        make_poster(mp4, poster)

        pattern = re.compile(
            r'<video[^>]*poster="media/' + name + r'-poster\.jpg"[^>]*src="media/'
            + name + r'\.mp4"[^>]*></video>')
        if not pattern.search(html):
            print(f"跳过 {name}：未找到引用标签（可能已内嵌）")
            continue

        replacement = (
            f'<video controls loop muted playsinline preload="auto" '
            f'aria-label="Manim 动画短片（已内嵌）" '
            f'poster="data:image/jpeg;base64,{b64(poster)}">'
            f'<source src="data:video/mp4;base64,{b64(mp4)}" type="video/mp4">'
            f'</video>')
        html = pattern.sub(lambda m: replacement, html, count=1)
        print(f"已内嵌 {name}（视频 {mp4.stat().st_size//1024} KB + 封面 {poster.stat().st_size//1024} KB）")

    HTML.write_text(html, encoding="utf-8")
    print(f"index.html：{total_before//1024} KB → {len(html.encode())//1024} KB")


if __name__ == "__main__":
    main()
