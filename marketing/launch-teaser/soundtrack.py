"""Synthesises soundtrack.wav (20s, 120 BPM) with hits locked to the teaser timeline."""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
mix = np.zeros((2, N))
send = np.zeros((2, N))

KICKS = [2.0 + 0.5 * i for i in range(22)] + [14.0 + 0.5 * i for i in range(9)]
GROOVES = [(2.0, 13.0), (14.0, 18.0)]


def tt(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def band(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    f[0] = 1
    m = 1 / (1 + (lo / f) ** 4) / (1 + (f / hi) ** 4)
    return np.fft.irfft(np.fft.rfft(x) * m, n=len(x))


def tv_band(x, lo_fn, hi_fn, win=1024):
    hop = win // 2
    w = np.hanning(win)
    pad = np.concatenate([np.zeros(win), x, np.zeros(win)])
    out = np.zeros_like(pad)
    f = np.fft.rfftfreq(win, 1 / SR)
    f[0] = 1
    for s in range(0, len(pad) - win, hop):
        tc = (s + win / 2 - win) / SR
        m = 1 / (1 + (lo_fn(tc) / f) ** 4) / (1 + (f / hi_fn(tc)) ** 4)
        out[s:s + win] += np.fft.irfft(np.fft.rfft(pad[s:s + win] * w) * m, n=win)
    return out[win:win + len(x)]


def place(sig, t, gain=1.0, pan=0.0, rev=0.0):
    sig = np.vstack([sig, sig]) if sig.ndim == 1 else sig
    i = int(t * SR)
    n = min(sig.shape[1], N - i)
    if n <= 0:
        return
    g = np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)]) * np.sqrt(2) * gain
    mix[:, i:i + n] += sig[:, :n] * g[:, None]
    send[:, i:i + n] += sig[:, :n] * g[:, None] * rev


# ---------- instruments ----------
def kick():
    t = tt(0.5)
    f = 48 + 120 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 6.5) + 0.35 * np.sin(2 * ph) * np.exp(-t * 14)
    s += 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 250)
    return np.tanh(s * 1.7)


def clap():
    t = tt(0.35)
    env = sum((t >= o) * np.exp(-np.maximum(t - o, 0) * d) for o, d in ((0, 90), (0.011, 90), (0.022, 16)))
    body = 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return band(rng.standard_normal(len(t)) * env, 900, 6000) * 1.2 + body


def hat(open_=False):
    t = tt(0.32 if open_ else 0.06)
    return band(rng.standard_normal(len(t)), 7000, 16000) * np.exp(-t * (13 if open_ else 70))


def crash(d=2.4):
    t = tt(d)
    n = np.vstack([rng.standard_normal(len(t)), rng.standard_normal(len(t))])
    return np.vstack([band(c, 3000, 15000) for c in n]) * np.exp(-t * 1.9)


def bell(f, d=1.4):
    t = tt(d)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * dec)
            for k, a, dec in ((1, 1, 3), (2.76, .35, 6), (5.4, .15, 9), (0.5, .12, 2)))
    return s * np.minimum(1, t / 0.003)


def sparkle(t0, root=88, gain=0.22):
    for i, m in enumerate((0, 4, 7, 12, 16, 19)):
        place(bell(mtof(root + m)), t0 + i * 0.04, gain * (1 - i * 0.09), pan=(i - 2.5) * 0.25, rev=0.7)


def pluck(f, d=0.9):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (4 + k * 3)) for k in range(1, 8))
    return s * np.minimum(1, t / 0.002)


def whoosh(d=0.7, f0=300, f1=7000):
    t = tt(d)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2

    def centre(x):
        p = np.clip(x / d, 0, 1)
        return f0 * (f1 / f0) ** (np.sin(np.pi * p) if p < 1 else 0)
    n = rng.standard_normal(len(t)) * env
    return tv_band(n, lambda x: centre(x) * 0.5, lambda x: centre(x) * 2.0)


def riser(d):
    t = tt(d)
    p = t / d
    n = tv_band(rng.standard_normal(len(t)), lambda x: 300 + 3000 * (x / d) ** 2, lambda x: 1200 + 12000 * (x / d) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 4 ** p) / SR) * 0.25
    return (n * 0.8 + tone) * p ** 2


def impact():
    t = tt(2.8)
    f = 36 + 70 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 1.5) + 0.5 * np.sin(2 * ph) * np.exp(-t * 3)
    s += band(rng.standard_normal(len(t)), 60, 2500) * np.exp(-t * 3) * 0.7
    return np.tanh(s * 1.5)


def tick(f=2800):
    t = tt(0.025)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 350)


def error_blip():
    out = np.zeros(int(0.3 * SR))
    for i, f in enumerate((233, 175)):
        t = tt(0.1)
        b = np.tanh(3 * np.sin(2 * np.pi * f * t)) * np.exp(-t * 18)
        s = int(i * 0.12 * SR)
        out[s:s + len(b)] += b
    return band(out, 80, 2500)


def swipe():
    t = tt(0.28)
    return tv_band(rng.standard_normal(len(t)) * np.exp(-((t - .1) / .07) ** 2),
                   lambda x: 1500 + 20000 * x, lambda x: 5000 + 40000 * x)


# ---------- harmony ----------
CHORDS = {'Am': (57, 60, 64, 69), 'F': (53, 57, 60, 65), 'C': (60, 64, 67, 72), 'G': (55, 59, 62, 67)}
ROOTS = {'Am': 45, 'F': 41, 'C': 48, 'G': 43}
PROG = [(0, 'Am'), (2, 'Am'), (4, 'F'), (6, 'C'), (8, 'G'), (10, 'F'), (12, 'G'), (14, 'C'), (16, 'F'), (18, 'C')]


def pad_layer():
    out = np.zeros((2, N))
    for idx, (t0, name) in enumerate(PROG):
        t1 = PROG[idx + 1][0] if idx + 1 < len(PROG) else DUR
        d = t1 - t0 + 0.5
        t = tt(d)
        atk = 1.2 if t0 == 0 else 0.08
        env = np.minimum(1, t / atk) * np.clip((d - t) / 0.5, 0, 1)
        for m in CHORDS[name]:
            for det, pan in ((-0.08, -0.7), (0, 0), (0.08, 0.7)):
                ph = (mtof(m + det) * t + rng.random()) % 1
                saw = (2 * ph - 1) * env * 0.05
                i = int(t0 * SR)
                n = min(len(t), N - i)
                out[0, i:i + n] += saw[:n] * (1 - pan) / 2
                out[1, i:i + n] += saw[:n] * (1 + pan) / 2

    def cutoff(x):
        if x < 2: return 400 + 600 * x / 2
        if x < 13: return 1900
        if x < 14: return 1900 + 5000 * (x - 13)
        if x < 18: return 5000
        return 5000 - 3800 * min(1, (x - 18) / 2)
    return np.vstack([tv_band(c, lambda x: 90, cutoff, win=2048) for c in out])


def bass_layer():
    out = np.zeros(N)
    for a, b in GROOVES:
        for k in range(int((b - a) / 0.25)):
            t0 = a + k * 0.25
            name = [c for s, c in PROG if s <= t0][-1]
            f = mtof(ROOTS[name])
            t = tt(0.24)
            s = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * 2 * f * t)
                 + 0.3 * ((2 * ((2 * f * t) % 1) - 1))) * np.exp(-t * 7)
            i = int(t0 * SR)
            out[i:i + len(s)] += s[:N - i] * (1.0 if k % 2 == 0 else 0.7)
    return band(out, 30, 1400)


def sidechain():
    g = np.ones(N)
    t = np.arange(N) / SR
    for k in KICKS:
        dt = t - k
        g *= 1 - 0.55 * np.where((dt >= 0) & (dt < 0.5), np.exp(-dt * 11), 0)
    return g


# ---------- arrangement ----------
def arrange():
    sc = sidechain()
    pad = pad_layer() * sc
    mix[:] += pad * 1.0
    send[:] += pad * 0.35
    bass = bass_layer() * sc * 0.32
    mix[:] += bass

    for k in KICKS:
        place(kick(), k, 0.95)
    for a, b in GROOVES:
        for bar in np.arange(a, b, 2.0):
            for off in (0.5, 1.5):
                if bar + off < b:
                    place(clap(), bar + off, 0.33, rev=0.25)
        for x in np.arange(a + 0.25, b, 0.5):
            place(hat(open_=True), x, 0.08, pan=0.25)
        for x in np.arange(max(a, 6.0), b, 0.125):
            place(hat(), x, 0.05 if (x * 4) % 1 else 0.035, pan=-0.3)

    # intro: sparkle, word blips, riser into the flash at 2.0
    sparkle(0.15, root=88, gain=0.2)
    for i, x in enumerate((0.6, 0.85, 1.1, 1.35)):
        place(pluck(mtof(76 + (0, 3, 7, 12)[i])), x, 0.12, pan=(i - 1.5) * 0.3, rev=0.5)
    place(riser(1.2), 0.8, 0.35)
    place(whoosh(0.5, 800, 9000), 1.65, 0.3)
    place(crash(), 2.0, 0.28, rev=0.3)

    # scene 2
    place(crash(1.6), 3.5, 0.2)
    sparkle(3.52, root=91, gain=0.16)
    place(swipe(), 5.48, 0.55, pan=0.2)

    # wipes
    for c in (6.0, 10.0):
        place(whoosh(0.8), c - 0.4, 0.5)

    # scene 3: counter ticks (eased like the visual), zero error, headline hit
    for i in range(1, 30):
        p = i / 30
        x = 6.5 + 1.2 * (1 - (1 - p) ** 0.25)
        place(tick(2400 + i * 40), x, 0.18, pan=0.3)
    place(error_blip(), 7.5, 0.3)
    place(crash(1.2), 8.75, 0.16)

    # scene 4: rising plucks per step, headline sparkle
    for x, m in ((10.5, 69), (11.0, 72), (11.5, 76), (12.5, 81)):
        place(pluck(mtof(m)), x, 0.3, rev=0.5)
    sparkle(12.52, root=93, gain=0.14)

    # build: snare roll + riser, cut before the drop
    roll, x = [], 13.0
    for step, count in ((0.25, 2), (0.125, 2), (0.0625, 4)):
        for _ in range(count):
            roll.append(x)
            x += step
    for i, x in enumerate(roll):
        place(clap(), x, 0.18 + 0.05 * i, rev=0.2)
    place(riser(1.0), 12.95, 0.5)

    # drop
    place(impact(), 14.0, 0.95, rev=0.4)
    place(crash(), 14.0, 0.35, rev=0.3)
    sparkle(14.6, root=88, gain=0.26)
    sparkle(16.6, root=91, gain=0.12)
    place(crash(), 18.0, 0.22, rev=0.4)
    place(kick(), 18.0, 0.9)
    sparkle(18.05, root=88, gain=0.16)


def reverb(x):
    ir_len = int(2.4 * SR)
    t = np.arange(ir_len) / SR
    out = []
    for ch in range(2):
        ir = band(rng.standard_normal(ir_len), 200, 7000) * np.exp(-t * 2.6)
        size = 1 << int(np.ceil(np.log2(N + ir_len)))
        y = np.fft.irfft(np.fft.rfft(x[ch], size) * np.fft.rfft(ir, size), size)[:N]
        out.append(y)
    y = np.vstack(out)
    return y / np.abs(y).max()


def main():
    arrange()
    wet = reverb(send) * np.abs(send).max() * 0.22
    out = mix + wet
    out /= np.abs(out).max()
    out = np.tanh(out * 1.8) / np.tanh(1.8)
    t = np.arange(N) / SR
    out *= np.minimum(1, t / 0.02) * np.clip((DUR - t) / 1.2, 0, 1)
    out = out / np.abs(out).max() * 0.93
    pcm = (out.T * 32767).astype('<i2')
    path = Path(__file__).with_name('soundtrack.wav')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('wrote', path)


if __name__ == '__main__':
    main()
