import{a as c}from"./parte-2TUX3VHC.js";var ce=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;var le=1920*1080*4,F=class{constructor(t,o,i,s,r=0,n=0,a=2,d=le,l=[]){c(this,"parentElement");c(this,"canvasElement");c(this,"gl");c(this,"program",null);c(this,"uniformLocations",{});c(this,"fragmentShader");c(this,"rafId",null);c(this,"lastRenderTime",0);c(this,"currentFrame",0);c(this,"speed",0);c(this,"currentSpeed",0);c(this,"providedUniforms");c(this,"mipmaps",[]);c(this,"hasBeenDisposed",!1);c(this,"resolutionChanged",!0);c(this,"textures",new Map);c(this,"minPixelRatio");c(this,"maxPixelCount");c(this,"isSafari",Be());c(this,"uniformCache",{});c(this,"textureUnitMap",new Map);c(this,"ownerDocument");c(this,"initProgram",()=>{let t=Ue(this.gl,ce,this.fragmentShader);t&&(this.program=t)});c(this,"setupPositionAttribute",()=>{let t=this.gl.getAttribLocation(this.program,"a_position"),o=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,o);let i=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(i),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0)});c(this,"setupUniforms",()=>{let t={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([o,i])=>{if(t[o]=this.gl.getUniformLocation(this.program,o),i instanceof HTMLImageElement){let s=`${o}AspectRatio`;t[s]=this.gl.getUniformLocation(this.program,s)}}),this.uniformLocations=t});c(this,"renderScale",1);c(this,"parentWidth",0);c(this,"parentHeight",0);c(this,"parentDevicePixelWidth",0);c(this,"parentDevicePixelHeight",0);c(this,"devicePixelsSupported",!1);c(this,"intersectionObserver",null);c(this,"isInViewport",!0);c(this,"resizeObserver",null);c(this,"setupResizeObserver",()=>{this.resizeObserver=new ResizeObserver(([t])=>{if(t?.borderBoxSize[0]){let o=t.devicePixelContentBoxSize?.[0];o!==void 0&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=o.inlineSize,this.parentDevicePixelHeight=o.blockSize),this.parentWidth=t.borderBoxSize[0].inlineSize,this.parentHeight=t.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)});c(this,"setupIntersectionObserver",()=>{let t=this.ownerDocument.defaultView;t?.IntersectionObserver&&(this.intersectionObserver=new t.IntersectionObserver(([o])=>{this.isInViewport=o?.isIntersecting??!0,this.updateCurrentSpeed()}),this.intersectionObserver.observe(this.parentElement))});c(this,"handleVisualViewportChange",()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()});c(this,"handleResize",()=>{let t=0,o=0,i=Math.max(1,window.devicePixelRatio),s=visualViewport?.scale??1;if(this.devicePixelsSupported){let h=Math.max(1,this.minPixelRatio/i);t=this.parentDevicePixelWidth*h*s,o=this.parentDevicePixelHeight*h*s}else{let h=Math.max(i,this.minPixelRatio)*s;if(this.isSafari){let m=Ee(this.ownerDocument);h*=Math.max(1,m)}t=Math.round(this.parentWidth)*h,o=Math.round(this.parentHeight)*h}let r=Math.sqrt(this.maxPixelCount)/Math.sqrt(t*o),n=Math.min(1,r),a=Math.round(t*n),d=Math.round(o*n),l=a/Math.round(this.parentWidth);(this.canvasElement.width!==a||this.canvasElement.height!==d||this.renderScale!==l)&&(this.renderScale=l,this.canvasElement.width=a,this.canvasElement.height=d,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))});c(this,"render",t=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}let o=t-this.lastRenderTime;this.lastRenderTime=t,this.currentSpeed!==0&&(this.currentFrame+=o*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*.001),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0?this.requestRender():this.rafId=null});c(this,"requestRender",()=>{this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)});c(this,"setTextureUniform",(t,o)=>{if(!o.complete||o.naturalWidth===0)throw new Error(`Paper Shaders: image for uniform ${t} must be fully loaded`);let i=this.textures.get(t);i&&this.gl.deleteTexture(i),this.textureUnitMap.has(t)||this.textureUnitMap.set(t,this.textureUnitMap.size);let s=this.textureUnitMap.get(t);this.gl.activeTexture(this.gl.TEXTURE0+s);let r=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,r),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,o),this.mipmaps.includes(t)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let n=this.gl.getError();if(n!==this.gl.NO_ERROR||r===null){console.error("Paper Shaders: WebGL error when uploading texture:",n);return}this.textures.set(t,r);let a=this.uniformLocations[t];if(a){this.gl.uniform1i(a,s);let d=`${t}AspectRatio`,l=this.uniformLocations[d];if(l){let h=o.naturalWidth/o.naturalHeight;this.gl.uniform1f(l,h)}}});c(this,"areUniformValuesEqual",(t,o)=>t===o?!0:Array.isArray(t)&&Array.isArray(o)&&t.length===o.length?t.every((i,s)=>this.areUniformValuesEqual(i,o[s])):!1);c(this,"setUniformValues",t=>{this.gl.useProgram(this.program),Object.entries(t).forEach(([o,i])=>{let s=i;if(i instanceof HTMLImageElement&&(s=`${i.src.slice(0,200)}|${i.naturalWidth}x${i.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[o],s))return;this.uniformCache[o]=s;let r=this.uniformLocations[o];if(!r){console.warn(`Uniform location for ${o} not found`);return}if(i instanceof HTMLImageElement)this.setTextureUniform(o,i);else if(Array.isArray(i)){let n=null,a=null;if(i[0]!==void 0&&Array.isArray(i[0])){let d=i[0].length;if(i.every(l=>l.length===d))n=i.flat(),a=d;else{console.warn(`All child arrays must be the same length for ${o}`);return}}else n=i,a=n.length;switch(a){case 2:this.gl.uniform2fv(r,n);break;case 3:this.gl.uniform3fv(r,n);break;case 4:this.gl.uniform4fv(r,n);break;case 9:this.gl.uniformMatrix3fv(r,!1,n);break;case 16:this.gl.uniformMatrix4fv(r,!1,n);break;default:console.warn(`Unsupported uniform array length: ${a}`)}}else typeof i=="number"?this.gl.uniform1f(r,i):typeof i=="boolean"?this.gl.uniform1i(r,i?1:0):console.warn(`Unsupported uniform type for ${o}: ${typeof i}`)})});c(this,"getCurrentFrame",()=>this.currentFrame);c(this,"setFrame",t=>{this.currentFrame=t,this.lastRenderTime=performance.now(),this.render(performance.now())});c(this,"setSpeed",(t=1)=>{this.speed=t,this.updateCurrentSpeed()});c(this,"updateCurrentSpeed",()=>{this.setCurrentSpeed(this.ownerDocument.hidden||!this.isInViewport?0:this.speed)});c(this,"setCurrentSpeed",t=>{this.currentSpeed=t,this.rafId===null&&t!==0&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),this.rafId!==null&&t===0&&(cancelAnimationFrame(this.rafId),this.rafId=null)});c(this,"setMaxPixelCount",(t=le)=>{this.maxPixelCount=t,this.handleResize()});c(this,"setMinPixelRatio",(t=2)=>{this.minPixelRatio=t,this.handleResize()});c(this,"setUniforms",t=>{this.setUniformValues(t),this.providedUniforms={...this.providedUniforms,...t},this.render(performance.now())});c(this,"handleDocumentVisibilityChange",()=>{this.updateCurrentSpeed()});c(this,"dispose",()=>{this.hasBeenDisposed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(t=>{this.gl.deleteTexture(t)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount});if(t?.nodeType===1)this.parentElement=t;else throw new Error("Paper Shaders: parent element must be an HTMLElement");this.ownerDocument=t.ownerDocument,this.ownerDocument.querySelector("style[data-paper-shader]")||this.ownerDocument.createElement("style").setAttribute("data-paper-shader","");let h=this.ownerDocument.createElement("canvas");this.canvasElement=h,this.parentElement.prepend(h),this.fragmentShader=o,this.providedUniforms=i,this.mipmaps=l,this.currentFrame=n,this.minPixelRatio=a,this.maxPixelCount=d;let m=h.getContext("webgl2",s);if(!m)throw new Error("Paper Shaders: WebGL is not supported in this browser");this.gl=m,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setupIntersectionObserver(),this.setSpeed(r),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}};function ue(e,t,o){let i=e.createShader(t);return i?(e.shaderSource(i,o),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS)?i:(console.error("An error occurred compiling the shaders: "+e.getShaderInfoLog(i)),e.deleteShader(i),null)):null}function Ue(e,t,o){let i=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),s=i?i.precision:null;s&&s<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),o=o.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let r=ue(e,e.VERTEX_SHADER,t),n=ue(e,e.FRAGMENT_SHADER,o);if(!r||!n)return null;let a=e.createProgram();return a?(e.attachShader(a,r),e.attachShader(a,n),e.linkProgram(a),e.getProgramParameter(a,e.LINK_STATUS)?(e.detachShader(a,r),e.detachShader(a,n),e.deleteShader(r),e.deleteShader(n),a):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(a)),e.deleteProgram(a),e.deleteShader(r),e.deleteShader(n),null)):null}function Be(){let e=navigator.userAgent.toLowerCase();return e.includes("safari")&&!e.includes("chrome")&&!e.includes("android")}function Ee(e){let t=visualViewport?.scale??1,o=visualViewport?.width??window.innerWidth,i=window.innerWidth-e.documentElement.clientWidth,s=t*o+i,r=outerWidth/s,n=Math.round(100*r);return n%5===0?n/100:n===33?1/3:n===67?2/3:n===133?4/3:r}var D={none:0,contain:1,cover:2};var me=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,de=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;var he=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,pe=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;var O=`#version 300 es
precision mediump float;

uniform sampler2D u_image;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${me}
${de}
${pe}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  // u_contour is applied in 2 separate ranges:
  // - 0 to .4 sets the edge hardness, saturated above .4 (both branches below)
  // - .5 to 1 warps the stripes direction along the edges, inactive below .5 (see u_contour range 2)
  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  // u_contour range 2
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${he}

  fragColor = vec4(color, opacity);
}
`,V={measurePerformance:!1,workingSize:256,iterations:40};function L(e){let t=document.createElement("canvas"),o=t.getContext("2d"),i=typeof e=="string"&&e.startsWith("blob:");return new Promise((s,r)=>{if(!e||!o){r(new Error("Invalid file or canvas context"));return}let n=i&&fetch(e).then(l=>l.headers.get("Content-Type")),a=new Image;a.crossOrigin="anonymous";let d=performance.now();a.onload=async()=>{let l,h=await n;h?l=h==="image/svg+xml":typeof e=="string"?l=e.endsWith(".svg")||e.startsWith("data:image/svg+xml"):l=e.type==="image/svg+xml";let m=a.width||a.naturalWidth,f=a.height||a.naturalHeight;if(l){let g=m/f;m>f?(m=4096,f=4096/g):(f=4096,m=4096*g),a.width=m,a.height=f}let M=Math.min(m,f),x=V.workingSize/M,u=Math.round(m*x),v=Math.round(f*x);V.measurePerformance&&(console.log("[Processing Mode]"),console.log(`  Original: ${m}\xD7${f}`),console.log(`  Working: ${u}\xD7${v} (${(x*100).toFixed(1)}% scale)`),x<1&&console.log(`  Speedup: ~${Math.round(1/(x*x))}\xD7`)),t.width=m,t.height=f;let R=document.createElement("canvas");R.width=u,R.height=v;let I=R.getContext("2d");I.drawImage(a,0,0,u,v);let T=performance.now(),S=I.getImageData(0,0,u,v).data,b=new Uint8Array(u*v),X=new Uint8Array(u*v),q=0;for(let p=0,g=0;p<S.length;p+=4,g++){let w=S[p+3]===0?0:1;b[g]=w,q+=w}let Y=[],A=[];for(let p=0;p<v;p++)for(let g=0;g<u;g++){let _=p*u+g;if(!b[_])continue;let w=!1;g===0||g===u-1||p===0||p===v-1?w=!0:w=!b[_-1]||!b[_+1]||!b[_-u]||!b[_+u]||!b[_-u-1]||!b[_-u+1]||!b[_+u-1]||!b[_+u+1],w?(X[_]=1,Y.push(_)):A.push(_)}V.measurePerformance&&(console.log(`[Mask Building] Time: ${(performance.now()-T).toFixed(2)}ms`),console.log(`  Shape pixels: ${q} / ${u*v} (${(q/(u*v)*100).toFixed(1)}%)`),console.log(`  Interior pixels: ${A.length}`),console.log(`  Boundary pixels: ${Y.length}`));let Se=Me(b,X,new Uint32Array(A),new Uint32Array(Y),u,v),ye=performance.now(),j=Ie(Se,b,X,u,v);V.measurePerformance&&console.log(`[Poisson Solve] Time: ${(performance.now()-ye).toFixed(2)}ms`);let Z=0,se;for(let p=0;p<A.length;p++){let g=A[p];j[g]>Z&&(Z=j[g])}let W=document.createElement("canvas");W.width=u,W.height=v;let ae=W.getContext("2d"),E=ae.createImageData(u,v);for(let p=0;p<v;p++)for(let g=0;g<u;g++){let _=p*u+g,w=_*4;if(!b[_])E.data[w]=255,E.data[w+1]=255,E.data[w+2]=255,E.data[w+3]=0;else{let K=255*(1-j[_]/Z);E.data[w]=K,E.data[w+1]=K,E.data[w+2]=K,E.data[w+3]=255}}ae.putImageData(E,0,0),o.imageSmoothingEnabled=!0,o.imageSmoothingQuality="high",o.drawImage(W,0,0,u,v,0,0,m,f);let U=o.getImageData(0,0,m,f),J=document.createElement("canvas");J.width=m,J.height=f;let ne=J.getContext("2d");ne.drawImage(a,0,0,m,f);let Re=ne.getImageData(0,0,m,f);for(let p=0;p<U.data.length;p+=4){let g=Re.data[p+3],_=U.data[p+3];g===0?(U.data[p]=255,U.data[p+1]=0):(U.data[p]=_===0?0:U.data[p],U.data[p+1]=g),U.data[p+2]=255,U.data[p+3]=255}o.putImageData(U,0,0),se=U,t.toBlob(p=>{if(!p){r(new Error("Failed to create PNG blob"));return}if(V.measurePerformance){let g=performance.now()-d;if(console.log(`[Total Processing Time] ${g.toFixed(2)}ms`),x<1){let _=g*Math.pow(m*f/(u*v),1.5);console.log(`[Estimated time at full resolution] ~${_.toFixed(0)}ms`),console.log(`[Time saved] ~${(_-g).toFixed(0)}ms (${Math.round(_/g)}\xD7 faster)`)}}s({imageData:se,pngBlob:p})},"image/png")},a.onerror=()=>r(new Error("Failed to load image")),a.src=typeof e=="string"?e:URL.createObjectURL(e)})}function Me(e,t,o,i,s,r){let n=o.length,a=new Int32Array(n*4);for(let d=0;d<n;d++){let l=o[d],h=l%s,m=Math.floor(l/s);a[d*4+0]=h<s-1&&e[l+1]?l+1:-1,a[d*4+1]=h>0&&e[l-1]?l-1:-1,a[d*4+2]=m>0&&e[l-s]?l-s:-1,a[d*4+3]=m<r-1&&e[l+s]?l+s:-1}return{interiorPixels:o,boundaryPixels:i,pixelCount:n,neighborIndices:a}}function Ie(e,t,o,i,s){let r=V.iterations,n=.01,a=new Float32Array(i*s),{interiorPixels:d,neighborIndices:l,pixelCount:h}=e,m=performance.now(),f=1.9,M=[],B=[];for(let x=0;x<h;x++){let u=d[x],v=u%i,R=Math.floor(u/i);(v+R)%2===0?M.push(x):B.push(x)}for(let x=0;x<r;x++){for(let u of M){let v=d[u],R=l[u*4+0],I=l[u*4+1],T=l[u*4+2],z=l[u*4+3],S=0;R>=0&&(S+=a[R]),I>=0&&(S+=a[I]),T>=0&&(S+=a[T]),z>=0&&(S+=a[z]);let b=(n+S)/4;a[v]=f*b+(1-f)*a[v]}for(let u of B){let v=d[u],R=l[u*4+0],I=l[u*4+1],T=l[u*4+2],z=l[u*4+3],S=0;R>=0&&(S+=a[R]),I>=0&&(S+=a[I]),T>=0&&(S+=a[T]),z>=0&&(S+=a[z]);let b=(n+S)/4;a[v]=f*b+(1-f)*a[v]}}if(V.measurePerformance){let x=performance.now()-m;console.log(`[Optimized Poisson Solver (SOR \u03C9=${f})]`),console.log(`  Working size: ${i}\xD7${s}`),console.log(`  Iterations: ${r}`),console.log(`  Time: ${x.toFixed(2)}ms`),console.log(`  Interior pixels processed: ${h}`),console.log(`  Speed: ${(r*h/(x*1e3)).toFixed(2)} Mpixels/sec`)}return a}var k={none:0,circle:1,daisy:2,diamond:3,metaballs:4};function P(e){if(Array.isArray(e))return e.length===4?e:e.length===3?[...e,1]:C;if(typeof e!="string")return C;let t,o,i,s=1;if(e.startsWith("#"))[t,o,i,s]=Te(e);else if(e.startsWith("rgb")){let r=Fe(e);if(r===null)return C;[t,o,i,s]=r}else if(e.startsWith("hsl")){let r=Ve(e);if(r===null)return C;[t,o,i,s]=Pe(r)}else return console.error("Unsupported color format",e),C;return[$(t,0,1),$(o,0,1),$(i,0,1),$(s,0,1)]}function Te(e){if(e=e.replace(/^#/,""),(e.length===3||e.length===4)&&(e=e.split("").map(r=>r+r).join("")),e.length===6&&(e=e+"ff"),!/^[0-9a-f]{8}$/i.test(e))return console.warn("Invalid hex color"),C;let t=parseInt(e.slice(0,2),16)/255,o=parseInt(e.slice(2,4),16)/255,i=parseInt(e.slice(4,6),16)/255,s=parseInt(e.slice(6,8),16)/255;return[t,o,i,s]}function Fe(e){let t=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??"0")/255,parseInt(t[2]??"0")/255,parseInt(t[3]??"0")/255,t[4]===void 0?1:parseFloat(t[4])]:null}function Ve(e){let t=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??"0"),parseInt(t[2]??"0"),parseInt(t[3]??"0"),t[4]===void 0?1:parseFloat(t[4])]:null}function Pe(e){let[t,o,i,s]=e,r=t/360,n=o/100,a=i/100,d,l,h;if(o===0)d=l=h=a;else{let m=(B,x,u)=>(u<0&&(u+=1),u>1&&(u-=1),u<.16666666666666666?B+(x-B)*6*u:u<.5?x:u<.6666666666666666?B+(x-B)*(.6666666666666666-u)*6:B),f=a<.5?a*(1+n):a+n-a*n,M=2*a-f;d=m(M,f,r+1/3),l=m(M,f,r),h=m(M,f,r-1/3)}return[d,l,h,s]}var $=(e,t,o)=>Math.min(Math.max(e,t),o),C=[.5,.5,.5,1];var y={font:"300 400px 'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif",letterSpacing:-12,tint:"#e8ecef",repetition:1.25,softness:.26,shiftRed:.08,shiftBlue:.2,distortion:.07,contour:.34,angle:70,speed:.8},Q=80;async function ze(e){await document.fonts.load(y.font);let t=document.createElement("canvas").getContext("2d");return t.font=y.font,t.letterSpacing=`${y.letterSpacing}px`,{w:Math.ceil(t.measureText(e).width)+Q*2,h:400+Q*2}}async function Ce(e){let t=await ze(e),o=document.createElement("canvas");o.width=t.w,o.height=t.h;let i=o.getContext("2d");return i.font=y.font,i.letterSpacing=`${y.letterSpacing}px`,i.fillStyle="#fff",i.textBaseline="middle",i.fillText(e,Q,o.height/2+14),new Promise((s,r)=>o.toBlob(n=>n?s(n):r(new Error("cromo: m\xE1scara vazia")),"image/png"))}var H=new Map;function Ae(e,t){if(t)return H.get(t)||H.set(t,(async()=>{let i=new Image;return i.src=t,await i.decode(),i})()).get(t);let o=H.get(e);return o||(o=Ce(e).then(async i=>{let{pngBlob:s}=await L(new File([i],"mascara.png",{type:"image/png"})),r=new Image;return r.src=URL.createObjectURL(s),await r.decode(),r}),H.set(e,o)),o}function fe(e,t,o){let i,s=!0,r=async()=>{let d=await Ae(t,e.dataset.mascara);s&&(i=new F(e,O,{u_colorBack:P("rgba(0,0,0,0)"),u_colorTint:P(y.tint),u_image:d,u_isImage:!0,u_shape:k.none,u_repetition:y.repetition,u_softness:y.softness,u_shiftRed:y.shiftRed,u_shiftBlue:y.shiftBlue,u_distortion:y.distortion,u_contour:y.contour,u_angle:y.angle,u_fit:D.contain,u_scale:1,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0},void 0,matchMedia("(prefers-reduced-motion: reduce)").matches?0:y.speed,0,2,16e5,["u_image"]),e.dataset.ready="",o&&o())},n=new IntersectionObserver(([d])=>{d.isIntersecting&&(n.disconnect(),r().catch(l=>console.warn("cromo: ficou o t\xEDtulo comum",l)))},{rootMargin:"400px"});return n.observe(e),{sair:()=>{if(s=!1,n.disconnect(),i){let d=i.canvasElement.getContext("webgl2");i.dispose(),d?.getExtension("WEBGL_lose_context")?.loseContext()}delete e.dataset.ready},parar:()=>{i&&i.setSpeed(0)}}}function De(e,t,o){let s=new OffscreenCanvas(Math.round(e*4),Math.round(t*4)),r=s.getContext("2d");r.fillStyle="#fff",r.beginPath(),r.roundRect(0,0,s.width,s.height,s.height/2),r.fill();let n=o*4;return r.globalCompositeOperation="destination-out",r.beginPath(),r.roundRect(n,n,s.width-n*2,s.height-n*2,s.height/2-n),r.fill(),s}var ge=new Map,ve=Promise.resolve();function Oe(e,t,o){let i=`${e}x${t}:${o}`,s=ge.get(i);return s||(s=ve.then(async()=>{let r=await De(e,t,o).convertToBlob({type:"image/png"}),{pngBlob:n}=await L(new File([r],"mask.png",{type:"image/png"})),a=new Image;return a.src=URL.createObjectURL(n),await a.decode(),a}),ve=s.catch(()=>{}),ge.set(i,s)),s}async function xe(e){let t=await Oe(e.offsetWidth,e.offsetHeight,2);if(!e.isConnected)return()=>{};let o=matchMedia("(prefers-reduced-motion: reduce)").matches,i=new F(e,O,{u_colorBack:P("rgba(0,0,0,0)"),u_colorTint:P("#e8ecef"),u_image:t,u_isImage:!0,u_shape:k.none,u_repetition:1.5,u_softness:.15,u_shiftRed:.12,u_shiftBlue:.34,u_distortion:.08,u_contour:.2,u_angle:90,u_fit:D.contain,u_scale:1,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0},void 0,o?0:1,0,2,4e5,["u_image"]);return e.classList.add("is-ready"),()=>{i.dispose(),e.classList.remove("is-ready")}}var G=document.documentElement,Le=matchMedia("(prefers-reduced-motion: reduce)"),ke=matchMedia("(min-width: 1040px) and (pointer: fine)"),Ge=(()=>{try{return!!document.createElement("canvas").getContext("webgl2")}catch{return!1}})(),ee=e=>document.querySelector(e),te=()=>new Promise(e=>"requestIdleCallback"in window?requestIdleCallback(()=>e(),{timeout:1500}):setTimeout(e,200)),oe=e=>new Promise(t=>setTimeout(t,e)),We=new Promise(e=>document.readyState==="complete"?e():addEventListener("load",()=>e(),{once:!0})),_e="m1l-marca-modo",$e=()=>{try{let e=JSON.parse(localStorage.getItem(_e)||"null");return e&&Date.now()-e.em<7*864e5?e.modo:null}catch{return null}},He=e=>{try{localStorage.setItem(_e,JSON.stringify({modo:e,em:Date.now()}))}catch{}},ie=(e=1e3)=>new Promise(t=>{let o=0,i=performance.now(),s=r=>{o++,r-i<e?requestAnimationFrame(s):t(o*1e3/(r-i))};requestAnimationFrame(s)}),re=0,N=[];function be(){re++,N.splice(0).forEach(e=>{try{e()}catch{}}),G.classList.remove("mc-tem-cromo","mc-3d-vivo")}async function Ne(){let e=++re,t=()=>e===re;if(await We,await te(),!t()||!Ge||Le.matches)return;let o=ee(".hero .mc-cromo"),i=ee(".hero .mc-anel"),s=ee(".hero .mc-3d"),r=/[?&]mc=cheio\b/.test(location.search),n=!r&&$e()==="leve",a=n||r?60:await ie(500),d=m=>!r&&m<Math.max(20,Math.min(40,a*.6));if(!t())return;let l,h;if(o&&o.offsetParent)try{l=fe(o,o.dataset.texto,()=>{t()&&G.classList.add("mc-tem-cromo"),n&&l.parar()}),N.push(()=>l.sair())}catch(m){console.warn("premium: o t\xEDtulo ficou comum",m)}if(l&&!n){if(await oe(700),!t())return;d(await ie())&&(l.parar(),n=!0)}if(await oe(100),await te(),!!t()){if(s&&ke.matches&&!n){if(h=await import("./parte-222CNDSH.js").then(m=>t()?m.montarSimbolo3D(s,G):null).catch(m=>(console.warn("premium: o s\xEDmbolo ficou em imagem",m),null)),h&&!t()){h.sair();return}h&&(N.push(()=>h.sair()),d(await ie(1200))&&(h.sair(),l&&l.parar(),n=!0))}await oe(300),await te(),t()&&(i&&i.offsetParent&&!n&&"OffscreenCanvas"in window&&xe(i).then(m=>{t()?N.push(m):m()}).catch(m=>console.warn("premium: o anel ficou liso",m)),r||He(n?"leve":"cheio"))}}var we=()=>{G.getAttribute("data-tema")==="marca"?Ne():be()};new MutationObserver(()=>{be(),we()}).observe(G,{attributes:!0,attributeFilter:["data-tema"]});we();
