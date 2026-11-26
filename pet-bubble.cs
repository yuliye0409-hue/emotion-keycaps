using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Shapes;

sealed class PetBubbleHover {
    public const int OpenDelay = 1000;
    public const int CloseDelay = 620;
    long? enteredPet, leftBubble;
    bool blocked;
    public bool Open { get; private set; }

    public void Update(long now, bool onPet, bool onBubble, bool pressed) {
        if (pressed) {
            Dismiss();
            return;
        }
        if (blocked) {
            if (!onPet && !onBubble) blocked = false;
            return;
        }
        if (Open) {
            if (onPet || onBubble) leftBubble = null;
            else {
                if (!leftBubble.HasValue) leftBubble = now;
                if (now - leftBubble.Value >= CloseDelay) Close();
            }
            return;
        }
        if (!onPet) {
            enteredPet = null;
            return;
        }
        if (!enteredPet.HasValue) enteredPet = now;
        if (now - enteredPet.Value >= OpenDelay) Open = true;
    }

    public void Dismiss() {
        Close();
        blocked = true;
    }

    internal static bool Check() {
        var hover = new PetBubbleHover();
        hover.Update(0, true, false, false);
        hover.Update(999, true, false, false);
        if (hover.Open) return false;
        hover.Update(1000, true, false, false);
        if (!hover.Open) return false;
        hover.Update(2100, false, false, false);
        hover.Update(2400, false, true, false);
        hover.Update(3100, false, true, false);
        if (!hover.Open) return false;
        hover.Update(3200, false, false, false);
        hover.Update(3819, false, false, false);
        if (!hover.Open) return false;
        hover.Update(3820, false, false, false);
        if (hover.Open) return false;
        hover.Update(4000, true, false, false);
        hover.Update(4800, false, false, false);
        hover.Update(6000, true, false, false);
        hover.Update(6999, true, false, false);
        if (hover.Open) return false;
        hover.Update(7000, true, false, false);
        if (!hover.Open) return false;
        hover.Update(7050, true, false, true);
        hover.Update(12000, true, false, false);
        return !hover.Open;
    }

    void Close() {
        Open = false;
        enteredPet = leftBubble = null;
    }
}

static class PetBubbleLayout {
    public const double Width = 76, Height = 34;
    public static readonly Point Center = new Point(335, 280);
    public static readonly Size Stage = new Size(670, 596);

    public static Rect[] Place(Rect available, int count) {
        var candidates = new List<Point>();
        foreach (var x in new[] {-132, -44, 44, 132}) candidates.Add(new Point(x, -117));
        foreach (var y in new[] {-70, -23, 24, 71}) {
            candidates.Add(new Point(-144, y));
            candidates.Add(new Point(144, y));
        }
        var extra = from x in new[] {-278, -188, -98, -8, 82, 172, 262}
                    from y in new[] {-246,-202,-158,-114,-70,-26,18,62,106,150,194,238,282}
                    where Math.Abs(x) >= 119 || y <= -90 || y >= 102
                    orderby x*x + y*y
                    select new Point(x,y);
        candidates.AddRange(extra);
        var placed = new List<Rect>();
        foreach (var point in candidates) {
            var bounds = new Rect(Center.X+point.X-Width/2, Center.Y+point.Y-Height/2, Width, Height);
            if (!available.Contains(bounds)) continue;
            var clearance = bounds;
            clearance.Inflate(5, 5);
            if (placed.Any(previous => previous.IntersectsWith(clearance))) continue;
            placed.Add(bounds);
            if (placed.Count == count) break;
        }
        return placed.ToArray();
    }

    public static bool Check() {
        var full = new Rect(Stage);
        var areas = new[] {full,
            new Rect(Center.X-33,Center.Y-44,full.Right-Center.X+33, full.Bottom-Center.Y+44),
            new Rect(0,Center.Y-44,Center.X+33,full.Bottom-Center.Y+44),
            new Rect(Center.X-33,0,full.Right-Center.X+33,Center.Y+48),
            new Rect(0,0,Center.X+33,Center.Y+48)};
        return areas.All(area => Place(area,14).Length == 14);
    }
}

static class PetBubbleStyle {
    static readonly Brush Ink = Paint("#322830");
    static readonly Brush Cream = Paint("#FFF4DC");
    static readonly Brush Chip = Paint("#FFFBF0");
    static readonly Brush Pink = Paint("#FBC5D2");
    static readonly Brush Green = Paint("#C7E7DB");
    static readonly Brush Lavender = Paint("#E7D9F8");
    static readonly FontFamily Rounded = new FontFamily("YouYuan, Microsoft YaHei UI, Segoe UI");

    public static TextBlock Text(string value, double size) {
        return new TextBlock {
            Text = value, Foreground = Ink, FontFamily = Rounded, FontWeight = FontWeights.Bold,
            FontSize = size, TextWrapping = TextWrapping.Wrap,
            TextAlignment = TextAlignment.Center, LineHeight = size + 5
        };
    }

    public static FrameworkElement Speech(UIElement content) {
        var stack = new StackPanel { IsHitTestVisible = false };
        var panel = new Border {
            Background = Cream, BorderBrush = Ink, BorderThickness = new Thickness(2),
            CornerRadius = new CornerRadius(15), Child = content,
            Padding = new Thickness(12, 7, 12, 8)
        };
        stack.Children.Add(panel);
        var tail = new Path {
            Data = Geometry.Parse("M0,0 L8,8 Q9,9 10,8 L18,0"),
            Stroke = Ink, StrokeThickness = 2, Fill = Cream,
            Width = 20, Height = 10, Margin = new Thickness(0, -2, 0, 0),
            HorizontalAlignment = HorizontalAlignment.Center
        };
        stack.Children.Add(tail);
        return stack;
    }

    public static Button Action(string title, int group, Action run) {
        var button = new Button {
            Content = Text(title, 13), Width = PetBubbleLayout.Width, Height = PetBubbleLayout.Height,
            Template = ChipTemplate(), Background = group == 1 ? Pink : group == 2 ? Green : group == 3 ? Lavender : Chip,
            Cursor = System.Windows.Input.Cursors.Hand
        };
        Label(button, title);
        button.Click += (s,e) => run();
        return button;
    }

    public static void Label(Button button, string value) {
        ((TextBlock)button.Content).Text = value;
        System.Windows.Automation.AutomationProperties.SetName(button, value);
    }

    static ControlTemplate ChipTemplate() {
        var border = new FrameworkElementFactory(typeof(Border));
        border.SetValue(Border.CornerRadiusProperty, new CornerRadius(17));
        border.SetValue(Border.BorderBrushProperty, Ink);
        border.SetValue(Border.BorderThicknessProperty, new Thickness(1.2));
        border.SetValue(Border.BackgroundProperty, new TemplateBindingExtension(Control.BackgroundProperty));
        var content = new FrameworkElementFactory(typeof(ContentPresenter));
        content.SetValue(FrameworkElement.HorizontalAlignmentProperty, HorizontalAlignment.Center);
        content.SetValue(FrameworkElement.VerticalAlignmentProperty, VerticalAlignment.Center);
        border.AppendChild(content);
        var template = new ControlTemplate(typeof(Button)) { VisualTree = border };
        var hover = new Trigger { Property = UIElement.IsMouseOverProperty, Value = true };
        hover.Setters.Add(new Setter(Control.BackgroundProperty, Paint("#FFD689")));
        var focus = new Trigger { Property = UIElement.IsKeyboardFocusedProperty, Value = true };
        focus.Setters.Add(new Setter(Control.BackgroundProperty, Paint("#FFD689")));
        template.Triggers.Add(hover);
        template.Triggers.Add(focus);
        return template;
    }

    public static Path Tail(Point center, Rect bounds, Button button) {
        var delta = center - new Point(bounds.X+bounds.Width/2, bounds.Y+bounds.Height/2);
        bool side = Math.Abs(delta.X) > Math.Abs(delta.Y);
        var normal = side ? new Vector(Math.Sign(delta.X),0) : new Vector(0,Math.Sign(delta.Y));
        var lateral = new Vector(-normal.Y,normal.X);
        var offset = side ? bounds.Width/2-1 : bounds.Height/2-1;
        var origin = new Point(bounds.X+bounds.Width/2,bounds.Y+bounds.Height/2)+normal*offset;
        var geometry = new StreamGeometry();
        using (var path=geometry.Open()) {
            path.BeginFigure(origin-lateral*5,true,false);
            path.LineTo(origin+normal*6,true,false);
            path.LineTo(origin+lateral*5,true,false);
        }
        var tail = new Path {
            Data=geometry, Stroke=Ink, StrokeThickness=1.2, IsHitTestVisible=false
        };
        tail.SetBinding(Shape.FillProperty,new Binding("Background"){Source=button});
        return tail;
    }

    static Brush Paint(string hex) {
        var brush = new SolidColorBrush((Color)ColorConverter.ConvertFromString(hex));
        brush.Freeze();
        return brush;
    }
}
