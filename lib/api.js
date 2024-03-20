const axios = require('axios')

// 拦截全局请求响应
axios.interceptors.response.use((res) => {
  return res.data
})

/**
 * 获取模板
 * @returns Promise
 */
async function getRepo(username = 'A2ayak') {
  return axios.get(`https://api.github.com/users/${username}/repos`)
}

/**
 * 获取仓库下的版本
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getTagsByRepo(username = 'A2ayak', repo) {
  return axios.get(`https://api.github.com/repos/${username}/${repo}/tags`)
}

module.exports = {
  getRepo,
  getTagsByRepo
}
