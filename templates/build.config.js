module.exports = {
  projectName: '<%= projectName %>',
  outputRoot: 'dist-<%= projectName %>',
  defineConstants: <%- defineConstants %>,
  copy: {
    patterns: <%- patterns %>
  },
  sass: {
    resource: <%- resource %>
  }
}
