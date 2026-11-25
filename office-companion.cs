using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

sealed class OfficeCompanion {
    readonly Queue<long> keystrokes = new Queue<long>();
    long lastInteraction, nextTyping, focusStart;
    int loneliness;
    bool away;

    public void Reset(long now) {
        keystrokes.Clear();
        lastInteraction = focusStart = nextTyping = now;
        loneliness = 0;
        away = false;
    }

    public void Interact(long now) {
        lastInteraction = now;
        loneliness = 0;
        keystrokes.Clear();
    }

    public void KeyReleased(long now) {
        Trim(now);
        keystrokes.Enqueue(now);
    }

    void Trim(long now) {
        while (keystrokes.Count != 0 && now - keystrokes.Peek() > 2200) keystrokes.Dequeue();
    }

    public string Next(long now, long systemIdle) {
        if (systemIdle >= 90000) {
            away = true;
            return null;
        }
        if (away) {
            away = false;
            focusStart = lastInteraction = now;
            loneliness = 0;
            keystrokes.Clear();
            return "cheer";
        }
        Trim(now);
        if (keystrokes.Count >= 17 && now >= nextTyping) {
            nextTyping = now + 240000;
            keystrokes.Clear();
            return "concern";
        }
        if (now - focusStart >= 25 * 60000) {
            focusStart = now;
            return "break";
        }
        if (now - lastInteraction >= 6 * 60000 && loneliness < 2) {
            loneliness = 2;
            return "tears";
        }
        if (now - lastInteraction >= 3 * 60000 && loneliness < 1) {
            loneliness = 1;
            return "lonely";
        }
        return null;
    }
}

static class OfficeInput {
    internal const int InputMessage = 0x00FF;
    const uint RawInput = 0x10000003;
    static readonly int HeaderSize = 8 + IntPtr.Size * 2;

    [StructLayout(LayoutKind.Sequential)]
    struct RawDevice {
        public ushort Page, Usage;
        public uint Flags;
        public IntPtr Target;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct LastInput {
        public uint Size, Tick;
    }

    [DllImport("user32.dll", SetLastError=true)]
    static extern bool RegisterRawInputDevices(RawDevice[] devices, uint count, uint size);

    [DllImport("user32.dll")]
    static extern uint GetRawInputData(IntPtr input, uint command, IntPtr data, ref uint size, uint header);

    [DllImport("user32.dll")]
    static extern bool GetLastInputInfo(ref LastInput input);

    public static long IdleMilliseconds() {
        var input = new LastInput {Size=8};
        return GetLastInputInfo(ref input) ? unchecked((uint)Environment.TickCount - input.Tick) : 0;
    }

    public static bool Listen(IntPtr window, bool enabled) {
        var device = new RawDevice {Page=1, Usage=6, Flags=enabled?0x100u:0x01u, Target=enabled?window:IntPtr.Zero};
        return RegisterRawInputDevices(new[]{device}, 1, (uint)Marshal.SizeOf(typeof(RawDevice)));
    }

    public static bool ReadKey(IntPtr input, IntPtr buffer, bool readIdentity, out bool released, out int virtualKey) {
        released = false;
        virtualKey = 0;
        uint size = (uint)(HeaderSize + 16);
        uint actual = GetRawInputData(input, RawInput, buffer, ref size, (uint)HeaderSize);
        if (actual == uint.MaxValue || actual < HeaderSize + 16 || Marshal.ReadInt32(buffer) != 1) return false;
        released = (Marshal.ReadInt16(buffer, HeaderSize + 2) & 1) != 0;
        if (readIdentity && !released) virtualKey = Marshal.ReadInt16(buffer, HeaderSize + 6);
        return true;
    }

    static readonly System.Collections.Generic.Dictionary<int,string> KeyNames = new System.Collections.Generic.Dictionary<int,string> {
        {0x08,"BKSP"},{0x09,"TAB"},{0x0D,"ENTER"},{0x10,"SHIFT"},{0x11,"CTRL"},{0x12,"ALT"},
        {0x13,"PAUSE"},{0x14,"CAPS"},{0x1B,"ESC"},{0x20,"SPACE"},{0x21,"PG UP"},{0x22,"PG DN"},
        {0x23,"END"},{0x24,"HOME"},{0x25,"←"},{0x26,"↑"},{0x27,"→"},{0x28,"↓"},{0x2C,"PRTSC"},
        {0x2D,"INS"},{0x2E,"DEL"},{0x5B,"WIN"},{0x5C,"WIN"},{0x5D,"MENU"},{0x6A,"*"},
        {0x6B,"+"},{0x6C,","},{0x6D,"-"},{0x6E,"."},{0x6F,"/"},{0x90,"NUM"},{0x91,"SCROLL"},
        {0xA0,"SHIFT"},{0xA1,"SHIFT"},{0xA2,"CTRL"},{0xA3,"CTRL"},{0xA4,"ALT"},{0xA5,"ALT"},
        {0xBA,";"},{0xBB,"="},{0xBC,","},{0xBD,"-"},{0xBE,"."},{0xBF,"/"},{0xC0,"`"},
        {0xDB,"["},{0xDC,"\\"},{0xDD,"]"},{0xDE,"'"},{0xE2,"\\"}
    };

    public static string Legend(int key) {
        if ((key >= 0x30 && key <= 0x39) || (key >= 0x41 && key <= 0x5A)) return ((char)key).ToString();
        if (key >= 0x60 && key <= 0x69) return (key - 0x60).ToString();
        if (key >= 0x70 && key <= 0x87) return "F" + (key - 0x6F);
        string legend;
        return KeyNames.TryGetValue(key, out legend) ? legend : null;
    }
}
