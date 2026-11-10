---
status: done
baseline_commit: f00bea88254739e6c2ba8abe002ac6f65c61ee23
---
# GitHub 自动发布
用户授权main推送后部署至43.142.118.254，并选择/music/路径。复用现有443 Caddy，其他路由保留。
执行：相对链接兼容本地与子路径；Actions测试构建产物；专用fretdeploy账号只拥有站点目录、无sudo；主机密钥固定；版本SHA目录原子切换，探针失败恢复旧软链。管理员pem不上传。
Given main push When tests/build成功 Then 部署并验证公网version.txt；Given PR When检查 Then不部署；Given发布失败 When探针不符 Then恢复前一版本。
改动：app/public跨页链接、vite base、.github/workflows/deploy.yml、deploy/activate.sh；服务器Caddy新增精确前缀路由。
验证：现有业务规则、构建、shell语法、三入口及资源探针、旧服务探针、Actions实际运行。

## 验证与审查
2026-11-10 本地15项规则与生产base构建通过；公网三页面、JS模块、跨页链接通过，原服务首页响应与变更前一致。
首轮Actions 42806212444成功，线上version.txt等于ac07fe8aa9851dea5ab1dd34f8e4ac121ac8efd8。证明GitHub runner可通过22连接，无需新增开放端口。
审查修复：重复SHA不覆盖已有版本，临时目录校验后移动；探针与锁有超时，首次失败移除current。普通部署不重启网关。
