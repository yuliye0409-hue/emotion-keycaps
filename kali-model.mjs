import * as T from './vendor/three.module.min.js';

const radialSteps = 80;
// Sample tighter near corners, using control profiles matched to the front
// and brim-side drawings. The UV positions live on the model at every angle.
function roundedRings(stations, crossSection) {
  const profile = new T.CatmullRomCurve3(stations.map(([y,x,z]) => new T.Vector3(x,y,z)));
  const positions = [], frame = [], surface = [];
  const verticalSteps = 60;
  for (let row = 0; row <= verticalSteps; row++) {
    const dimensions = profile.getPoint(row/verticalSteps);
    const w = Math.max(dimensions.x,.001), d = Math.max(dimensions.z,.001);
    for (let i = 0; i <= radialSteps; i++) {
      const angle = (i/radialSteps-.5)*2*Math.PI;
      const [x,y,z] = crossSection(angle,w,dimensions.y,d,row/verticalSteps);
      positions.push(x,y,z);
      frame.push(angle,y);
    }
  }
  for (let row = 0; row < verticalSteps; row++) {
    for (let i = 0; i < radialSteps; i++) {
      const a = row*(radialSteps+1)+i, b = a+1, c = a+radialSteps+1;
      surface.push(a,b,c,b,c+1,c);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('surfaceFrame',new T.Float32BufferAttribute(frame,2));
  geometry.setIndex(surface);
  geometry.computeBoundingSphere();
  return geometry;
}
const superAxis = (v,exponent)=> Math.sign(v)*Math.pow(Math.abs(v),exponent);
export const cap = roundedRings([
  [.430,0,0],[.442,.36,.327],[.475,.615,.499],[.524,.744,.623],[.586,.844,.721],
  [.681,.913,.795],[.795,.943,.829],[.878,.944,.842],[1.015,.923,.832],[1.16,.891,.808],[1.45,.830,.750],
  [1.72,.771,.688],[1.892,.733,.647],[2.02,.677,.596],[2.106,.588,.521],
  [2.145,.487,.435],[2.164,.31,.271],[2.173,0,0]
],(a,w,y,d) => {
  const roundUnder=(1-T.MathUtils.smoothstep(y,.46,.68))*.033*Math.sin(a)**2;
  return [w*superAxis(Math.sin(a),.70),y+.023*w*Math.sin(a)+roundUnder,d*superAxis(Math.cos(a),.57)];
});

export const body = roundedRings([
  [.133,0,0],[.139,.225,.143],[.169,.412,.227],[.215,.533,.281],
  [.276,.576,.310],[.357,.590,.333],[.452,.578,.341],[.537,.545,.318],
  [.607,.419,.252],[.641,0,0]
],(a,w,y,d) => {
  const x=w*superAxis(Math.sin(a),.73);
  const arch=.013*Math.exp(-((x/.09)**2))*(1-T.MathUtils.smoothstep(y,.136,.20));
  return [x,y+arch,d*superAxis(Math.cos(a),.70)+.026];
});

// Separate foot volumes hold the notch at the front and give each sole
// genuine depth. A small stance offset keeps the feet readable in profile.
export const foot = roundedRings([
  [.007,0,0],[.010,.132,.109],[.024,.201,.159],[.052,.250,.194],
  [.095,.272,.205],[.147,.271,.208],[.212,.252,.185],[.268,.223,.163],
  [.323,.188,.138],[.364,.101,.090],[.380,0,0]
],(a,w,y,d) => [
  w*superAxis(Math.sin(a),.67),y,
  d*superAxis(Math.cos(a),.69)+.045*(1-y/.38)
]);

// The short arms nest into the body and share the character's outer contour.
const makeArm = (side) => roundedRings([
  [.261,0,0],[.268,.061,.075],[.290,.108,.126],[.327,.135,.145],
  [.376,.151,.165],[.425,.133,.154],[.477,.111,.123],[.528,.078,.085],[.572,0,0]
],(a,w,y,d) => [
  side*(.657-.154*T.MathUtils.smoothstep(y,.33,.57))+w*superAxis(Math.sin(a),.91),
  y,d*Math.cos(a)+.018+.048*(1-T.MathUtils.smoothstep(y,.27,.49))
]);

// The brim is rounded in plan and tapers into the cap along the original
// diagonal. The ink pass outlines the combined silhouette of both shapes.
export const hatBrim = roundedRings([
  [0,0,0],[.04,.025,.045],[.12,.045,.098],[.26,.056,.143],
  [.43,.052,.171],[.60,.049,.188],[.78,.085,.229],[.94,.100,.241],[1,.020,.032]
],(a,thickness,t,depth) => [
  -1.215+.79*t, 1.82+.086*t+.010*Math.sin(t*Math.PI)+thickness*Math.sin(a),
  .819-.324*t+depth*Math.cos(a)
]);
// The horizontal sweep reverses the default ring winding.
const brimIndex=hatBrim.getIndex();
for(let i=0;i<brimIndex.count;i+=3){
  const second=brimIndex.getX(i+1);
  brimIndex.setX(i+1,brimIndex.getX(i+2));
  brimIndex.setX(i+2,second);
}

export const arms = [-1, 1].map(makeArm);
for (const shape of [cap,body,foot,hatBrim,...arms]) shape.computeVertexNormals();

export function characterMaterial(mode, pigments, viewDirection, armSide=0, footTone=pigments.bodyColor) {
  return new T.ShaderMaterial({
    side:T.FrontSide,
    clipping:true,
    stencilWrite:true,
    stencilRef:1,
    stencilZPass:T.ReplaceStencilOp,
    uniforms:{
      ...Object.fromEntries(Object.entries(pigments).map(([id,value])=>[id,{value}])),
      mode:{value:mode},armSide:{value:armSide},footTone:{value:footTone},viewDirection,
    },
  vertexShader:`
    #include <clipping_planes_pars_vertex>
    attribute vec2 surfaceFrame;
    varying vec3 form;
    varying vec3 armNormal;
    varying vec2 frame;
    void main() {
      form = position;
      armNormal = normal;
      frame = surfaceFrame;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <clipping_planes_vertex>
    }`,
  fragmentShader:`
    #include <clipping_planes_pars_fragment>
    uniform sampler2D faceArt;
    uniform sampler2D hatArt;
    uniform sampler2D bodyArt;
    uniform vec3 skin, pale, rim, seam, sole, brimUnder, brimEdge, sideInk;
    uniform vec3 topHighlight, footHighlight, footTone;
    uniform vec3 viewDirection;
    uniform float armSide;
    uniform vec3 bodyColor, handColor, armColor, shellGlint;
    uniform int mode;
    varying vec3 form;
    varying vec3 armNormal;
    varying vec2 frame;
    vec3 artwork(vec3 base, sampler2D sheet, vec2 paper, vec4 box, float strength) {
      vec2 uv = vec2((paper.x-box.x)/box.z, 1.0-(paper.y-box.y)/box.w);
      if (min(uv.x,uv.y) < 0.0 || max(uv.x,uv.y) > 1.0) return base;
      vec4 paint = texture2D(sheet,uv);
      return mix(base,paint.rgb,paint.a*strength);
    }
    float lineDistance(vec2 p,vec2 a,vec2 b) {
      vec2 delta=p-a, segment=b-a;
      return length(delta - segment*clamp(dot(delta,segment)/dot(segment,segment),0.,1.));
    }
    float curve(vec2 point, vec2 start, vec2 controlA, vec2 controlB, vec2 finish) {
      vec2 end=start;
      float distance=1.0;
      for (int i=1;i<=16;i++) {
        float t=float(i)/16.0, s=1.0-t;
        vec2 next=s*s*s*start+3.0*s*s*t*controlA+3.0*s*t*t*controlB+t*t*t*finish;
        distance=min(distance,lineDistance(point,end,next));
        end=next;
      }
      return distance;
    }
    vec2 armPoint(vec3 point, vec2 tangent) {
      return vec2(dot(point.xz,tangent),point.y);
    }
    float currentArmCrease() {
      float nearSide = viewDirection.x*armSide;
      float visible = smoothstep(-.59,-.20,nearSide);
      if (visible == 0.0) return 0.0;
      float profile = smoothstep(.26,.96,nearSide);
      vec2 tangent = vec2(viewDirection.z,-viewDirection.x);
      vec3 point = form-vec3(.64*armSide,0.0,.06);
      // One open curve per arm. Its endpoints and handles follow the turn
      // from the original short front crease into the side-view U.
      vec2 start = armPoint(mix(vec3(-.015*armSide,.299,0.0),vec3(.079*armSide,.442,-.094),profile),tangent);
      vec2 handleA = armPoint(mix(vec3(-.028*armSide,.302,0.0),vec3(.098*armSide,.326,-.142),profile),tangent);
      vec2 handleB = armPoint(mix(vec3(-.045*armSide,.325,0.0),vec3(.114*armSide,.266,.035),profile),tangent);
      vec2 finish = armPoint(mix(vec3(-.050*armSide,.347,0.0),vec3(.068*armSide,.436,.076),profile),tangent);
      float distance = curve(armPoint(point,tangent),start,handleA,handleB,finish);
      float surface = smoothstep(.17,.55,dot(normalize(armNormal),viewDirection));
      return (1.0-smoothstep(.0045,.0095,distance))*surface*visible;
    }
    void main() {
      #include <clipping_planes_fragment>
      vec3 color=skin;
      float y=frame.y, azimuth=abs(frame.x), artY=213.0-form.y/.012;
      float x=form.x;
      if (mode == 0) {
        float seamY=1.752+.066*pow(abs(sin(frame.x)),3.0)+.017*sin(frame.x);
        float rimY=.589+.108*pow(abs(sin(frame.x)),2.0);
        color=mix(rim,color,smoothstep(rimY-.006,rimY+.006,y));
        float markDepth=clamp((seamY-y)/.70,0.0,1.0);
        float markCenter=-.76-.31*markDepth;
        float markWidth=.104*(1.0-smoothstep(.41,1.0,markDepth));
        float mark=(1.0-smoothstep(markWidth-.004,markWidth+.004,abs(frame.x-markCenter)))
          *step(y,seamY)*(1.0-smoothstep(.94,1.0,markDepth));
        color=mix(color,shellGlint,mark);
        color=mix(color,seam,smoothstep(seamY-.011,seamY-.004,y));
        color=mix(color,pale,smoothstep(seamY+.008,seamY+.014,y));
        if (y>seamY+.012 && azimuth < 1.57) {
          float leftGlint=curve(vec2(frame.x,y),vec2(-1.01,1.930),vec2(-.98,2.023),vec2(-.75,2.057),vec2(-.49,2.054));
          float rightGlint=curve(vec2(frame.x,y),vec2(.81,2.061),vec2(.91,2.051),vec2(.985,2.016),vec2(1.035,1.969));
          color=mix(color,topHighlight,1.0-smoothstep(.009,.015,min(leftGlint,rightGlint)));
          color=artwork(color,hatArt,vec2(150.0+x/.012,artY),vec4(68,32,155,116),1.0-smoothstep(.68,1.01,azimuth));
        }
        // Keep artwork on the character's front. It foreshortens with the
        // shell at oblique angles instead of being stretched around its sides.
        if (azimuth < 1.54) {
          color=artwork(color,faceArt,vec2(150.0+x/.012,artY),vec4(74,64,152,96),
            1.0-smoothstep(1.18,1.53,azimuth));
        }
        // The shell's original lower join is a curved ink line, independent
        // of the outline used for the assembled silhouette.
        float join=.474+.12*x*x;
        float joinWidth=.012*(1.0-smoothstep(.49,.64,abs(x)));
        float joinStroke=1.0-smoothstep(joinWidth*.62,joinWidth+.002,abs(y-join));
        float joinEnd=smoothstep(.57,.61,abs(form.z));
        color=mix(color,seam,joinStroke*.90*joinEnd);
      } else if (mode == 1) {
        color=bodyColor;
        if (azimuth < 1.53) color=artwork(color,bodyArt,vec2(150.0+x/.012,artY),vec4(80,168,143,45),1.0-smoothstep(1.02,1.53,azimuth));
      } else if (mode == 2) {
        float progress=clamp((form.x+1.215)/.79,0.0,1.0);
        float mid=1.82+.086*progress+.010*sin(progress*3.14159);
        float underside=1.0-smoothstep(mid-.025,mid-.013,form.y);
        color=mix(brimUnder,pale,1.0-underside);
        color=mix(color,brimEdge,underside*.64*(1.0-smoothstep(.44,.84,progress)));
      } else if (mode == 3) {
        float soleHeight=.069+.013*pow(abs(sin(frame.x)),3.0)-.008*cos(frame.x);
        color=mix(sole,footTone,smoothstep(soleHeight-.003,soleHeight+.004,y));
        float glint=curve(vec2(form.x,y),vec2(-.190,.104),vec2(-.152,.086),vec2(-.100,.080),vec2(-.055,.089));
        float footGlint=1.0-smoothstep(.004,.008,glint);
        float onToe=smoothstep(.34,.68,abs(cos(frame.x)));
        float profileGlint=1.0-smoothstep(.003,.006,curve(vec2(form.z,y),vec2(.043,.104),vec2(.068,.092),vec2(.101,.089),vec2(.132,.095)));
        float atSide=smoothstep(.86,.98,abs(sin(frame.x)));
        color=mix(color,footHighlight,max(footGlint*onToe,profileGlint*atSide)*.78);
      } else {
        color=mix(handColor,armColor,smoothstep(.29,.35,y));
        color=mix(color,sideInk,currentArmCrease());
      }
      gl_FragColor=vec4(color,1);
      #include <colorspace_fragment>
    }`
  });
}
