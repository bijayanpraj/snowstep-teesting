// if an image url is broken we show this light blue placeholder instead
export let fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'><rect width='100%' height='100%' fill='#e6f1fd'/><text x='50%' y='50%' fill='#7aa7d6' font-family='sans-serif' font-size='22' text-anchor='middle'>Image coming soon</text></svg>`
  );
