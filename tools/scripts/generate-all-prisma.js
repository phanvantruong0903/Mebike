import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();

function findPrismaSchemas(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (
        file !== 'node_modules' &&
        file !== 'dist' &&
        file !== '.git' &&
        file !== '.nx'
      ) {
        findPrismaSchemas(filePath, fileList);
      }
    } else if (file === 'schema.prisma') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const schemas = findPrismaSchemas(rootDir);

if (schemas.length === 0) {
  process.exit(0);
}

schemas.forEach((schemaPath) => {
  try {
    execSync(`npx prisma generate --schema="${schemaPath}"`, {
      stdio: 'inherit',
    });
  } catch (error) {
    process.exit(1);
  }
});
