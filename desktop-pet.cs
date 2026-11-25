using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Threading;
using System.Xml.Linq;

static class DesktopPet {
    [STAThread] static int Main(string[] args) {
        if (args.Length != 1 && args.Length != 2) return 2;
        try {
            bool office;
            var clips = Read(args[0], out office);
            if (args.Length == 2 && args[1] == "--check") return clips.Count == 15 && CheckOffice() && PetBubbleHover.Check() && PetBubbleLayout.Check() && Svg.HasGaze(clips["idle"][0]) ? 0 : 3;
            var app = new Application();
            app.Run(new PetWindow(args[0], clips, office));
            return 0;
        } catch (Exception e) {
            if (args.Length == 2) Console.Error.WriteLine(e);
            else File.WriteAllText(args[0] + ".error", e.ToString());
            return 1;
        }
    }

    internal static Dictionary<string, DrawingGroup[]> Read(string path, out bool office) {
        var root = XDocument.Load(path).Root;
        office = (bool?)root.Attribute("office") ?? false;
        return root.Elements("clip").ToDictionary(
            e => (string)e.Attribute("id"), e => e.Elements().Select(Svg.Draw).ToArray());
    }

    static bool CheckOffice() {
        var office = new OfficeCompanion();
        office.Reset(0);
        if (office.Next(179999, 0) != null || office.Next(180000, 0) != "lonely" ||
            office.Next(180001, 0) != null || office.Next(360000, 0) != "tears" ||
            office.Next(360001, 0) != null) return false;
        office.Interact(361000);
        if (office.Next(361001, 0) != null) return false;
        for (int i = 0; i < 17; i++) office.KeyReleased(362000 + 115*i);
        if (office.Next(364000, 0) != "concern") return false;
        for (int i = 0; i < 17; i++) office.KeyReleased(365000 + 115*i);
        if (office.Next(367000, 0) != null) return false;
        if (office.Next(500000, 90000) != null || office.Next(501000, 0) != "cheer") return false;
        return office.Next(2001000, 0) == "break";
    }
}

sealed class PetWindow : Window {
    readonly DrawingSurface surface = new DrawingSurface();
    readonly Stopwatch clock = Stopwatch.StartNew();
    readonly DispatcherTimer timer = new DispatcherTimer();
    readonly string path;
    readonly OfficeCompanion companion = new OfficeCompanion();
    readonly FrameworkElement bubble;
    readonly TextBlock caption;
    readonly Popup actionBubble;
    readonly Canvas actionStage;
    readonly Button[] actionButtons;
    readonly PetBubbleHover hover = new PetBubbleHover();
    readonly Button officeButton, sleepButton;
    bool officeEnabled, officePreset, companionAction;
    long nextOfficeCheck, bubbleUntil;
    HwndSource inputSource;
    IntPtr inputBuffer;
    Dictionary<string, DrawingGroup[]> clips;
    DateTime loaded, nextCheck;
    string action = "idle";
    long started;
    Point pressed;
    bool dragged;
    int clicks;
    public PetWindow(string path, Dictionary<string, DrawingGroup[]> clips, bool office) {
        this.path = path; this.clips = clips; loaded = File.GetLastWriteTimeUtc(path);
        Title = "Emotion Keycaps";
        WindowStyle = WindowStyle.None; ResizeMode = ResizeMode.NoResize; AllowsTransparency = true;
        Background = Brushes.Transparent; ShowInTaskbar = false; ShowActivated = false; Topmost = true;
        Width = 248; Height = 261;
        var screen = SystemParameters.WorkArea;
        Left = screen.Right - Width - 22; Top = screen.Bottom - Height - 20;
        var stack = new Grid();
        surface.Width = 210; surface.Height = 174.3;
        surface.VerticalAlignment = VerticalAlignment.Bottom;
        surface.HorizontalAlignment = HorizontalAlignment.Center;
        stack.Children.Add(surface);
        caption = PetBubbleStyle.Text("", 16);
        bubble = PetBubbleStyle.Speech(caption);
        bubble.MaxWidth = 236;
        bubble.Margin = new Thickness(0, 3, 0, 0);
        bubble.HorizontalAlignment = HorizontalAlignment.Center;
        bubble.VerticalAlignment = VerticalAlignment.Top;
        bubble.Visibility = Visibility.Collapsed;
        stack.Children.Add(bubble);
        Content = stack;
        surface.Cursor = Cursors.Hand; surface.Focusable = true;
        surface.MouseLeftButtonDown += (s,e) => {
            surface.Focus(); pressed = e.GetPosition(surface); clicks = e.ClickCount;
            dragged = false; surface.CaptureMouse();
        };
        surface.MouseMove += (s,e) => {
            if (!surface.IsMouseCaptured || e.LeftButton != MouseButtonState.Pressed) return;
            var delta = e.GetPosition(surface) - pressed;
            if (!dragged && delta.Length < 5) return;
            dragged = true;
            Left += delta.X; Top += delta.Y;
        };
        surface.MouseLeftButtonUp += (s,e) => {
            if (!surface.IsMouseCaptured) return;
            surface.ReleaseMouseCapture();
            if (!dragged) Start(clicks > 1 ? "bonk" : "poke");
        };
        sleepButton = ActionChip("睡觉", "sleep", 0);
        officeButton = PetBubbleStyle.Action("", 3, () => SetOffice(!officeEnabled));
        actionButtons = new[] {
            ActionChip("喝水", "water", 0), sleepButton, ActionChip("运动", "move", 0), ActionChip("打招呼", "wave", 1),
            ActionChip("抱一下", "hug", 1), ActionChip("轻敲", "bonk", 1),
            ActionChip("听我吐槽", "concern", 2), ActionChip("一起缓缓", "calm", 2),
            ActionChip("庆祝一下", "cheer", 2), ActionChip("伸个懒腰", "break", 2),
            officeButton, PetBubbleStyle.Action("收起桌宠", 3, Close)
        };
        actionStage = new Canvas();
        actionBubble = new Popup {
            PlacementTarget = surface,
            Placement = PlacementMode.Relative,
            AllowsTransparency = true, PopupAnimation = PopupAnimation.Fade,
            StaysOpen = true, Child = actionStage
        };
        PreviewKeyDown += (s,e) => {
            if (e.Key == Key.Escape && actionBubble.IsOpen) {
                HideActions();
                e.Handled = true;
                return;
            }
            switch (e.Key) {
                case Key.W: Start("water"); break; case Key.S: Start("sleep"); break;
                case Key.Space: Start("move"); break; case Key.B: Start("bonk"); break;
                case Key.H: Start("wave"); break; case Key.Escape: Close(); break; default: return;
            }
            e.Handled = true;
        };
        surface.Update(clips["idle"][0]);
        officePreset = office;
        SourceInitialized += (s,e) => {
            inputSource = (HwndSource)PresentationSource.FromVisual(this);
            inputBuffer = Marshal.AllocHGlobal(40);
            inputSource.AddHook(HandleInput);
            SetOffice(office);
        };
        timer.Interval = TimeSpan.FromMilliseconds(33);
        timer.Tick += (s,e) => Tick(); timer.Start();
        ContentRendered += (s,e) => File.WriteAllText(path + ".ready", new WindowInteropHelper(this).Handle.ToInt64().ToString(CultureInfo.InvariantCulture));
        Closed += (s,e) => {
            timer.Stop();
            actionBubble.IsOpen = false;
            if (officeEnabled) OfficeInput.Listen(IntPtr.Zero, false);
            if (inputBuffer != IntPtr.Zero) Marshal.FreeHGlobal(inputBuffer);
            inputBuffer=IntPtr.Zero;
        };
    }
    Button ActionChip(string label, string id, int group) {
        return PetBubbleStyle.Action(label, group, () => {
            HideActions();
            Start(id);
        });
    }

    void HideActions() {
        hover.Dismiss();
        actionBubble.IsOpen = false;
    }

    void TickHover(long now) {
        var activeBubble = actionBubble.IsOpen ? actionButtons.FirstOrDefault(b => b.IsMouseOver) : null;
        hover.Update(now, surface.IsMouseOver, activeBubble != null, surface.IsMouseCaptured);
        if (hover.Open && !actionBubble.IsOpen) OpenActions();
        else if (!hover.Open && actionBubble.IsOpen) actionBubble.IsOpen = false;
        Vector? gaze = null;
        if (actionBubble.IsOpen) {
            var face = new Point(105, 78);
            var watched = activeBubble ?? actionButtons[0];
            if (PresentationSource.FromVisual(watched) != null) {
                var target = watched.PointToScreen(new Point(watched.Width/2, watched.Height/2));
                gaze = target - surface.PointToScreen(face);
            }
        }
        surface.Aim(gaze);
    }

    void OpenActions() {
        var face = new Point(105, 78);
        var screenFace = surface.PointToScreen(face);
        var work = System.Windows.Forms.Screen.FromPoint(new System.Drawing.Point((int)screenFace.X,(int)screenFace.Y)).WorkingArea;
        var toDip = inputSource.CompositionTarget.TransformFromDevice;
        var topLeft = toDip.Transform(new Vector(work.Left-screenFace.X,work.Top-screenFace.Y));
        var bottomRight = toDip.Transform(new Vector(work.Right-screenFace.X,work.Bottom-screenFace.Y));
        var center = PetBubbleLayout.Center;
        var monitorArea = new Rect(center+topLeft,center+bottomRight);
        var stage = new Rect(PetBubbleLayout.Stage);
        stage.Intersect(monitorArea);
        if (stage.IsEmpty || stage.Width <= 16 || stage.Height <= 16) { hover.Dismiss(); return; }
        var safeArea = stage;
        safeArea.Inflate(-8,-8);
        var positions = PetBubbleLayout.Place(safeArea);
        if (positions.Length == 0) { hover.Dismiss(); return; }
        actionStage.Children.Clear();
        var envelope = positions.Aggregate(Rect.Empty, Rect.Union);
        envelope.Inflate(7,7);
        actionStage.Width = envelope.Width;
        actionStage.Height = envelope.Height;
        actionBubble.HorizontalOffset = face.X-center.X+envelope.X;
        actionBubble.VerticalOffset = face.Y-center.Y+envelope.Y;
        for (int i=0; i<positions.Length; i++) {
            var bounds = positions[i];
            bounds.Offset(-envelope.X,-envelope.Y);
            var button = actionButtons[i];
            Canvas.SetLeft(button,bounds.X);
            Canvas.SetTop(button,bounds.Y);
            actionStage.Children.Add(PetBubbleStyle.Tail(new Point(center.X-envelope.X, center.Y-envelope.Y),bounds,button));
            actionStage.Children.Add(button);
        }
        PetBubbleStyle.Label(sleepButton, action == "sleep" ? "叫醒" : "睡觉");
        actionBubble.IsOpen = true;
        actionStage.UpdateLayout();
    }
    IntPtr HandleInput(IntPtr window, int msg, IntPtr wParam, IntPtr lParam, ref bool handled) {
        if (msg == OfficeInput.InputMessage && officeEnabled && inputBuffer != IntPtr.Zero &&
            OfficeInput.IsRelease(lParam, inputBuffer)) companion.KeyReleased(clock.ElapsedMilliseconds);
        return IntPtr.Zero;
    }
    void SetOffice(bool wanted) {
        PetBubbleStyle.Label(officeButton, officeEnabled ? "陪伴·开" : "陪伴·关");
        if (wanted == officeEnabled) return;
        if (inputSource == null || !OfficeInput.Listen(inputSource.Handle, wanted)) {
            HideActions();
            Say("没能切换办公陪伴提醒。");
            return;
        }
        officeEnabled = wanted;
        PetBubbleStyle.Label(officeButton, wanted ? "陪伴·开" : "陪伴·关");
        companion.Reset(clock.ElapsedMilliseconds);
        if (!wanted && companionAction) Begin("idle");
    }
    void Say(string line) {
        caption.Text = line;
        bubble.Visibility = String.IsNullOrEmpty(line) || actionBubble.IsOpen ? Visibility.Collapsed : Visibility.Visible;
        bubbleUntil = clock.ElapsedMilliseconds + 5500;
    }
    static readonly Dictionary<string,string> Lines = new Dictionary<string,string> {
        {"lonely","忙完了，能分我一小会儿吗？"},
        {"tears","攒了一滴眼泪。给我一个抱抱吧。"},
        {"concern","键盘敲得好快！\n是灵感来了，还是有点烦？\n我给你举个暂停牌。"},
        {"calm","跟我一起。\n慢慢吸气，再慢慢呼气。"},
        {"hug","抱一下。你忙你的，我在这里。"},
        {"cheer","给你挥个手。又见面啦！"},
        {"break","我们伸个懒腰？我先来。"}
    };
    void Start(string id) {
        companion.Interact(clock.ElapsedMilliseconds);
        Begin(action == "sleep" && (id == "sleep" || id == "poke" || id == "bonk") ? "wake" : id);
        if (id == "concern") Say("我在听。\n想停一下，我给你举牌。");
        if (id == "cheer") Say("这一小步也值得庆祝！");
    }
    void Begin(string id, bool automatic=false) {
        action=id;
        companionAction=automatic;
        started = clock.ElapsedMilliseconds;
        string line;
        if (Lines.TryGetValue(id,out line)) Say(line);
        else Say(null);
    }
    void Tick() {
        var now = DateTime.UtcNow;
        if (now > nextCheck) {
            nextCheck = now.AddMilliseconds(600);
            var stamp = File.GetLastWriteTimeUtc(path);
            if (stamp != loaded && File.Exists(path)) {
                try {
                    bool office;
                    clips = DesktopPet.Read(path, out office);
                    loaded = stamp;
                    if (office != officePreset) { officePreset=office; SetOffice(office); }
                    Start("idle");
                }
                catch (IOException) { } // The preview may still be replacing the file.
            }
        }
        long elapsed=clock.ElapsedMilliseconds;
        TickHover(elapsed);
        bubble.Visibility = elapsed < bubbleUntil && !actionBubble.IsOpen && !String.IsNullOrEmpty(caption.Text)
            ? Visibility.Visible : Visibility.Collapsed;
        if (officeEnabled && elapsed >= nextOfficeCheck) {
            nextOfficeCheck = elapsed + 250;
            if (action == "idle" || action == "lonely" || action == "tears") {
                var signal = companion.Next(elapsed, OfficeInput.IdleMilliseconds());
                if (signal != null) Begin(signal,true);
            }
        }
        var frames = clips[action];
        int frame = (int)((clock.ElapsedMilliseconds - started) * 30 / 1000);
        if (action == "idle") frame %= frames.Length;
        else if (action == "lonely" || action == "tears") frame %= frames.Length;
        else if (action == "sleep" && frame >= frames.Length - 36)
            frame = frames.Length - 36 + (frame - frames.Length + 36) % 36;
        else if (frame >= frames.Length) { action="idle"; started=elapsed; frames=clips["idle"]; frame=0; }
        surface.Update(frames[frame]);
    }
}

sealed class DrawingSurface : FrameworkElement {
    DrawingGroup frame;
    readonly ScaleTransform scale = new ScaleTransform(.7, .7);
    Vector gaze;
    bool looking;

    public void Aim(Vector? target) {
        var wanted = target.GetValueOrDefault();
        if (wanted.Length > 1) wanted.Normalize();
        wanted.X *= 7;
        wanted.Y *= 5;
        var next = gaze + (wanted-gaze)*.33;
        if ((next-gaze).Length < .08 && looking == target.HasValue) return;
        gaze = next;
        looking = target.HasValue;
        InvalidateVisual();
    }
    public void Update(DrawingGroup next) {
        if (Object.ReferenceEquals(frame, next)) return;
        frame=next; InvalidateVisual();
    }
    protected override void OnRender(DrawingContext dc) {
        if (frame == null) return;
        dc.PushTransform(scale);
        if (looking) Svg.DrawGaze(dc,frame,gaze);
        else dc.DrawDrawing(frame);
        dc.Pop();
    }
    protected override HitTestResult HitTestCore(PointHitTestParameters h) {
        var p = h.HitPoint;
        var tex = new Point(p.X/.7,p.Y/.7);
        return frame != null && Hits(frame, tex) ? new PointHitTestResult(this, p) : null;
    }
    static bool Hits(Drawing drawing, Point point) {
        var group = drawing as DrawingGroup;
        if (group != null) {
            if (group.Opacity < .20) return false;
            var t = group.Transform;
            if (t != null && t.Inverse != null) point = t.Inverse.Transform(point);
            return group.Children.Any(c => Hits(c, point));
        }
        var g = drawing as GeometryDrawing;
        return g != null && ((g.Brush != null && g.Geometry.FillContains(point)) ||
                              (g.Pen != null && g.Geometry.StrokeContains(g.Pen, point)));
    }
}

static class Svg {
    static readonly DependencyProperty GazeMarker = DependencyProperty.RegisterAttached(
        "GazeMarker",typeof(int),typeof(Svg),new PropertyMetadata(0));
    static readonly Brush EyeColor = BrushFrom("#fff9ea");
    static readonly Brush PupilColor = BrushFrom("#28252e");
    static readonly double[] EyePositions = {130, 170};
    static readonly CultureInfo Culture = CultureInfo.InvariantCulture;
    static XAttribute Attr(XElement e,string key) { return e.Attribute(key); }
    static double Number(XElement e,string key,double fallback=0) {
        var a=Attr(e,key); return a==null?fallback:Double.Parse(a.Value,Culture);
    }
    static Brush BrushFrom(string value) {
        if (value==null || value=="none") return null;
        var b=new SolidColorBrush((Color)ColorConverter.ConvertFromString(value)); b.Freeze(); return b;
    }
    internal static DrawingGroup Draw(XElement e) {
        var group=DrawNode(e,"#000000",null);
        group.Freeze(); return group;
    }
    internal static bool HasGaze(DrawingGroup frame) { return (int)frame.GetValue(GazeMarker) != 0; }

    internal static void DrawGaze(DrawingContext dc, Drawing drawing, Vector gaze) {
        var group = drawing as DrawingGroup;
        if (group == null || !HasGaze(group)) { dc.DrawDrawing(drawing); return; }
        if ((int)group.GetValue(GazeMarker) == 2) {
            foreach (var x in EyePositions) {
                var eye = new Point(x + gaze.X*.50,111 + gaze.Y*.60);
                dc.DrawEllipse(EyeColor,null,eye,8,10);
                dc.DrawEllipse(PupilColor,null,eye+gaze*.65,3.2,4.2);
            }
            return;
        }
        dc.PushTransform(group.Transform ?? Transform.Identity);
        dc.PushOpacity(group.Opacity);
        foreach (var item in group.Children) DrawGaze(dc,item,gaze);
        dc.Pop();
        dc.Pop();
    }
    static DrawingGroup DrawNode(XElement e,string fill,string stroke) {
        var g=new DrawingGroup{Opacity=Number(e,"opacity",1)};
        var transform=(string)Attr(e,"transform");
        if (transform!=null) {
            var chain=new TransformGroup();
            // SVG transform lists apply right to left; WPF applies children in order.
            foreach (Match m in Regex.Matches(transform,@"([a-z]+)\(([^)]+)\)").Cast<Match>().Reverse()) {
                double[] a=Regex.Split(m.Groups[2].Value.Trim(),@"[ ,]+").Select(v=>Double.Parse(v,Culture)).ToArray();
                switch(m.Groups[1].Value) {
                    case "translate":chain.Children.Add(new TranslateTransform(a[0],a.Length>1?a[1]:0));break;
                    case "scale":chain.Children.Add(new ScaleTransform(a[0],a.Length>1?a[1]:a[0]));break;
                    case "rotate":chain.Children.Add(a.Length==3?new RotateTransform(a[0],a[1],a[2]):new RotateTransform(a[0]));break;
                }
            }
            g.Transform=chain;
        }
        fill=(string)Attr(e,"fill")??fill; stroke=(string)Attr(e,"stroke")??stroke;
        Geometry shape=null;
        switch(e.Name.LocalName) {
            case "path":shape=Geometry.Parse("F1 "+(string)Attr(e,"d"));break;
            case "circle":shape=new EllipseGeometry(new Point(Number(e,"cx"),Number(e,"cy")),Number(e,"r"),Number(e,"r"));break;
            case "ellipse":shape=new EllipseGeometry(new Point(Number(e,"cx"),Number(e,"cy")),Number(e,"rx"),Number(e,"ry"));break;
            case "rect":shape=new RectangleGeometry(new Rect(Number(e,"x"),Number(e,"y"),Number(e,"width"),Number(e,"height")),Number(e,"rx"),Number(e,"rx"));break;
            case "text":
                var words=new FormattedText(e.Value,Culture,FlowDirection.LeftToRight,new Typeface(new FontFamily("Consolas"),FontStyles.Normal,FontWeights.Bold,FontStretches.Normal),Number(e,"font-size",13),Brushes.Black,1.0);
                shape=words.BuildGeometry(new Point(Number(e,"x")-words.Width/2,Number(e,"y")-words.Baseline));break;
        }
        if (shape==null) {
            foreach(var child in e.Elements()) g.Children.Add(DrawNode(child,fill,stroke));
            if ((string)Attr(e,"class")=="gaze-eyes") g.SetValue(GazeMarker,2);
            else if (g.Children.OfType<DrawingGroup>().Any(HasGaze)) g.SetValue(GazeMarker,1);
        } else {
            var ink=BrushFrom(stroke);
            var pen=ink==null?null:new Pen(ink,Number(e,"stroke-width",1));
            if (pen!=null && (string)Attr(e,"stroke-linecap")=="round") pen.StartLineCap=pen.EndLineCap=PenLineCap.Round;
            g.Children.Add(new GeometryDrawing(BrushFrom(fill),pen,shape));
        }
        return g;
    }
}
