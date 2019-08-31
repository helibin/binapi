## 项目分支管理

0. master 分支，每次发布成功之后会把发布后的代码merge到master，这个分支大家不用关心
0. dev分支，主开发分支，大家重点关注的分支，所有开发后完整的功能merge到dev
0. feature/xxx，新特性分支，由主开发人切出这个分支，面向新需求，如果需要多人合作，就把这个分支push到origin
0. pre-release/xxx, 预发布分支，由项目Leader切出这个分支并push到origin，用于预发布功能测试，合并所有迭代功能
0. release/xxx，主发布分支，由项目Leader切出这个分支并push到origin，对于需要这次发布的功能，都往这个分支merge
0. fixbug/xxx，这样的分支，由bug owner切出，不要push到origin，开发完，merge到相应的分支（从哪个分支切出来，再切回哪个分支）
