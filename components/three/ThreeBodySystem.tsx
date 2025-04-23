"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function ThreeBodySystem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // 添加轨道控制
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 创建恒星
    const createStar = (color: number, size: number) => {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
      });
      return new THREE.Mesh(geometry, material);
    };

    // 创建三颗恒星
    const star1 = createStar(0xff0000, 2); // 红色恒星
    const star2 = createStar(0x00ff00, 1.5); // 绿色恒星
    const star3 = createStar(0x0000ff, 1.8); // 蓝色恒星

    scene.add(star1, star2, star3);

    // 创建行星
    const createPlanet = (color: number, size: number) => {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
      });
      return new THREE.Mesh(geometry, material);
    };

    const planet = createPlanet(0x808080, 0.5); // 灰色行星
    scene.add(planet);

    // 创建星空背景
    const createStarfield = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const starCount = 2000;

      for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        vertices.push(x, y, z);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
      });

      return new THREE.Points(geometry, material);
    };

    const starfield = createStarfield();
    scene.add(starfield);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);

      // 更新恒星位置
      const time = Date.now() * 0.001;
      star1.position.x = Math.sin(time) * 10;
      star1.position.y = Math.cos(time) * 10;
      star2.position.x = Math.sin(time + (Math.PI * 2) / 3) * 10;
      star2.position.y = Math.cos(time + (Math.PI * 2) / 3) * 10;
      star3.position.x = Math.sin(time + (Math.PI * 4) / 3) * 10;
      star3.position.y = Math.cos(time + (Math.PI * 4) / 3) * 10;

      // 更新行星位置
      planet.position.x = Math.sin(time * 0.5) * 15;
      planet.position.y = Math.cos(time * 0.5) * 15;

      // 更新控制器
      controls.update();

      // 渲染场景
      renderer.render(scene, camera);
    };

    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // 创建 ResizeObserver 来监听容器大小变化
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // 清理函数
    return () => {
      resizeObserver.disconnect();
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
