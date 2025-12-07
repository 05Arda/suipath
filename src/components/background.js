"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- SHADER KODLARI ---

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  // --- 3D SIMPLEX NOISE FONKSİYONLARI ---
  // Kaynak: Ashima Arts / Stefan Gustavson
  // 2D yerine 3D kullanarak "kayma" yerine "şekil değiştirme" sağlıyoruz.
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  // --- FBM (Fractal Brownian Motion) ---
  // Bulut detaylarını oluşturmak için gürültü katmanlarını birleştirir
  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; ++i) { // 4 Katmanlı detay
      v += a * snoise(x);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    
    // --- HAREKET MANTIĞI ---
    // Zamanı UV koordinatlarına eklemek yerine (kayma),
    // Zamanı 3. Boyut (Z) olarak veriyoruz.
    // Bu sayede bulutlar olduğu yerde "kaynar" ve şekil değiştirir.
    
    float time = uTime * 0.15; // Şekil değiştirme hızı
    
    // Domain Warping (Sıvımsı bükülme efekti)
    // Gürültünün içine gürültü ekleyerek o fırtına kıvrımlarını yaratıyoruz.
    
    vec3 p = vec3(uv * 3.0, time); // Temel ölçek
    
    float q = fbm(p); // İlk katman
    
    // İkinci katman: İlk katmandan gelen değeri koordinat olarak kullan
    // Bu, bulutların "sürükleniyormuş" değil "birbirine karışıyormuş" gibi görünmesini sağlar.
    vec2 r = vec2(
        fbm(p + vec3(q) + vec3(1.7, 9.2, 0.15 * time)),
        fbm(p + vec3(q) + vec3(8.3, 2.8, 0.126 * time))
    );

    float f = fbm(p + vec3(r, 0.0));

    // Renk Karışımı
    // Değerleri 0-1 arasına sıkıştırıp renklere dağıtıyoruz
    
    vec3 color = mix(uColor1, uColor2, clamp((f*f)*4.0, 0.0, 1.0));
    color = mix(color, uColor3, clamp(length(r), 0.0, 1.0));
    
    // Ekstra kontrast ve kasvet için
    color = mix(color, uColor1, clamp(r.y, 0.0, 1.0));

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CloudMesh = () => {
  const mesh = useRef();

  // Kasvetli Renk Paleti (İsteğe göre değiştirilebilir)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Derin Siyah/Lacivert
      uColor1: { value: new THREE.Color("#19A7CE") },
      // Fırtına Moru/Mavisi
      uColor2: { value: new THREE.Color("#146C94") },
      // Sisli Gri/Mavi Detaylar
      uColor3: { value: new THREE.Color("#000000") },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default function GloomyBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: true }}
      >
        <CloudMesh />
      </Canvas>
    </div>
  );
}
