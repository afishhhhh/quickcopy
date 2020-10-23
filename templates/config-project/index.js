module.exports = {
  outputRoot: 'dist-<%= projectName %>',
  defineConstants: <%- defineConstants %>,
  // copy: {
  //   patterns: [
  //     {
  //       from: 'config/config.<%= projectName %>/project.config.json',
  //       to: 'dist.<%= projectName %>/project.config.json'
  //     }
  //   ]
  // }
}
