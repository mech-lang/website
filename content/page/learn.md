---
title: Learn
menu: main
comments: false
weight: 2
layout: page
---

# Bouncing Balls

Set up the environment

```
  #ball = [x y vx vy]
  #system/timer += [#timer resolution: 60Hz]
  #gravity = 9.8m/s^2
  #boundary = 5km
```

## Update Condition

The positions of the balls updates on every tick

```
  on #timer.tick
  [#ball x y vx vy]
  x := x + vx
  y := y + vy
  vy := vy + #gravity * #timer.dt
```

## Boundary Conditions

Constrain balls to within the boundary 

```
  [#ball x y vx vy]
  ix = x > #boundary
  iy = y > #boundary
  i0 = x < 0km

  // The balls cannot exceed the window boundary
  x[ix] := #boundary
  y[iy] := #boundary
  x[i0] := 0
  
  // Reverse velocity and dampen rebound
  vy[iy] := -vy * 90%
  vx[ix or i0] := -vx * 90%
```

## Reset on click

```
  on click = [#html/event/click]
  [#ball x y]
  x := click.x
  y := click.y
```