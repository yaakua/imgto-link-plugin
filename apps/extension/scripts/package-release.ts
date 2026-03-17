import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'

const dirname = fileURLToPath(new URL('./', import.meta.url))
const extensionRoot = path.join(dirname, '..')
const extensionPackageJsonPath = path.join(extensionRoot, 'package.json')
const distDir = path.join(extensionRoot, 'dist')
const publishPublicDir = '/Users/yangkui/workspace/fafafa-ai/fafafa-ai-publisher/apps/web/public'

async function main() {
  const packageJson = JSON.parse(await fs.readFile(extensionPackageJsonPath, 'utf8'))
  const version = packageJson.version

  if (!version) {
    throw new Error(`Version not found in ${extensionPackageJsonPath}`)
  }

  const zipFileName = `fafafa-plugin-${version}.zip`
  const zipFilePath = path.join(publishPublicDir, zipFileName)
  const latestFilePath = path.join(publishPublicDir, 'latest.txt')

  console.log(`\n=== FaFaFa-全部发 Package Release (version: ${version}) ===\n`)

  console.log('Building extension...')
  await execa('bun', ['scripts/cli.ts', 'build', '--release'], {
    cwd: extensionRoot,
    stdio: 'inherit',
  })

  console.log('\nPreparing publish directory...')
  await fs.mkdir(publishPublicDir, { recursive: true })
  await fs.rm(zipFilePath, { force: true })

  console.log(`Creating zip: ${zipFilePath}`)
  await execa('zip', ['-r', zipFilePath, '.'], {
    cwd: distDir,
    stdio: 'inherit',
  })

  console.log(`Updating latest version file: ${latestFilePath}`)
  await fs.writeFile(latestFilePath, `${version}\n`, 'utf8')

  console.log('\n=== Package release complete! ===')
  console.log(`Zip: ${zipFilePath}`)
  console.log(`Latest: ${version}`)
}

await main()
