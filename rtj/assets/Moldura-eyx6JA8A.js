const M=`#version 300 es
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`,I=`#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform vec3 u_anil;
uniform vec3 u_coral;
uniform vec3 u_gelo;
out vec4 o;

const float THICK = 0.2;
const float BAND = 0.4;
const float SOFT = 0.5;
const float GRAIN = 0.32;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float noise3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v / 0.875;
}
float grain(vec2 p) {
  uvec2 q = uvec2(ivec2(p) + 4096);
  uint h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = (h ^ (h >> 16u)) * 0x45d9f3bu;
  h ^= h >> 16u;
  return float(h) / 4294967295.0;
}

void main() {
  float m = min(u_res.x, u_res.y);
  vec2 size = u_res / m;
  vec2 p = gl_FragCoord.xy / m;
  float t = u_time * 0.06;
  float asp = size.x / size.y;
  vec2 d2 = min(p, size - p) * vec2(mix(1.0, 1.7, smoothstep(0.95, 0.6, asp)), mix(1.0, 1.6, smoothstep(1.1, 1.9, asp)));
  float k = 0.08;
  float h = clamp(0.5 + 0.5 * (d2.y - d2.x) / k, 0.0, 1.0);
  float edge = mix(d2.y, d2.x, h) - k * h * (1.0 - h);
  vec2 q = p * 1.3;
  vec2 w = vec2(noise3(q + vec2(0.0, t)), noise3(q + vec2(5.2, -t * 0.8)));
  float n = noise3(q + 1.8 * w + vec2(t * 0.7, -t * 0.4));
  float thick = THICK * smoothstep(0.3, 0.85, n);
  vec2 md = p - u_mouse * size;
  thick += 0.3 * u_hover * exp(-dot(md, md) * 6.0);
  float shape0 = clamp((thick - edge) / BAND, 0.0, 1.0);
  float shape = shape0 + GRAIN * (grain(gl_FragCoord.xy) - 0.5);
  float s = clamp(shape - 0.125, 0.0, 1.0);
  float alpha = smoothstep(0.0, SOFT, clamp(s * 4.0, 0.0, 1.0));
  float x = s * 3.0;
  float lo = 0.5 - 0.5 * SOFT, hi = 0.5 + 0.5 * SOFT;
  vec3 col = u_anil;
  col = mix(col, u_coral, smoothstep(lo, hi, clamp(x, 0.0, 1.0)));
  col = mix(col, u_gelo, smoothstep(lo, hi, clamp(x - 1.0, 0.0, 1.0)));
  col = mix(col, u_anil, smoothstep(lo, hi, clamp(x - 2.0, 0.0, 1.0)));
  float a = 0.8 * alpha * smoothstep(0.0, 0.3, shape0);
  o = vec4(col * a, a);
}`;function b(i,{calmo:l}){const o=document.createElement("canvas");o.className="moldura",o.setAttribute("aria-hidden","true");const e=o.getContext("webgl2",{antialias:!1,alpha:!0,premultipliedAlpha:!0});if(!e)return()=>{};const _=(t,a)=>{const n=e.createShader(t);return e.shaderSource(n,a),e.compileShader(n),n},s=e.createProgram();if(e.attachShader(s,_(e.VERTEX_SHADER,M)),e.attachShader(s,_(e.FRAGMENT_SHADER,I)),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS))return()=>{};e.useProgram(s),e.bindVertexArray(e.createVertexArray());const r=t=>e.getUniformLocation(s,t);e.uniform3f(r("u_anil"),.88,.02,0),e.uniform3f(r("u_coral"),1,.29,.2),e.uniform3f(r("u_gelo"),1,.56,.44),i.prepend(o);let h=0,u=!1,g=0,F=performance.now(),f=.5,p=.5,v=.5,d=.5,m=0,x=0;const A=()=>{const t=Math.min(devicePixelRatio||1,innerWidth<720?1.5:2);o.width=Math.max(1,Math.round(i.clientWidth*t)),o.height=Math.max(1,Math.round(i.clientHeight*t)),e.viewport(0,0,o.width,o.height)},c=t=>{e.uniform2f(r("u_res"),o.width,o.height),e.uniform1f(r("u_time"),t),e.uniform2f(r("u_mouse"),f,p),e.uniform1f(r("u_hover"),m),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},w=t=>{if(h=0,!u)return;const a=t-g;if(a>=31){const n=60/(1e3/Math.min(a,100));f+=(v-f)*(1-Math.pow(.94,n)),p+=(d-p)*(1-Math.pow(.94,n)),m+=(x-m)*(1-Math.pow(.96,n)),g=t,c((t-F)/1e3)}h=requestAnimationFrame(w)},T=()=>{l?c(18):!h&&u&&(h=requestAnimationFrame(w))},E=t=>{const a=i.getBoundingClientRect();v=(t.clientX-a.left)/a.width,d=1-(t.clientY-a.top)/a.height,x=1,l&&(f=v,p=d,m=1,c(18))},y=()=>{x=0,l&&(m=0,c(18))};i.addEventListener("pointermove",E),i.addEventListener("pointerleave",y);const R=new ResizeObserver(()=>{A(),l&&c(18)});R.observe(i);const S=new IntersectionObserver(t=>{u=t[0].isIntersecting,u&&T()},{rootMargin:"100px"});return S.observe(i),A(),l&&c(18),()=>{cancelAnimationFrame(h),R.disconnect(),S.disconnect(),i.removeEventListener("pointermove",E),i.removeEventListener("pointerleave",y),e.getExtension("WEBGL_lose_context")?.loseContext(),o.remove()}}export{b as montarMoldura};
