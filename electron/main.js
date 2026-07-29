const { app, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')
const Module = require('module')
const { parse } = require('url')

const originalResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@prisma/client-') && request.includes('/runtime/')) {
    const fallback = request.replace(/^@prisma\/client-[^/]+/, '@prisma/client')
    try {
      return originalResolveFilename.call(this, fallback, parent, isMain, options)
    } catch (error) {
      // fall through to the original resolver
    }
  }

  return originalResolveFilename.call(this, request, parent, isMain, options)
}

const isDev = !app.isPackaged
const PORT = 3000
const URL = `http://localhost:${PORT}`

if (!isDev) {
  const nextDir = path.join(__dirname, '..')
  require('dotenv').config({ path: path.join(nextDir, '.env') })
}

if (!isDev) {
  const appRoot = path.join(__dirname, '..')
  const unpackedPrismaRoot = path.join(appRoot, 'node_modules', '@prisma')
  const appAsarUnpackedRoot = path.join(appRoot, 'resources', 'app.asar.unpacked', 'node_modules', '@prisma')

  if (!fs.existsSync(path.join(unpackedPrismaRoot, 'client', 'runtime', 'client.js')) && fs.existsSync(path.join(appAsarUnpackedRoot, 'client', 'runtime', 'client.js'))) {
    process.env.NODE_PATH = path.join(appAsarUnpackedRoot)
    require('module').Module._initPaths()
  }
}
console.log("DATABASE_URL =", process.env.DATABASE_URL)

let mainWindow = null
let server = null

async function startNextServer() {
  const nextDir = isDev ? process.cwd() : path.join(__dirname, '..')
  const next = require('next/dist/server/next')
  const nextApp = next({ dev: false, dir: nextDir })
  await nextApp.prepare()
  const handle = nextApp.getRequestHandler()
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    server.listen(PORT, () => {
      console.log(`Next.js server ready on port ${PORT}`)
      resolve()
    })
    server.on('error', reject)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, '..', 'public', 'Lambang_DPRD_Generik.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })

  mainWindow.loadURL(URL)
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(async () => {
  try {
    if (isDev) {
      console.log('Dev mode: waiting for existing Next.js server...')
      await new Promise((resolve, reject) => {
        const check = (attempt) => {
          if (attempt > 60) return reject(new Error('Server not ready'))
          http.get(URL, () => resolve()).on('error', () => setTimeout(() => check(attempt + 1), 1000))
        }
        check(0)
      })
    } else {
      console.log('Starting Next.js server...')
      await startNextServer()
    }
    console.log('Opening window...')
    createWindow()
  } catch (err) {
    console.error('Failed to start:', err)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  server?.close()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => server?.close())
