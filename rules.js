const changeRules = {
  //匹配第一种模式 <template></template>中的 abc="中文"  abc-abc='中文'等
  attrRule: {
    // type: /(\slabel\s*=[ ]*"\w*[\u4E00-\u9FA5]{1,}\w*")|(label=[ ]*'\w*[\u4E00-\u9FA5]{1,}\w*')/g,
    // reg1: /("\w*[\u4E00-\u9FA5]{1,}\w*")|('\w*[\u4E00-\u9FA5]{1,}\w*')/g,
    
    // 增加 少部分中英文掺杂文本判断，以及句尾（元）等单位判定
    type: /\b[\w-]+\s*=\s*("([\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)]*[\u4E00-\u9FA5]{1,}[\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)]*)+"|'([\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)]*[\u4E00-\u9FA5]{1,}[\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)]*)+')/g,
    reg1: /("([^"\n]*[\u4E00-\u9FA5]{1,}[^"\n]*)+")|('([^'\n]*[\u4E00-\u9FA5]{1,}[^'\n]*)+')/,
    reg2: /^"|^'|"$|'$/g,
    sliceFlag: "=",
    changeContent: function(keyContent, prefix) {
      return `:${prefix}="$t('${keyContent}')"`
    }
  },

  //匹配第二种模式  <template></template>中的>XXX<  > XXX <
  contentRule: {
    type: />([^\<\>]*[\u4E00-\u9FA5]{1,}[^\<\>]*)+</g,
    reg2: /^>[\s]*|[\s]*<$/g,
    changeContent: function(keyContent, elementFlag, prefix) {
      return `>{{ $t("${keyContent}") }}<`
    }
  },
  // 匹配第三种模式。<script></script>模块中的 "中文"或'中文'
  // 注意项目Eslint规则，需要 " 或 '
  scriptRule: {
    type: /(([^!=]=)|:|\(|\+)\s*(("([^"\n]*[\u4E00-\u9FA5]{1,}[^"\n]*)+")|('([^'\n]*[\u4E00-\u9FA5]{1,}[^'\n]*)+'))(?!\s*(!=|==)=?)/g,
    reg1: /(?<![\u4E00-\u9FA5])("([^"\n]*[\u4E00-\u9FA5]{1,}[^"\n]*)+")|('([^'\n]*[\u4E00-\u9FA5]{1,}[^'\n]*)+')/,
    reg2: /^"|^'|'$|"$/g,
    changeContent: function(keyContent, prefix) {
      return `${prefix} this.$t('${keyContent}')`
    }
  },

  scriptRuleOrigin: {
    type: /(?<!(!=|==)=?\s*)(("([\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\),]*[\u4E00-\u9FA5]{1,}[\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)，！？]*)+")|('([\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)，！？]*[\u4E00-\u9FA5]{1,}[\s\w\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\(\)]*)+'))(?!\s*(!=|==)=?)/g,
    reg2:  /^"|^'|'$|"$/g,
    changeContent: function(keyContent) {
      return `this.$t('${keyContent}')`
    }
  },
  // 匹配采用:label的表格表头
  tableHeaderLabelRule: {
    type: /( *)(<el-table-column\s[^/>]*):label="\$t\('(lang\d+)'\)"([^/>]*)\/?>/g,
    reg1: /( *)(<el-table-column\s[^/>]*):label="\$t\('(lang\d+)'\)"([^/>]*)\/>/g,
    reg2: /( *)(<el-table-column\s[^/>]*):label="\$t\('(lang\d+)'\)"([^/>]*)>/g,
  }
}


module.exports = changeRules