# 事实与现有代码核对

2026-10-30。审查范围：ARCHITECTURE-SPINE.md、implementation.md 对 app/src/game.ts、main.ts、scene.ts、audio.ts、art.ts 与 package.json/package-lock.json 的可实现性；未执行应用测试，未修改代码。

## 结论

通过，附一项低风险文件清单补充。现有代码确实采用纯状态转换与画面/音频外层；计划是在现有模块内添加本节需要的状态和显示，未引入没有实际需求的基础设施。技术版本均与当前清单及锁文件一致。新功能均被写作待实现目标，没有把当前样本或官方API文档冒充真机验收。

## 发现

### 低：需要明确 art.ts 的最小签名扩展

- 位置：ARCHITECTURE-SPINE.md 的 Structural Seed；implementation.md 的双标签/3D纹理约定。
- 证据：app/src/art.ts:37 的 faceTexture 参数目前仅接受 `'character' | 'C' | 'D' | 'E'`，app/src/scene.ts:146 把音名直接传给它。该函数虽用fillText绘制文字，当前类型接口还不能承接do/re/mi或双标签。
- 影响：若开发者严格按“只扩展game/main/scene/audio/style，art复用”理解，可能在scene内另写文字纹理，造成重复；或以类型断言绕过现有接口。
- 最小建议：将 art.ts 纳入可按需修改的文件，明确仅扩展已有文字纹理参数及排版来承接唱名/双标签；不创建纹理工厂或新资源系统。

## 已核对的事实

- game.ts 是无DOM/音频/计时依赖的 createGame/act，现有答案固定为C；新任务/记录/提交快照属于必要扩展。
- scene.ts 目前自行声明MaterialId，硬编码三枚材料纹理与颜色，并只移动C到安装位置；计划集中标识、统一显示模式和槽位副本恰好覆盖这些实际差异。
- audio.ts 的C/D/E频率与本节音区一致；Sound.note返回播放起点且每次会stop前一音。采用已有主循环逐音播放、禁止纸声竞争是可用的最小路线。
- main.ts 已有run、lifecycleEpoch、audioRequest以及后台/旋转/输入取消处理；新增submissionId与播放代次用于题内提交，解决现有run粒度不足，没有引入外部状态系统。
- package.json与package-lock.json的Three.js 0.186.1、TypeScript 7.0.2、Vite 8.3.4、Playwright 1.64.1一致；预览端口8877与文档一致。这里只验证配置事实，不声明依赖为当前最新或运行测试通过。
- 当前档案明确无持久化、没有真机通过证据，未把网页能力支持转换成iPhone实测结论。
