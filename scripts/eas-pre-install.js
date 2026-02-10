const fs = require("fs");
const path = require("path");

function chmodSafe(p, mode) {
  try {
    fs.chmodSync(p, mode);
  } catch (e) {
    console.log(`[chmod skipped] ${p}: ${e.message}`);
  }
}

function statLog(p) {
  try {
    const st = fs.lstatSync(p);
    console.log(
      `[stat] ${p} symlink=${st.isSymbolicLink()} dir=${st.isDirectory()} mode=${(st.mode & 0o777).toString(8)}`
    );
  } catch (e) {
    console.log(`[stat] ${p} not found`);
  }
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

if (process.env.EAS_BUILD_PLATFORM === "ios" || process.env.EAS_BUILD_PLATFORM === "android") {
  const projectRoot = process.cwd();
  const expoDir = path.join(projectRoot, ".expo");
  const cacheRoot = path.join(projectRoot, ".expo", "web", "cache", "production", "images");

  console.log("==> Preparing .expo cache dirs");
  statLog(expoDir);

  // まず権限を緩めに（存在する場合）
  if (fs.existsSync(expoDir)) {
    chmodSafe(expoDir, 0o777);
  }

  // 必要なディレクトリを事前作成
  mkdirp(cacheRoot);

  // 念のため配下も
  chmodSafe(expoDir, 0o777);
  chmodSafe(path.join(projectRoot, ".expo", "web"), 0o777);
  chmodSafe(path.join(projectRoot, ".expo", "web", "cache"), 0o777);
  chmodSafe(path.join(projectRoot, ".expo", "web", "cache", "production"), 0o777);
  chmodSafe(cacheRoot, 0o777);

  console.log("==> Prepared:", cacheRoot);
  statLog(expoDir);
}
