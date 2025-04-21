import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
console.log(__filename, "##");
const __dirname = path.dirname(__filename);

// 配置类型定义
interface Config {
  sourceDir: string;
  outputPath: string;
  zipFileName: string;
}
// 默认配置
const defaultConfig: Config = {
  sourceDir: path.join(__dirname, "dist"), // 要打包的目录
  outputPath: path.join(__dirname, "archives"), // ZIP文件输出目录
  zipFileName: `bundle-${Date.now()}.zip`, // 动态生成文件名
};

// 主函数
async function createAndUploadZip(config: Config) {
  try {
    // 确保输出目录存在
    if (!fs.existsSync(config.outputPath)) {
      fs.mkdirSync(config.outputPath, { recursive: true });
    }

    const output = fs.createWriteStream(
      path.join(config.outputPath, config.zipFileName)
    );

    // 创建archiver实例
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 最高压缩级别
    });

    // 管道数据流
    archive.pipe(output);

    // 添加目录内容（保留目录结构）
    archive.directory(config.sourceDir, false);

    // 完成打包
    await archive.finalize();

    console.log(
      `✅ ZIP包创建成功: ${path.join(config.outputPath, config.zipFileName)}`
    );
    console.log(
      `📦 文件大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`
    );

    // 模拟上传（实际替换为你的上传逻辑）
    await simulateUpload(path.join(config.outputPath, config.zipFileName));
  } catch (err) {
    console.error("❌ 打包失败:", err);
    process.exit(1);
  }
}

// 模拟上传函数（替换为真实上传逻辑）
async function simulateUpload(filePath: string) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`🚀 模拟上传完成: ${filePath}`);
      resolve();
    }, 1500);
  });
}

// 真实上传示例（以SFTP为例）：
/*
import Client from 'ssh2-sftp-client';
async function realUpload(filePath: string) {
  const sftp = new Client();
  
  await sftp.connect({
    host: 'your.sftp.host',
    port: 22,
    username: 'user',
    password: 'pass'
  });

  await sftp.put(filePath, `/remote/path/${path.basename(filePath)}`);
  await sftp.end();
}
*/

// 执行脚本
createAndUploadZip(defaultConfig);
