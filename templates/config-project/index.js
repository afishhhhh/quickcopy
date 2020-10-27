module.exports = {
  outputRoot: 'dist-<%= projectName %>',
  defineConstants: <%- defineConstants %>,
  copy: {
    patterns: <%- patterns %>
  }
}
