"""Drives Fixer's hook handlers with a fake Win32 layer."""

import sys
import types

import pytest

from engine import BUILTIN_TABLES, EN, KA, RU

HKL = {EN: 0x04090409, RU: 0x04190419, KA: 0xF0310437}


class FakeWin(types.ModuleType):
    VK_BACK, VK_TAB, VK_RETURN, VK_SHIFT = 0x08, 0x09, 0x0D, 0x10
    VK_CONTROL, VK_MENU, VK_PAUSE, VK_CAPITAL = 0x11, 0x12, 0x13, 0x14
    VK_SPACE, VK_LWIN, VK_RWIN = 0x20, 0x5B, 0x5C

    def __init__(self):
        super().__init__("winapi")
        self.layout = HKL[EN]
        self.held = set()
        self.switched = []

    def foreground_window(self):
        return 1

    def current_layout(self, hwnd=None):
        return self.layout

    def installed_layouts(self):
        return list(HKL.values())

    def langid_of(self, hkl):
        return hkl & 0xFFFF

    def read_layout_table(self, hkl):
        lang = {v: k for k, v in HKL.items()}[hkl]
        return BUILTIN_TABLES[lang]

    def key_down(self, vk):
        return vk in self.held

    def caps_on(self):
        return False


@pytest.fixture
def env(monkeypatch, detector):
    fake = FakeWin()
    monkeypatch.setitem(sys.modules, "winapi", fake)
    sys.modules.pop("app", None)
    import app
    fixer = app.Fixer()
    fixer.refresh_layouts()
    fixer.detector = detector
    done = []
    fixer.replace = lambda erase, text, hkl, vk: done.append((erase, text, hkl, vk))
    monkeypatch.setattr(app, "add_exception", lambda word: None)
    return fake, fixer, done


REVERSE = {lang: {ch: key for key, ch in reversed(list(t.items()))}
           for lang, t in BUILTIN_TABLES.items()}


def type_text(fake, fixer, lang, text):
    """Press the keys that give `text` in layout `lang`; return swallowed flags."""
    swallowed = []
    for ch in text:
        if ch == " ":
            swallowed.append(fixer.on_key(fake.VK_SPACE))
            continue
        vk, shift = REVERSE[lang][ch]
        if shift:
            fake.held.add(fake.VK_SHIFT)
        swallowed.append(fixer.on_key(vk))
        fake.held.discard(fake.VK_SHIFT)
    return swallowed


def run_actions(fixer):
    while not fixer.actions.empty():
        fixer.actions.get()()


def test_georgian_typed_in_english_is_fixed(env):
    fake, fixer, done = env
    swallowed = type_text(fake, fixer, KA, "გამარჯობა ")
    assert swallowed[-1] is True          # the space is held back and retyped
    run_actions(fixer)
    assert done == [(9, "გამარჯობა", HKL[KA], fake.VK_SPACE)]


def test_correct_word_passes_through(env):
    fake, fixer, done = env
    swallowed = type_text(fake, fixer, EN, "hello ")
    run_actions(fixer)
    assert not any(swallowed) and done == []


def test_backspace_edits_the_word(env):
    fake, fixer, done = env
    type_text(fake, fixer, RU, "приветт")
    fixer.on_key(fake.VK_BACK)
    type_text(fake, fixer, RU, " ")
    run_actions(fixer)
    assert done == [(6, "привет", HKL[RU], fake.VK_SPACE)]


def test_pause_undoes_fix_and_remembers(env):
    fake, fixer, done = env
    type_text(fake, fixer, KA, "გამარჯობა ")
    assert fixer.on_key(fake.VK_PAUSE) is True
    run_actions(fixer)
    assert done[-1] == (10, "gamarjoba", HKL[EN], fake.VK_SPACE)
    assert "gamarjoba" in fixer.detector.exceptions
    fixer.detector.exceptions.discard("gamarjoba")


def test_pause_converts_current_word_by_hand(env):
    fake, fixer, done = env
    type_text(fake, fixer, EN, "qwe")
    fixer.on_key(fake.VK_PAUSE)
    run_actions(fixer)
    assert done == [(3, "йцу", HKL[RU], None)]


def test_ctrl_shortcut_resets_word(env):
    fake, fixer, done = env
    type_text(fake, fixer, KA, "გამარ")
    fake.held.add(fake.VK_CONTROL)
    fixer.on_key(ord("A"))
    fake.held.clear()
    type_text(fake, fixer, KA, "ჯობა ")
    run_actions(fixer)
    assert done == []
