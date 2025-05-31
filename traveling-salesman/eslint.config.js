import { defineConfig } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from '@vue/eslint-config-prettier'
import pluginOxlint from 'eslint-plugin-oxlint'

export default defineConfig({
  plugins: {
    vue: pluginVue,
    oxlint: pluginOxlint
  },
  extends: [
    'plugin:vue/vue3-recommended',
    configPrettier
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off'
  }
})
