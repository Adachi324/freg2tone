---
status: in-progress
baseline_commit: f00bea88254739e6c2ba8abe002ac6f65c61ee23
---
# GitHub 自动发布
用户授权main推送后部署至43.142.118.254，并选择/music/路径。复用现有443 Caddy，其他路由保留。
执行：相对链接兼容本地与子路径；Actions测试构建产物；专用fretdeploy账号只拥有站点目录、无sudo；主机密钥固定；版本SHA目录原子切换，探针失败恢复旧软链。管理员pem不上传。
Given main push When tests/build成功 Then 部署并验证公网version.txt；Given PR When检查 Then不部署；Given发布失败 When探针不符 Then恢复前一版本。
改动：app/public跨页链接、vite base、.github/workflows/deploy.yml、deploy/activate.sh；服务器Caddy新增精确前缀路由。
验证：现有业务规则、构建、shell语法、三入口及资源探针、旧服务探针、Actions实际运行。
