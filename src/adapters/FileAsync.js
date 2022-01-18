// Not using async/await on purpose to avoid adding regenerator-runtime
// to lowdb dependencies
const fs = require('fs-extra')
const pify = require('pify')
const steno = require('steno')
const Base = require('./Base')

const readFile = pify(fs.readFile)
const writeFile = pify(steno.writeFile)

class FileAsync extends Base {
  async read() {
    // fs.exists is deprecated but not fs.existsSync
    try {
      await fs.ensureFile(this.source)

      try {
        const data = await readFile(this.source, 'utf-8')
        // Handle blank file
        const trimmed = data.trim()
        return trimmed ? this.deserialize(trimmed) : this.defaultValue
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.message = `Malformed JSON in file: ${this.source}\n${e.message}`
        }
        throw e
      }
    } catch (err) {
      // Initialize
      await writeFile(this.source, this.serialize(this.defaultValue))
      return this.defaultValue
    }
  }

  write(data) {
    return writeFile(this.source, this.serialize(data))
  }
}

module.exports = FileAsync
