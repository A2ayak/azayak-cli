const chalk = require('chalk')

module.exports = (type, message) => {
  console.log(chalk.hex(colors[type])(message));
}

const myLog = new Proxy(
  {
    _colors: {
      'primary': '#409EFF',
      'success': '#67C23A',
      'warning': '#E6A23C',
      'error': '#F56C6C',
      'info': '#909399',
      'default': '#409EFF'
    }
  },
  {
    get(obj, type) {
      return message => {
        console.log(chalk.hex(obj._colors[type] || obj._colors.default)(message));
      }
    }
  }
)

module.exports = myLog