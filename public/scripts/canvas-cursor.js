function isMobile() {
  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}
if (!isMobile()) {
  const canvas = document.querySelector(".cursor-canvas");
  const ctx = canvas.getContext("2d");

  // Get the accent color from the CSS variables
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();

  let mouseMoved = false;

  const pointer = {
    x: 0.5 * window.innerWidth,
    y: 0.5 * window.innerHeight,
  };
  const params = {
    pointsNumber: 40,
    widthFactor: 0.3,
    spring: 0.4,
    friction: 0.5,
  };

  const trail = new Array(params.pointsNumber);
  for (let i = 0; i < params.pointsNumber; i++) {
    trail[i] = {
      x: pointer.x,
      y: pointer.y,
      dx: 0,
      dy: 0,
    };
  }

  // --- FIX STARTS HERE ---

  window.addEventListener("mousemove", (e) => {
    mouseMoved = true;
    // Use clientX/clientY for viewport-relative coordinates
    updateMousePosition(e.clientX, e.clientY);
  });
  window.addEventListener("touchmove", (e) => {
    mouseMoved = true;
    // Use clientX/clientY for viewport-relative coordinates
    updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  });

  // --- FIX ENDS HERE ---

  function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
  }

  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawTrail(color, widthModifier = 1) {
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
      const xc = 0.5 * (trail[i].x + trail[i + 1].x);
      const yc = 0.5 * (trail[i].y + trail[i + 1].y);
      ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
      ctx.lineWidth =
        params.widthFactor * (params.pointsNumber - i) * widthModifier;
      ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();
  }

  function update(t) {
    if (!mouseMoved) {
      pointer.x =
        (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) *
        window.innerWidth;
      pointer.y =
        (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) *
        window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    trail.forEach((p, pIdx) => {
      const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
      const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
      p.dx += (prev.x - p.x) * spring;
      p.dy += (prev.y - p.y) * spring;
      p.dx *= params.friction;
      p.dy *= params.friction;
      p.x += p.dx;
      p.y += p.dy;
    });

    const outlineColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-text-primary")
      .trim();
    drawTrail(
      outlineColor === "#000000ff" ? "rgba(255,255,255,0.5)" : "black",
      1.2
    );

    drawTrail(accentColor, 1);

    window.requestAnimationFrame(update);
  }

  setupCanvas();
  update(0);
  window.addEventListener("resize", setupCanvas);
}
