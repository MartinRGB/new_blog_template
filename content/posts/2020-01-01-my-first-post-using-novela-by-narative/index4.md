---
title: My first post using Novela by Narative4
author: Dennis Brotzky
tag: d4
date: 2019-04-30
---
14.\[译\]iOS UIScrollView 动画的力学原理
================================

**

原文来自 [How UIScrollView works](https://medium.com/@esskeetit/how-uiscrollview-works-e418adc47060#8fc0)

**

Yandex.Metro 在 iOS 跟 Android 端共同使用了用 C++ 编写的 MetroKit 库。其中有一个 `SchemeView` 用来显示地铁地图。我们在实现这个程序的时候发现我们需要重新实现滚动功能。因此我们采用了 `UIScrollView` 作为参考，因为我们觉得它的动画表现非常自然和谐。

我们将开发流程分成三块，用来实现 `UIScrollView` 的三种力学运动行为。第一部分就是衰减。

![](static/img/1.67cb1a2.gif) 衰减

第二种就是弹性动画，实现了边缘反弹。

![](static/img/2.91d1767.gif) 弹性动画

第三种就是橡皮筋效果，实现了边缘外拖动的滚动阻尼。

![](static/img/3.6454c4a.gif) 橡皮筋效果

我将阐述这些动画的力学细节，包括实现他们所用到的数学公式。

测试案例
----

我们先来看一下用来做测试的 `SimpleScrollView`，我们将通过这个案例分析 iOS 滚动视图的力学原理、公式，以及改进之处。

跟 `UIScrollView` 类似，这个自定义类包含 `contentView`, `contentSize` 和 `contentOffset`:

`class SimpleScrollView: UIView {`

    var contentView: UIView?

    var contentSize: CGSize

    var contentOffset: CGPoint

}

为了手势效果,我们需要处理 `UIPanGestureRecognizer` 和 `handlePanRecognizer` 函数。

`let panRecognizer = UIPanGestureRecognizer()`

override init(frame: CGRect) {

    super.init(frame: frame)

    addGestureRecognizer(panRecognizer)

    panRecognizer.addTarget(self, action: #selector(handlePanRecognizer))

}

`SimpleScrollView` 有两种状态：

*   `.default` 无事发生时
    
*   `.dragging` 滚动时
    

`enum State {`

    case \`default\`

    case dragging(initialOffset: CGPoint)

}

var state: State = .default

`handlePanRecognizer` 的实现如下：

`@objc func handlePanRecognizer(_ sender: UIPanGestureRecognizer) {`

    switch sender.state {

    case .began:

        state = .dragging(initialOffset: contentOffset)

    case .changed:

        let translation = sender.translation(in: self)

        if case .dragging(let initialOffset) = state {

            contentOffset = clampOffset(initialOffset - translation)

        }

    case .ended:

        state = .default

    // Other cases

    }

}

*   当 `UIPanGestureRecognizer` 进入 `.began` 状态，我们对 `.dragging` 状态进行设置
    
*   当进入 `.change` 状态，我们计算变化量，并根据滚动视图改变 `contentOffset`。于此同时，我们调用 `clampOffset` 函数避免越界。
    
*   当进入 `.ended` 状态，我们将 `SimpleScrollView` 恢复为 `.default` 状态
    

我们设置附加属性 `contentOffsetBounds` ，结合当前的 `contentSize` 进而定义 `contentOffset` 的边界。同样起到限制的还有 `clampOffset` 函数，它也利用边界限制了 `contentOffset` 。

`var contentOffsetBounds: CGRect {`

    let width = contentSize.width - bounds.width

    let height = contentSize.height - bounds.height

    return CGRect(x: 0, y: 0, width: width, height: height)

}

func clampOffset(\_ offset: CGPoint) -> CGPoint {

    return offset.clamped(to: contentOffsetBounds)

}

现在我们完成了 `SimpleScrollView` 的简单实现。

![](static/img/4.bc5f9d4.gif) SimpleScrollView

滚动起了作用，然而没有动画，运动缺乏惯性。随着本文的展开，我们将一点一点添加效果来改进 `SimpleScrollView`

衰减
--

我们先从衰减开始。

SDK 中没有提到衰减动画的实现方法。 `UIScrollView` 有一个 `DecelerationRate` 的属性，可以设置为 `.normal` 或者 `.fast` ,你可以用这个属性来调整滚动衰减的速率。 [文档](https://developer.apple.com/documentation/uikit/uiscrollview/1619438-decelerationrate) 中提到 `DecelerationRate` 决定了滚动的衰减率

`// A floating-point value that determines the rate of deceleration after the user lifts their finger`

var decelerationRate: UIScrollView.DecelerationRate

extension UIScrollView.DecelerationRate {

    static let normal: UIScrollView.DecelerationRate // 0.998

    static let fast: UIScrollView.DecelerationRate // 0.99

}

UIScrollView | [https://developer.apple.com/documentation/uikit/uiscrollview](https://developer.apple.com/documentation/uikit/uiscrollview)

而滚动衰减终点的计算公式 —— 当你手指抬起，滚动动画执行完最终停止的 衰减动画总变化量，在 WWDC 的 [Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/) 中有所提及。

`// Distance travelled after decelerating to zero velocity at a constant rate.`

func project(initialVelocity: Float, decelerationRate: Float) -> Float {

    return (initialVelocity / 1000.0) \* decelerationRate / (1.0 - decelerationRate)

}

这个公式只能用来计算变化量，无法用来实现衰减动画，但我们可以用起来作为我们未来公式计算的参考。在上面这段代码中，函数的参数为手势的初始速度和衰减率，通过计算返回了手指抬起滚动停止的滚动变化量。

### 速度

我们来猜猜 `DecelerationRate` 的运作机制和含义，[文档](https://developer.apple.com/documentation/uikit/uiscrollview/1619438-decelerationrate)中是这样描述它的：

> 当用户抬起手指时，决定衰减率的浮点值。

我们假设，这个比率决定了速度每毫秒的变化量（所有 `UIScrollView`和速度相关的值都用毫秒表示，`UIPanGestureRecognizer`则不是如此。

如果手指抬起的瞬间，我们有初速度 v₀，我们选择的衰减率是 `DecelerationRate.fast`，那么：

*   1 毫秒后速度为 v₀ 的 0.99 倍
*   2 毫秒后速度为 v₀ 的 0.992 倍
*   k 秒后速度为 v₀ 的 0. 991000k 倍

![](static/img/5.f82f1c7.png)

衰减运动的速度公式为：

![](static/img/6.849ee13.png)

### 运动方程

速度公式可没有办法实现衰减动画。我们需要找到运动方程：拿到时间决定变化量的方程 x(t)。而速度公式可以帮助我们得到运动方程，我们只需要积分即可：

![](static/img/7.ed52488.png)

我们替换速度公式 v(x)，积分得到：

![](static/img/8.00c96d1.png)

### 终点变化方程

现在我们可以得出滚动终点总变化量方程，然后跟苹果的公式进行比较。首先我们将 t 设置为无穷大，因为 d 小于 1，因此 d1000t趋于 0 ，我们得到：

![](static/img/9.259950f.png)

现在我们将苹果的公式写成同种形式，进行比较：

![](static/img/10.3a8d133.png)

两个公式的差异之处：

![](static/img/11.3d0b8af.png) 我们的公式 和 苹果的公式

然而，如果我们了解 自然对数分解成 以 1 为邻域的泰勒级数的知识，我们可以发现苹果的公式和我们的公式是近似的。

![](static/img/12.f823752.png) 自然对数 | [https://en.wikipedia.org/wiki/Natural\_logarithm#Series](https://en.wikipedia.org/wiki/Natural_logarithm#Series)

如果我们对函数在图形上进行打点绘制，我们可以发现在衰减率接近 1 的时候，图形非常拟合。

![](static/img/13.4648508.png)

我们再会想到 苹果的衰减率 提供的两个参数都非常接近 1，这意味着苹果的做法是比较正确的。

### 衰减时间

现在我们只需要获取衰减动画时间就能够构建动画。为了寻找衰减整个过程的变化量，我们之前将时间设置为无穷。但是动画时间不可能是无穷的。

如果我们将运动公式函数通过打点绘制出来，我们发现这个函数是无限趋近于终点 X 的。这个动画从起点开始，很快就运动到终点附近，然后无限趋近于终点，这个趋近过程几乎是不可察觉的。

![](static/img/14.5d62c9b.png)

利用微积分思想，我们可以重塑我们的问题: 我们只需要找到某个时刻 t ，整体运行的变化量足够趋近于 最终变化量 X 即可（设误差量为 ε）。按惯例来说，UI 上半像素的误差就不易察觉。

当 T 时刻的变化量和 最终变化量的相差绝对值为 ε 时，我们求 T:

![](static/img/15.142b75b.png)

我们替换 x 跟 X ，得到时间衰减动画的方程：

![](static/img/16.de851fd.png)

现在我们掌握了实现衰减动画的知识，我们将在实现中使用这些公式，改进 `SimpleScrollView`

衰减实现
----

我们首先创造一个 `DecelerationTimingParameters` 结构体，这个结构体包含了衰减动画所需要的信息：

`struct DecelerationTimingParameters {`

    var initialValue: CGPoint

    var initialVelocity: CGPoint

    var decelerationRate: CGFloat

    var threshold: CGFloat

}

*   `initialValue` 指的是初始的 `contentOffset` — 抬起手指的位置点。
    
*   `initialVelocity` 抬起手指的初始速度
    
*   `decelerationRate` 衰减率
    
*   `threshold` 确定衰减时间的阈值
    

根据公式，我们来解出衰减滚动停止的点：

`var destination: CGPoint {`

    let dCoeff = 1000 \* log(decelerationRate)

    return initialValue - initialVelocity / dCoeff

}

求衰减动画时间

`var duration: TimeInterval {`

    guard initialVelocity.length > 0 else { return 0 }

    let dCoeff = 1000 \* log(decelerationRate)

    return TimeInterval(log(-dCoeff \* threshold / initialVelocity.length) / dCoeff)

}

运动方程：

`func value(at time: TimeInterval) -> CGPoint {`

    let dCoeff = 1000 \* log(decelerationRate)

    return initialValue + (pow(decelerationRate, CGFloat(1000 \* time)) - 1) / dCoeff \* initialVelocity

}

我们构建一个 `TimerAnimation` 类，会根据屏幕刷新率每秒执行 60 次回调来做动画（ipad Pro 120 次）:

`class TimerAnimation {`

    typealias Animations = (\_ progress: Double, \_ time: TimeInterval) -> Void

    typealias Completion = (\_ finished: Bool) -> Void

    init(duration: TimeInterval, animations: @escaping Animations,

         completion: Completion? = nil)

}

我们使用 `animation` block 来让运动方程根据时间改变 `contentOffset` 。 `TimerAnimation` 的实现参考 [此仓库](https://github.com/super-ultra/ScrollMechanics/blob/master/ScrollMechanics/Sources/Utils/TimerAnimation.swift)

现在我们来改进手势处理函数：

`@objc func handlePanRecognizer(_ sender: UIPanGestureRecognizer) {`

    switch sender.state {

    case .began:

        state = .dragging(initialOffset: contentOffset)

    case .changed:

        let translation = sender.translation(in: self)

        if case .dragging(let initialOffset) = state {

            contentOffset = clampOffset(initialOffset - translation)

        }

    case .ended:

        state = .default

    // Other cases

    }

}

手指抬起时才执行衰减动画，因此，当切换为T `.ended` 状态，我们将调用 `startDeceleration` 函数，将手势的速度传递进去。

`@objc func handlePanRecognizer(_ sender: UIPanGestureRecognizer) {`

    switch sender.state {

    case .began:

        state = .dragging(initialOffset: contentOffset)

    case .changed:

        let translation = sender.translation(in: self)

        if case .dragging(let initialOffset) = state {

            contentOffset = clampOffset(initialOffset - translation)

        }

    case .ended:

        state = .default

        let velocity = sender.velocity(in: self)

        startDeceleration(withVelocity: -velocity)

    // Other cases

    }

}

`startDeceleration` 的实现：

`var contentOffsetAnimation: TimerAnimation?`

func startDeceleration(withVelocity velocity: CGPoint) {

    let decelerationRate = UIScrollView.DecelerationRate.normal.rawValue

    let threshold = 0.5 / UIScreen.main.scale

    let parameters = DecelerationTimingParameters(initialValue: contentOffset, 

                                                  initialVelocity: velocity,

                                                  decelerationRate: decelerationRate, 

                                                  threshold: threshold)

    contentOffsetAnimation = TimerAnimation(

        duration: parameters.duration,

        animations: { \[weak self\] \_, time in

            guard let self = self else { return }

            self.contentOffset = self.clampOffset(parameters.value(at: time))

        })

}

衰减率设置为 `DecelerationRate.normal` 阈值设置为 0.5

初始化 `DecelerationTimingParameters`

执行动画，通过 `animations` block 给运动公式传入动画时间，从而更新视图的`contentOffset`

结果如下：

![](static/img/17.67cb1a2.gif) 衰减

弹性动画
----

我们用弹性动画来实现边缘的回弹效果。

弹性动画是基于阻尼 [弹性振荡](https://en.wikipedia.org/wiki/Damping_ratio) 的原理实现的。所有的弹性动画原理都是想通的，无论是 iOS SDK，Android SDK 还是本文要实现的弹性效果。

弹性动画通常有以下参数p>

*   质量 Mass (m)
    
*   刚度 Stiffness (k)
    
*   阻尼 Damping (d)
    

弹性公式的运动公式如下，也是由上面参数构成：

![](static/img/18.5b4f783.png)

某些情况下，使用阻尼比 dampingRatio (ζ)，而不是阻尼 damping。他们的关系为下面的公式：

![](static/img/19.702101e.png)

### 阻尼比

弹性动画中最有意思的参数就是阻尼比，它决定了动画的感受：

![](static/img/20.11a81b7.gif) 阻尼比:0.1 0.5 1.0

阻尼比越接近于 0 ，产生的往复振荡次数越多。越接近于 1 ，往复振荡次数越少。当等于 1 的时候，没有往复运动,仅仅是振幅的衰减变化。

![](static/img/21.6571141.png)

根据阻尼比，阻尼运动分为三种运动类型：

*   **0 < ζ < 1** — 欠阻尼，物体会在停止点附近来回周期振荡，阻尼比越接近于 0，振荡次数越多。
    
*   **ζ = 1** — 临界阻尼，物体不在终点来回周期振荡， 不做周期运动，先短暂增大振幅，然后振荡以指数衰减的形式停止。
    
*   **ζ > 1** — 过阻尼，以指数衰减的形式运动到停止点，这种运动很罕见，所以不考虑。
    

### 运动方程

运动方程为:

![](static/img/22.5b4f783.png)

如果想用来描述物体运动，我们需要知道 x(t) 的方程的解来定义运动。我们还需要知道振荡时间，以便动画使用。因为阻尼比不同，方程的解也不同，因此我们需要分开考虑：

#### 欠阻尼

阻尼比小于 1 (欠阻尼），运动方程的解为：

![](static/img/23.891d769.png)

*   ω’ — [阻尼自然频率](https://en.wikipedia.org/wiki/Damping_ratio)
    
*   β — 附加参数
    

![](data:image/png;base64,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)

*   C₁ 和 C₂ 系数用来做初始化条件的参数输入：初始位置为 x₀，初始速度为 is v₀:
    

![](static/img/25.ac097ac.png)

正弦函数跟余弦函数描述了振荡运动的周期，而指数描述了振荡运动的衰减。

曲线上可以看到运动方程看起来形如正弦函数跟余弦函数所提供的振幅随时间指数衰减。

![](static/img/26.6919204.gif)

#### 临界阻尼

现在我们来看一下临界阻尼，运动方程为：

![](static/img/27.6769d93.png)

*   β — 想同的附加参数;
    
*   C₁ 和 C₂ 系数跟欠阻尼不同，但是他们也是给初始化参数用来提供输入的：
    

![](static/img/28.79a5ede.png)

函数曲线图表如下：

![](static/img/29.b338b99.gif)

终点没有周期往复振荡，仅仅是振幅的指数衰减。

### 震荡时间

现在我们需要知道振荡时间，跟衰减一样，我们不能给动画使用无限的时间，通过下图我们知道，从某一点开始，振荡幅度和周期不断变小，几乎视觉上不可见：

![](static/img/30.7500cdb.png)

因此我们还是要设置一个阈值 ε 来确定振荡是否已经足够小了 (例如半个像素)。

欠阻尼系统的时间的解为 (0 < ζ < 1):

![](static/img/31.44be3b8.png)

临界阻尼系统的时间的解为 (ζ = 1):

![](static/img/32.5db87ed.png)

综上，我们找到了弹性动画实现的数学公式。

看到这里你会产生疑问：既然 iOS SDK 已经提供了弹性动画的实现，为什么我还要知道弹性动画的原理呢？

因为在我的案例中，没法使用 iOS 的 SDK，因为要跨平台，因此我们要了解弹性动画的原理。但是为什么自定义 `SimpleScrollView` 需要知道这些呢？为什么 iOS 开发这需要知道这些呢？我们下面来分析以下 iOS SDK 中的弹性动画。

iOS SDK 中的弹性动画分析
----------------

iOS SDK 中提供了好几种创建弹性动画的方法，最简单的是 [UIView.animate](https://developer.apple.com/documentation/uikit/uiview/1622594-animate).

### UIView.animate

`extension UIView {`

    class func animate(withDuration duration: TimeInterval, 

                       delay: TimeInterval, 

                       usingSpringWithDamping dampingRatio: CGFloat, 

                       initialSpringVelocity velocity: CGFloat, 

                       options: UIView.AnimationOptions = \[\], 

                       animations: @escaping () -> Void, 

                       completion: ((Bool) -> Void)? = nil)

}

`UIView.animate` 的动画是由 `dampingRatio` 和 `initialSpringVelocity` 的参数决定的。但是这个函数的古怪之处在于，我们还需要填一个 时间 duration 参数。我们没办法根据 dampingRatio 和 intialSpringVelocity 计算出弹性动画时间，因为我们不知道 质量 mass 跟 刚度 stiffness，我们也不知道弹性的初始位移。

这个函数主要解决了另外一个问题：我们通过设置阻尼比跟动画时间来决定弹性的动画行为，其余参数在函数的实现中被自动计算出来。

因此, `UIView.animate` 函数主要用来做给定时间的简单动画，它无需参考坐标系。但这个动画函数无法在滚动视图中使用。

### CASpringAnimation

另外一种方式是 [CASpringAnimation](https://developer.apple.com/documentation/quartzcore/caspringanimation):

`open class CASpringAnimation : CABasicAnimation {`

    /\* The mass of the object attached to the end of the spring. Must be greater

       than 0. Defaults to one. \*/

    open var mass: CGFloat

    /\* The spring stiffness coefficient. Must be greater than 0.

     \* Defaults to 100. \*/    

    open var stiffness: CGFloat

    /\* The damping coefficient. Must be greater than or equal to 0.

     \* Defaults to 10. \*/

    open var damping: CGFloat

}

想要对 `CALayer` 的属性进行动画，就必须使用 `CASpringAnimation`。 `CASpringAnimation` 的参数有质量 mass, 刚度 stiffness 和阻尼 damping，但是没有 阻尼比 dampingratio。我们前面说过阻尼比决定了弹性的运动。如果我们不想要回弹振荡，我将其设置为 1 ，如果我们想要强烈的振荡，我们可以将其设置为接近 0.但是 CA 动画没有这个参数。

不过我们之前学了那个转换公式，因此我们可以拓展 `CASpringAnimation` 类，添加一个结构体来获取阻尼比 damping ratio:

`extension CASpringAnimation {`

    convenience init(mass: CGFloat = 1, stiffness: CGFloat = 100, 

                     dampingRatio: CGFloat) 

    {

        self.init()

        self.mass = mass

        self.stiffness = stiffness

        self.damping = 2 \* dampingRatio \* sqrt(mass \* stiffness)

    }

}

与此同时你还需要设置阻尼运动时间，跟 `UIView.animate` 不同的是 CASpringAnimation 提供了一个 `settlingDuration` 的属性，能根据 `CASpringAnimation` 的参数返回一个估算的动画时间:

`open class CASpringAnimation : CABasicAnimation {` 

    /\* The basic duration of the object. Defaults to 0. \*/

    var duration: CFTimeInterval { get set }

    /\* Returns the estimated duration required for the spring system to be

     \* considered at rest. The duration is evaluated for the current animation

     \* parameters. \*/    

    open var settlingDuration: CFTimeInterval { get }

}

问题在于 `settlingDuration` 的计算不考虑弹性值的偏移量，也不考虑起点值跟终点值 - `fromValue` 和 `toValue` ，你不管怎么设置 `fromValue` 和 `toValue` ，`settlingDuration` 都是一样的。这样设计的目的是为了灵活性，因为 `fromValue` 和 `toValue` 可以用来表示任何事情：可以是坐标值，也可以是颜色值 —— 颜色值的偏移量就很难去计算。

当调用 `UIView.animate` 进行动画时，你可以传入一个动画曲线的参数：例如 `.linear`, `.easeIn`, `.easeOut`, 或 `.easeInOut.`

这条动画曲线描述了动画进度是如何随时间从 0 到 1 变化的。

![](static/img/33.795ef3b.png) [WWDC:Advanced Animations with UIKit](http://developer.apple.com/videos/play/wwdc2017/230/)

在 iOS SDK 中弹性动画的设计也是如此。弹性方程用来表述一个 从 0 到 1 变化的动画进度曲线。因此弹性动画值的偏移量始终就是 1，因此 `fromValue` 和 `toValue` 的值可以忽略。

![](static/img/34.918f58b.png) [WWDC:Advanced Animations with UIKit](http://developer.apple.com/videos/play/wwdc2017/230/)

### UISpringTimingParameters

第三种创建弹性动好的方式，是从 iOS 10 开始的 [UISpringTimingParameters](https://developer.apple.com/documentation/uikit/uispringtimingparameters)。有两种创建 `UISpringTimingParameters` 的方式:

`class UISpringTimingParameters : NSObject, UITimingCurveProvider {`

    init(dampingRatio ratio: CGFloat, initialVelocity velocity: CGVector)

    init(mass: CGFloat, stiffness: CGFloat, damping: CGFloat,

        initialVelocity velocity: CGVector)

}

最有意思的是，使用的构造方法不同，`UISpringTimingParameters` 创建出来的动画效果也不同。

如果创建 `UISpringTimingParameters` 时使用了 `mass`， `stiffness` 和 `damping` 的构造方法，动画时间会被自动计算，我们设置的 `duration` 被忽略：

`let timingParameters = UISpringTimingParameters(mass: 1, stiffness: 100, damping: 10,`

                                                initialVelocity: .zero)

let animator = UIViewPropertyAnimator(duration: 4, timingParameters: timingParameters)

animator.addAnimations { /\* animations \*/ }

animator.startAnimation()

print(animator.duration) // 1.4727003346780927

这个设计就很灵活，既然你可以用 `animations` block 做任何事，这就证明了函数里面动画的偏移量是 0 到 1。但即便你知道了动画的偏移量，知道如何计算动画时间，你也无法自己手动设置。

如果创建 `UISpringTimingParameters` 时使用了 `dampingRatio`，那么动画时间就不会被自动计算，你需要设置以下:

`let timingParameters = UISpringTimingParameters(dampingRatio: 0.3,` 

                                                initialVelocity: .zero)

let animator = UIViewPropertyAnimator(duration: 4, timingParameters: timingParameters)

print(animator.duration) // 4.0

但这个方法在于我们没有足够的信息去计算，跟 `UIView.animate` 一样，没有质量 mass，没有刚度 stiffness，没有弹性偏移量。

### 偏移量为零的弹性动画

iOS 弹性动画还有一个常见问题时，没有 0 偏移量的动画 (`fromValue == toValue`)。因此，你无法快速的实现下面这样的动画：

![](static/img/35.6fe7e2f.gif) 偏移量为零的弹性动画

即便设置了 `initialSpringVelocity`，下面的这段代码也不起作用：

`UIView.animate(`

    withDuration: 5,

    delay: 0,

    usingSpringWithDamping: 0.1,

    initialSpringVelocity: -1000,

    animations: {

    })

即便你不断更新 frame ，也不会产生改变:

`UIView.animate(`

    withDuration: 5,

    delay: 0,

    usingSpringWithDamping: 0.1,

    initialSpringVelocity: -1000,

    animations: {

        self.circle.frame = self.circle.frame

    })

我们后面会看到，为了实现 `SimpleScrollView` 的回弹效果，你需要实现 零偏移量的动画。通过分析 iOS SDK 中弹性动画相关，我们了解到 iOS SDK 的函数不适用于我们的案例，因此我们需要自己实现。

弹性动画实现
------

为了实现弹性动画，我们使用 `SpringTimingParameters` 结构体:

`struct Spring {`

    var mass: CGFloat

    var stiffness: CGFloat

    var dampingRatio: CGFloat

}

struct SpringTimingParameters {

    var spring: Spring

    var displacement: CGPoint

    var initialVelocity: CGPoint

    var threshold: CGFloat

}

*   `spring` — 弹性参数;
    
*   `displacement` - 位移;
    
*   `initialVelocity` - 初始速度;
    
*   `threshold` — 用来求动画时间的变化量阈值；
    

利用公式，我们可以得到动画时间和运动方程 (`value:at:`):

`extension SpringTimingParameters {`

    var duration: TimeInterval

    func value(at time: TimeInterval) -> CGPoint

}

More on [GitHub](https://github.com/super-ultra/ScrollMechanics/blob/master/ScrollMechanics/Sources/SpringTimingParameters.swift)

现在我们来看一下回弹的工作原理，以及衰减动画和弹性动画之间过渡的实现:

*   定义滚动视图内容的边界
    
*   抬起手指时，拿到当前的内容偏移量 `contentOffset` 和手势速度
    
*   利用公式得出滚动最终停止的位置 (`destination`)
    
*   如果我们发现我们会越界，我们需要根据衰减公式计算，越界之前的动画时间和越界瞬间的速度。
    
*   因此，我们只需要先执行衰减动画，然后在碰撞边界的瞬间，将速度传递给弹性动画，将弹性动画设置为偏移量为 0 的动画机制，然后执行弹性动画即可。（译者注：跟我安卓的做法一样）
    

但在我们实现这个算法之前，我们拓展一下 `DecelerationTimingParameters` ，添加两个辅助函数：

*   `duration: to:` 用来得到越界之前的动画时间
    
*   `velocity: at:` 来得到越界瞬间的动画速度
    

`extension DecelerationTimingParameters {` 

    func duration(to value: CGPoint) -> TimeInterval? {

        guard value.distance(toSegment: (initialValue, destination)) < threshold else { return nil }

        let dCoeff = 1000 \* log(decelerationRate)

        return TimeInterval(log(1.0 + dCoeff \* (value - initialValue).length / initialVelocity.length) / dCoeff)

    }

    func velocity(at time: TimeInterval) -> CGPoint {

        return initialVelocity \* pow(decelerationRate, CGFloat(1000 \* time))

    } 

}

处理手势的 `handlePanRecognizer` 函数如下：

`@objc func handlePanRecognizer(_ sender: UIPanGestureRecognizer) {`

    switch sender.state {

    case .began:

        state = .dragging(initialOffset: contentOffset)

    case .changed:

        let translation = sender.translation(in: self)

        if case .dragging(let initialOffset) = state {

            contentOffset = clampOffset(initialOffset - translation)

        }

    case .ended:

        state = .default

        let velocity = sender.velocity(in: self)

        startDeceleration(withVelocity: -velocity)

    // Other cases

    }

}

现在我们改进一下当手指抬起的时候调用的 `startDeceleration` 函数：

`func startDeceleration(withVelocity velocity: CGPoint) {`

    let parameters = DecelerationTimingParameters(…)

    let destination = parameters.destination

    let intersection = getIntersection(rect: contentOffsetBounds, segment: (contentOffset, destination))

    let duration: TimeInterval

    if let intersection = intersection {

        duration = parameters.duration(to: intersection)      

    } else {

        duration = parameters.duration

    }

    contentOffsetAnimation = TimerAnimation(

        duration: duration,

        animations: { \[weak self\] \_, time in

            self?.contentOffset = parameters.value(at: time)

        },

        completion: { \[weak self\] finished in

            guard finished && intersection != nil else { return }

            let velocity = parameters.velocity(at: duration)

            self?.bounce(withVelocity: velocity)

        })

}

*   初始化 `DecelerationTimingParameters`;
    
*   找到滚动停止时的位置
    
*   找到与内容边界的碰撞点位置
    
*   如果发现会越界，那么找到越界之前的动画时间。
    
*   首先执行衰减动画，根据衰减动画的值，更新`contentOffset`
    
*   碰撞的瞬间，计算出瞬时速度，作为调用 `bounce` 函数的参数.
    

`bounce` 函数的实现如下：

`func bounce(withVelocity velocity: CGPoint) {`

    let restOffset = contentOffset.clamped(to: contentOffsetBounds)

    let displacement = contentOffset - restOffset

    let threshold = 0.5 / UIScreen.main.scale

    let spring = Spring(mass: 1, stiffness: 100, dampingRatio: 1)

    let parameters = SpringTimingParameters(spring: spring,

                                            displacement: displacement,

                                            initialVelocity: velocity,

                                            threshold: threshold)

    contentOffsetAnimation = TimerAnimation(

        duration: parameters.duration,

        animations: { \[weak self\] \_, time in

            self?.contentOffset = restOffset + parameters.value(at: time)

        })

}

*   首先，计算弹性动画的终止位置 —— 在此情况下，终止位置也就是内容的边界。
    
*   计算初始的弹性动画的偏移量 —— 在此情况下，为 0，因为此时此刻弹性动画的起点就在边界。
    
*   阈值设置为半个像素。
    
*   阻尼比设置为 1，这样在内容边界附近就不会产生周期振荡的动画效果。
    
*   初始化 `SpringTimingParameters`;
    
*   传入计算好的 动画时间 duration ，执行弹性动画。在 animations block 中，我们调用弹性运动方程，将当前的动画时间带入其中。然后用解出来的数值更新 `contentOffset`
    

结果如下：

![](static/img/36.6b96f01.gif)

当我们抬起手指的时候，内容会向边界方向滚动。如果触碰到了边界，则触发弹性动画的执行。因为衰减动画和弹性动画都是基于速度概念的数学公式，因此只要速度衔接得当，那么两个动画的连结会非常流畅。我们不需要分别调整衰减和弹性，就可以接的很好。

橡皮筋效果
-----

现在我们来处理橡皮筋效果。我们前面提到过，这是在边界处拖拽的滚动阻尼效果，而且这个效果不光在滚动中应用，也在我们的缩放手势中😤应用。

因为 iOS 开发文档中没有提到 橡皮筋效果 是如何实现的。因此我们得靠猜。我们首先根据边界手指拖拽的效果打出 `contentOffset` 的点生成曲线。然后再思考什么公式比较能近似生成此曲线。

![](static/img/37.3ca65bf.png)

首先，我们试着用 弹性公式 去套。但是不管怎么尝试，都无法接近图表中的曲线。

最后，我们决定尝试使用简单的多项式拟合曲线。实现方法是选择几个点，然后找出可能曲线上有这几个点的多项式。你可以自己手动计算，也可以去 [WolframAlpha](https://www.wolframalpha.com/input/?i=quadratic+fit+%7B0%2C+0%7D+%7B500%2C+205%7D+%7B1000%2C+328%7D+%7B1500%2C+409%7D) 输入这几个点来生成

`quadratic fit {0, 0} {500, 205} {1000, 328} {1500, 409}`

生成的多项式如下：

![](static/img/38.3508aca.png)

多项式曲线和 iOS 的函数曲线非常拟合：

![](static/img/39.bfaa82d.png)

得亏我们知道这个效果的专有名次叫 **橡皮筋效果**，不然我们的研究止步于此。

很快我们就在 twitter 上发现了一个公式：

![](static/img/40.55f11f0.png) [https://twitter.com/chpwn/status/285540192096497664](https://twitter.com/chpwn/status/285540192096497664)

*   等式右面的 x 指的是手指的位移量：
    
*   c 是某个比率
    
*   d 指的是滚动视图的尺寸
    

我们用这个函数构建了一个曲线图表，c 比率使用了 `0.55` ，发现曲线契合:

![](static/img/41.e19bd65.png)

我们再来分析一下这个公式的运作原理，我们来用更清晰的方式写出这个公式：

![](static/img/42.b2d8f9d.png)

我们使用不同的 c 比率，选择 812（iPhone X 的高度）作为 d 的值，构建曲线图表：

![](static/img/43.9890e56.png)

曲线图表说明 d 影响了橡皮筋效果的刚度：d 越小，橡皮筋效果越硬，就需要更强的拖拽才能驱动内容位移 `contentOffset`.

从函数我们知道，当 x 趋于无穷时，我们的函数的解无限趋近但小于 d：

![](data:image/png;base64,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)

这个公式非常方便，因为你可以用 d 来设置最大偏移量。通过这个公式，你可以确保滚动视图的内容永远保留在屏幕上。

橡皮筋效果仅使用了这一个公式，因此让我们来改进我们的 `SimpleScrollView` 类。

橡皮筋效果实现
-------

我们首先来生命一个 `rubberBandClamp` 函数， 这个函数来源自我们 Twitter 上看到的公式：

`func rubberBandClamp(_ x: CGFloat, coeff: CGFloat, dim: CGFloat) -> CGFloat {`

    return (1.0 - (1.0 / ((x \* coeff / dim) + 1.0))) \* dim

}

然后为了方便起见，我们给 `rubberBandClamp` 函数，添加一个限制 `limits` :

`func rubberBandClamp(_ x: CGFloat, coeff: CGFloat, dim: CGFloat,` 

                     limits: ClosedRange<CGFloat>) -> CGFloat 

{

    let clampedX = x.clamped(to: limits)

    let diff = abs(x - clampedX)

    let sign: CGFloat = clampedX > x ? -1 : 1

    return clampedX + sign \* rubberBandClamp(diff, coeff: coeff, dim: dim)

}

函数的运作原理如下：

![](data:image/png;base64,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)

*   如果 `x` 在限制 `limits` 之内，保留 `x` 原来的值
    
*   只要 `x` 在 limits 之外，那么执行 `rubberBandClamped`
    

当我们越界拖拽的时候，我们只需要 `rubberBandClamp` 函数即可。

让我们将此函数拓展为二维，然后创建 `RubberBand` 结构体:

`struct RubberBand {`

    var coeff: CGFloat

    var dims: CGSize

    var bounds: CGRect

    func clamp(\_ point: CGPoint) -> CGPoint {

        let x = rubberBandClamp(point.x, coeff: coeff, dim: dims.width, limits: bounds.minX...bounds.maxX)

        let y = rubberBandClamp(point.y, coeff: coeff, dim: dims.height, limits: bounds.minY...bounds.maxY)

        return CGPoint(x: x, y: y)

    }

}

*   我们用滚动视图的边界作为 bounds 参数 (`contentOffset` 边界);
    
*   至于 `dimensions` — 滚动。视图的尺寸
    
*   `clamp` 的运作原理如下：当传入的 `point` 位置点在 `bounds` 之内的时候，无事发生，如果超出了边界 `bounds` 的值，那么产生橡皮筋效果。
    

手势处理函数 `handlePanRecognizer` 如下：

`@objc func handlePanRecognizer(_ sender: UIPanGestureRecognizer) {`

    switch sender.state {

    case .began:

        state = .dragging(initialOffset: contentOffset)

    case .changed:

        let translation = sender.translation(in: self)

        if case .dragging(let initialOffset) = state {

            contentOffset = clampOffset(initialOffset - translation)

        }

    case .ended:

        state = .default

        let velocity = sender.velocity(in: self)

        startDeceleration(withVelocity: -velocity)

    // Other cases

    }

}

`clampOffset` 函数如下：

`func clampOffset(_ offset: CGPoint) -> CGPoint {`

    return offset.clamped(to: contentOffsetBounds)

}

这个函数会对传入的 `contentOffset` 进行范围限制，对越界的移动产生抵抗力。

为了产生橡皮筋效果，你需要创建 `RubberBand` 结构，传入滚动视图的尺寸`dimensions`，滚动视图的偏移量 `contentOffset`，边界位置 `bounds`，然后调用 `clamp` 函数.

`func clampOffset(_ offset: CGPoint) -> CGPoint {`

    let rubberBand = RubberBand(dims: frame.size, bounds: contentOffsetBounds)

    return rubberBand.clamp(offset)

}

但仅仅这样还不够，之前的滚动回弹动画中，当我们抬起手指的时候，我们先衰减再回弹。但是这个动画中，手势驱动的滚动在内容的边界范围之外。因此在边界范围之外的手势滚动不会触发衰减。因此当越界拖拽之后，视图需要归于原位（也就是最近的边界点），我们需要调用 `bounce` 函数。

我们在 `completeGesture` 函数中完成上述的动画逻辑，我们只需要在 `handlePanRecognizer` 函数中的 `.ended` 状态中写入我们的逻辑：

`case .ended:`

    state = .default

    let velocity = sender.velocity(in: self)

    completeGesture(withVelocity: -velocity)

// Other cases

这个函数本身非常简单：

`func completeGesture(withVelocity velocity: CGPoint) {`

    if contentOffsetBounds.contains(contentOffset) {

        startDeceleration(withVelocity: velocity)

    } else {

        bounce(withVelocity: velocity)

    }

}

*   当拖拽滚动视图产生的 `contentOffset` 在边界之内时，例如，当我们在边界内抬起手指，那么调用 `startDeceleration` 函数：
    
*   当我们在边界之外进行拖拽，松手时则调用 `bounce` 函数，不触发衰减，直接移动到最近的边界点。
    

视觉效果如下：

![](static/img/46.132a4d4.gif)

我们重修了这三种效果的力学原理，并用原理实现了这三种滚动效果。Yandex.Metro 的 C++ 代码也采用了同样的原理，但是有一些很小**但很重要** 的差异:

⚠️ 在 `SimpleScrollView` 的案例中，我们对 `contentOffset` 进行了动画，这是为了展示的简便性。但是更正确的做法是 **分离各个属性**：分开 `x`， `y` 以及 `scale`;

⚠️ 在 `SimpleScrollView` 的案例中, the `bounce` 函数被调用了两次，边界内拖拽后松手导致的边缘反弹，以及边界外拖拽松手导致的复位。两个动画的参数完全想通，但我个人建议这两种动画行为采用不同的 刚度stiffness参数 质量 mass 和 阻尼比 damping ratio 也可以分开调节。

案例
--

实现一整套滚动的需求非常罕见，我们这么做的原因是我们不能用平台的 SDK，这里我来展示一些采用上述函数的案例：

### 抽屉 - 状态间切换

在 Yandex.Metro 中的上拉抽屉，这种设计模式在一些苹果的应用中也有用到（地图，股市，Find My xxx 等）

![](static/img/47.3a4ecac.gif)

这个动画有三种状态：中间态，展开态，收缩态。抽屉不会停在这三种状态之外的状态上。当松开手指的时候，抽屉会滚动到这三个定点中的一个。这里的设计细节在于，当抬起手指的时候，如何判定应该停留在哪个状态的哪个点。

如果按照手指释放的位置跟状态的距离来判定，移动到展开态就很麻烦，因为你需要将手指移动接近屏幕上方的点释放：

![](static/img/48.c424a59.gif) 定位到最近点

这种实现，用户会感觉抽屉从你手里溜出去了

因此我们需要考虑手势速率。这个算法的实现多种多样，但是最成功的解决方案在 WWDC 的 Designing Fluid Interfaces 中有所展示。 采用这个解决方案的思路如下：

![](static/img/49.4447249.gif)

*   当手指离开的时候，抽屉的位置和手势的速度是已知的
    
*   根据上面的两个参数，运用找到抽屉最终会移动到的点的位置。
    
*   根据这个（符合物理模型、理想的）的点的位置，找到最近的定位点
    
*   动画滚动到这个定位点。
    

可以使用衰减动画的公式来寻找定位点。

![](static/img/50.01a0507.png)

我们来描述一下这个映射 `project` 函数，我们传入抽屉的当前位置 (`value`)，手势初始速度 `velocity` 以及衰减率 `decelerationRate`。这个函数会返回一个抽屉理想状态下衰减运动应该移动到的位置的值：

`func project(value: CGPoint, velocity: CGPoint, decelerationRate: CGFloat) -> CGPoint {`

    return value - velocity / (1000.0 \* log(decelerationRate))

}

整个手势的函数如下：

`func completeGesture(velocity: CGPoint) {`

    let decelerationRate = UIScrollView.DecelerationRate.normal.rawValue

    let projection = project(value: self.origin, velocity: velocity, 

                             decelerationRate: decelerationRate)

    let anchor = nearestAnchor(to: projection)

    UIView.animate(withDuration: 0.25) { \[weak self\] in

       self?.origin = anchor

    }

}

*   首先，选择衰减率为 `DecelerationRate.normal`;
    
*   找到理想衰减动画的映射函数的值 `projection`;
    
*   寻找最近的定位点 `anchor`;
    
*   修改抽屉的动画位置
    

![](static/img/51.f491dfa.gif) 线性曲线动画

但是这个动画还是不够完美。因为使用了固定的动画时间，动画会看起来不自然，因为这个动画没有考虑到手势的速率，以及手势起点和动画终点的距离。因此需要使用弹性动画：

![](static/img/52.8f6846c.gif)

*   当手指抬起的时候，抽屉位置和手势速度已知
    
*   传入上述两个参数，得出理想状况下抽屉该衰减移动到的位置。
    
*   找到和这个位置最近的点：
    
*   创建弹性动画，移动到该位置点，整个动画偏移量是手势点到终点的距离。
    

按上面的修改后，`completeGesture` 函数如下：

`func completeGesture(velocity: CGPoint) {`

    let decelerationRate = UIScrollView.DecelerationRate.normal.rawValue

    let projection = project(value: self.origin, velocity: velocity, 

                             decelerationRate: decelerationRate)

    let anchor = nearestAnchor(to: projection)

    let timingParameters = SpringTimingParameters(

        spring: Spring(mass: 1, stiffness: 200, dampingRatio: 1), 

        displacement: self.origin - anchor,

        initialVelocity: velocity, 

        threshold: 0.5 / UIScreen.main.scale)

    originAnimation = TimerAnimation(

        duration: timingParameters.duration,

        animations: { \[weak self\] \_, time in

            self?.origin = anchor + timingParameters.value(at: time)

        })

}

效果如下：

![](static/img/53.3a4ecac.gif)

因为阻尼比设置为 1，因此定位点附近的动画不产生周期振荡。如果阻尼比设置为接近于 0，效果如下：

![](static/img/54.203b376.gif)

除了一维的变化，这个方法还可以应用到二维的案例中

![](static/img/55.3f28dae.gif) PiP | [Example on GitHub](https://github.com/super-ultra/ScrollMechanics/tree/master/PictureInPicture)

这是模拟 FaceTime 或 Skype 的画中画的案例，这个算法在 WWDC 中有所阐述。我的这个案例考虑到了动画过渡中手势的作用，修正了状态。

你还可以利用映射方法来实现非同寻常的翻页效果：例如新 App Store 中的下面这个效果

![](static/img/56.0825937.gif) iOS 13 应用商店

这里的翻页效果应用了阻尼振荡。在标准的 UIScrollView 翻页中，所能翻的页面尺寸是一样的，翻页动画行为也不能控制。

### 抽屉 - 橡皮筋效果

除此之外，这个抽屉效果还可以加上一个橡皮筋效果。问题来了：为啥我要给抽屉加这种效果？在 iOS 中，任何能够滚动的都行，都有橡皮筋效果。如果滚动被突然阻断，那么 APP 看起来像卡住了。添加这个效果，会给用户的手势操作提供更多的反馈。

但是这个应用中的橡皮筋效果实现略有不同：

![](static/img/57.8ff41a5.gif)

*   对 `x`，我们取了抽屉当前状态的点为边界点。
    
*   这里使用了抽屉到屏幕上边缘的距离作为 `dimension`，这保证了抽屉不会滚动出屏幕。
    

收缩态也是同样如此：

![](static/img/58.4fd9a5b.gif)

*   对 `x`，我们取了抽屉当前状态的点为边界点。
    
*   使用了抽屉到屏幕下边缘的距离作为 `dimension`，这保证了抽屉不会滚动出屏幕。
    

### 地铁地图缩放

除了位移，橡皮筋效果可以用来施加给任何属性：二维位移、缩放、颜色、旋转。在 Metro 中，我们给手势缩放也添加了这个效果：

![](static/img/59.ea0912f.gif) 双指缩放的橡皮筋效果

总结
--

如果想在状态之间做平滑的动画过度，而状态导致的属性变化不局限于位置变化（例如颜色、旋转、不透明度），那么可以使用弹性动画和属性映射方法。

如果想要状态的边缘临界感平滑，可以考虑使用橡皮筋效果

了解动画效果的力学原理非常重要。比如说橡皮筋效果，我们找到了一个和我们期望公式在图形上非常近似的多项式，然而在意义上却大不相同：

![](static/img/60.5406eda.png)

原公式和近似公式的区别在于，原公式又一个 c 作为比率，用来可预测修改橡皮筋效果的刚度。在近似公式中，估计只能尝试通过调节 x 来控制刚度。

原公式中还有一个 d 参数，用来控制最大偏移量，而近似公式无法控制

当实现回弹效果时，我们先执行衰减动画，再执行弹性动画。因为我们这两种动画的实现都基于速度，所以不用调节衰减率，也不用调节弹性参数，就可以让两个动画无缝结合。所以我们可以随意调节衰减行为和回弹行为，这两个动画行为互不干扰，不管怎么调结合点都是平滑的，看起来像一段动画。

如果你想了解一些力学效果是如何运作，使用什么公式实现，我建议去看原公式，理解原理会简化实现难度。

* * *

📚 所有代码案例，包含 PiP 跟 `TimerAnimation`，可以在这个 [仓库](https://github.com/super-ultra/ScrollMechanics) 里找到

🚀 抽屉拉动案例已经加入了 CocoaPods ，可以看下这个 [仓库](https://github.com/super-ultra/UltraDrawerView) 。

👨‍💻 我还推荐看一下 [Designing Fluid Interfaces](http://developer.apple.com/videos/play/wwdc2018/803) 和 [Advanced Animations with UIKit](http://developer.apple.com/videos/play/wwdc2017/230)