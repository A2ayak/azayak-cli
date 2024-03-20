#!/usr/bin/env node
// enter
const { program } = require('commander') // 总commander
const chalk = require('chalk') // 高亮
const Inquirer = require('inquirer') // 命令行交互工具
const setting = require('../package.json')
const figlet = require('figlet') // 文字提示
const templates = require('../lib/template')
const path = require('path')
const downloadGitRepo = require('download-git-repo')
const ora = require('ora')
const fs = require('fs-extra')
const { getRepo } = require('../lib/api')

// 解析用户执行时输入的参数
// process.argv 是 nodejs 提供的属性
// npm run server --port 3000
// 后面的 --port 3000 就是用户输入的参数

program.name('azayak-cli').usage(`<command> [option]`).version(`cli-version ${setting.version}`)

program
  .command('config [value]') // config 命令
  .description('inspect and modify the config')
  .option('-g, --get <key>', 'get value by key')
  .option('-s, --set <key> <value>', 'set option[key] is value')
  .option('-d, --delete <key>', 'delete option by key')
  .action((value, keys) => {
    // value 可以取到 [value] 值，keys会获取到命令参数
    console.log(value, keys)
  })

// 监听 --help 指令
program.on('--help', function () {
  console.log(
    '\r\n' +
      figlet.textSync('Azayak-Cli', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 150,
        whitespaceBreak: true
      })
  )

  // 前后两个空行调整格式，更舒适
  console.log()
  console.log(`Run ${chalk.cyan('azayak-cli <command> --help')} for detailed usage of given command.`)
  console.log()
})

program
  .command('create [projectName]')
  .description('创建模版')
  .option('-t, --template <template>', '模板名称')
  .action(async (projectName, options) => {
    // 1. 从模版列表中找到对应的模版
    let project = templates.find((template) => template.name === options.template)
    // 2. 如果匹配到模版就赋值，没有匹配到就是undefined
    let projectTemplate = project ? project.value : undefined
    console.log('命令行参数：', projectName, projectTemplate)
    // 3. 如果用户没有传入项目名称
    if (!projectName) {
      const { name } = await Inquirer.prompt({
        type: 'input',
        name: 'name',
        message: '请输入项目名称：'
      })
      projectName = name
    }
    console.log('项目名称：', projectName)
    // 4. 如果用户没有传入模板参数
    if (!projectTemplate) {
      const { isUseOnlineRepoList } = await Inquirer.prompt({
        type: 'confirm',
        name: 'isUseOnlineRepoList',
        message: '是否使用Github上的模板？'
      })
      let onlineTemplates = []
      if (isUseOnlineRepoList) {
        const getRepoLoading = ora('正在从github获取模板...')
        try {
          getRepoLoading.start()
          const res = await getRepo()
          onlineTemplates = res
            .filter(({ name }) => name.indexOf('template') !== -1)
            .map(({ name }) => ({
              name,
              value: `github:A2ayak/${name}#main`
            }))
        } finally {
          getRepoLoading.stop()
        }
      }
      // 新增选择模版代码
      const { template } = await Inquirer.prompt({
        type: 'list',
        name: 'template',
        message: '请选择模版：',
        choices: isUseOnlineRepoList && !!onlineTemplates.length ? onlineTemplates : templates // 模版列表
      })
      projectTemplate = template
    }
    console.log('已选模板：', projectTemplate)
    // 5. 下载模板
    const targetPath = path.join(process.cwd(), projectName)
    // 判断文件夹是否存在，存在就交互询问用户是否覆盖
    if (fs.existsSync(targetPath)) {
      const { force } = await Inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: '目录已存在，是否覆盖？'
      })
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(targetPath) : process.exit(1)
    }

    const loading = ora('拉取模板中...')
    loading.start()
    downloadGitRepo(projectTemplate, targetPath, { clone: true }, (err) => {
      loading.stop()
      if (err) {
        console.log(`${chalk.black.bgRedBright('拉取模板失败')}`, err)
      } else {
        console.log(`${chalk.black.bgGreenBright('拉取模板成功')}`)
      }
    })
  })

program.parse(process.argv)
