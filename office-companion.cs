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

    public static bool IsRelease(IntPtr input, IntPtr buffer) {
        uint size = (uint)(HeaderSize + 16);
        uint actual = GetRawInputData(input, RawInput, buffer, ref size, (uint)HeaderSize);
        // Read the release flag only. Key identity and text are discarded.
        return actual >= size && actual != uint.MaxValue && Marshal.ReadInt32(buffer) == 1 &&
            (Marshal.ReadInt16(buffer, HeaderSize + 2) & 1) != 0;
    }
}
